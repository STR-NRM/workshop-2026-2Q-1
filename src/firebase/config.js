import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import { get, getDatabase, onValue, ref, set, update } from 'firebase/database';
import { QUESTION_VERSION, SURVEY_ID } from '../data/questions';

const namespace = `surveys/${SURVEY_ID}`;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const defaultAnalysisEndpoint = firebaseConfig.projectId
  ? `https://asia-southeast1-${firebaseConfig.projectId}.cloudfunctions.net/generateWorkshopAnalysis`
  : '';

const analysisEndpoint = import.meta.env.VITE_AI_ANALYSIS_ENDPOINT || defaultAnalysisEndpoint;

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

const forceLocalStore = import.meta.env.VITE_USE_LOCAL_STORE === 'true';
export const usingLocalStore = forceLocalStore || !hasFirebaseConfig;

const app = usingLocalStore ? null : initializeApp(firebaseConfig);
export const auth = usingLocalStore ? null : getAuth(app);
export const database = usingLocalStore ? null : getDatabase(app);

const localKey = `nurimedia-workshop-${SURVEY_ID}`;
const localUidKey = `${localKey}-uid`;

function now() {
  return Date.now();
}

function makeUid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `local-${crypto.randomUUID()}`;
  return `local-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function readLocalStore() {
  const empty = { respondents: {}, responses: {}, analysis: {}, config: {} };
  if (typeof window === 'undefined') return empty;
  const raw = window.localStorage.getItem(localKey);
  if (!raw) return empty;
  try {
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

function writeLocalStore(nextStore) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(localKey, JSON.stringify(nextStore));
}

function getLocalUid() {
  if (typeof window === 'undefined') return 'local-server';
  let uid = window.localStorage.getItem(localUidKey);
  if (!uid) {
    uid = makeUid();
    window.localStorage.setItem(localUidKey, uid);
  }
  return uid;
}

export function getRuntimeMode() {
  return usingLocalStore ? 'local' : 'firebase';
}

export function getDataSourceInfo() {
  return {
    mode: getRuntimeMode(),
    projectId: firebaseConfig.projectId || null,
    databaseURL: firebaseConfig.databaseURL || null,
    namespace,
    hasFirebaseConfig,
  };
}

export const authService = {
  onAuthChanged(callback) {
    if (usingLocalStore) {
      callback({ uid: getLocalUid(), isAnonymous: true });
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  async getOrCreateRespondentSession() {
    if (usingLocalStore) {
      const uid = getLocalUid();
      const store = readLocalStore();
      if (!store.respondents[uid]) {
        store.respondents[uid] = {
          uid,
          startedAt: now(),
          lastUpdatedAt: now(),
          completed: false,
          currentQuestionId: null,
          questionVersion: QUESTION_VERSION,
        };
        writeLocalStore(store);
      }
      return { uid, respondent: store.respondents[uid] };
    }

    if (auth.currentUser && !auth.currentUser.isAnonymous) {
      await signOut(auth);
    }
    const credential = auth.currentUser?.isAnonymous
      ? { user: auth.currentUser }
      : await signInAnonymously(auth);
    const uid = credential.user.uid;
    const respondentRef = ref(database, `${namespace}/respondents/${uid}`);
    const snapshot = await get(respondentRef);

    if (!snapshot.exists()) {
      const respondent = {
        uid,
        startedAt: now(),
        lastUpdatedAt: now(),
        completed: false,
        currentQuestionId: null,
        questionVersion: QUESTION_VERSION,
      };
      await set(respondentRef, respondent);
      return { uid, respondent };
    }

    return { uid, respondent: snapshot.val() };
  },

  async signOut() {
    if (!usingLocalStore && auth.currentUser) await signOut(auth);
  },
};

export const respondentService = {
  async getRespondent(uid) {
    if (usingLocalStore) {
      return readLocalStore().respondents[uid] || null;
    }
    const snapshot = await get(ref(database, `${namespace}/respondents/${uid}`));
    return snapshot.exists() ? snapshot.val() : null;
  },

  async updateProgress(uid, currentQuestionId, visibleQuestionIds = []) {
    const patch = {
      currentQuestionId,
      visibleQuestionIds,
      lastUpdatedAt: now(),
      questionVersion: QUESTION_VERSION,
    };

    if (usingLocalStore) {
      const store = readLocalStore();
      store.respondents[uid] = { ...(store.respondents[uid] || { uid, startedAt: now() }), ...patch };
      writeLocalStore(store);
      return;
    }

    await update(ref(database, `${namespace}/respondents/${uid}`), patch);
  },

  async completeSurvey(uid, visibleQuestionIds = []) {
    const patch = {
      completed: true,
      completedAt: now(),
      lastUpdatedAt: now(),
      visibleQuestionIds,
      questionVersion: QUESTION_VERSION,
    };

    if (usingLocalStore) {
      const store = readLocalStore();
      store.respondents[uid] = { ...(store.respondents[uid] || { uid, startedAt: now() }), ...patch };
      writeLocalStore(store);
      return;
    }

    await update(ref(database, `${namespace}/respondents/${uid}`), patch);
  },

  async getAllRespondents() {
    if (usingLocalStore) return readLocalStore().respondents;
    const snapshot = await get(ref(database, `${namespace}/respondents`));
    return snapshot.exists() ? snapshot.val() : {};
  },
};

export const responseService = {
  async saveResponse(uid, question, value) {
    const payload = {
      value,
      type: question.type,
      questionId: question.id,
      questionVersion: QUESTION_VERSION,
      answeredAt: now(),
    };

    if (usingLocalStore) {
      const store = readLocalStore();
      store.responses[uid] = { ...(store.responses[uid] || {}), [question.id]: payload };
      store.respondents[uid] = {
        ...(store.respondents[uid] || { uid, startedAt: now(), completed: false }),
        lastUpdatedAt: now(),
      };
      writeLocalStore(store);
      return payload;
    }

    await set(ref(database, `${namespace}/responses/${uid}/${question.id}`), payload);
    return payload;
  },

  async getAllResponses(uid) {
    if (usingLocalStore) return readLocalStore().responses[uid] || {};
    const snapshot = await get(ref(database, `${namespace}/responses/${uid}`));
    return snapshot.exists() ? snapshot.val() : {};
  },

  async getAllData() {
    if (usingLocalStore) return readLocalStore().responses;
    const snapshot = await get(ref(database, `${namespace}/responses`));
    return snapshot.exists() ? snapshot.val() : {};
  },

  subscribeAll(callback) {
    if (usingLocalStore) {
      callback(readLocalStore().responses);
      return () => {};
    }
    return onValue(ref(database, `${namespace}/responses`), (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : {});
    });
  },
};

export const analysisService = {
  async getComprehensiveAnalysis() {
    if (usingLocalStore) return readLocalStore().analysis.comprehensive || null;
    const snapshot = await get(ref(database, `${namespace}/analysis/comprehensive`));
    return snapshot.exists() ? snapshot.val() : null;
  },

  async generateComprehensiveAnalysis(payload) {
    if (usingLocalStore) {
      throw new Error('AI 분석은 Firebase 연결 상태에서만 실행할 수 있습니다.');
    }
    if (!analysisEndpoint) {
      throw new Error('AI 분석 함수 URL이 설정되어 있지 않습니다.');
    }

    let response;
    try {
      response = await fetch(analysisEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error('AI 분석 함수에 연결할 수 없습니다. Firebase Functions 배포와 OPENAI_API_KEY secret 설정을 확인해주세요.');
    }
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(body.error || `AI 분석 요청이 실패했습니다. (${response.status})`);
    }

    return body.analysis;
  },
};

export const localDebugService = {
  clear() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(localKey);
    window.localStorage.removeItem(localUidKey);
  },

  exportStore() {
    return readLocalStore();
  },
};

export default app;
