import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import { get, getDatabase, onValue, ref, remove, set, update } from 'firebase/database';
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

async function ensureAnonymousAuth() {
  if (usingLocalStore) return null;
  if (auth.currentUser?.isAnonymous) return auth.currentUser;
  if (auth.currentUser && !auth.currentUser.isAnonymous) await signOut(auth);
  const credential = await signInAnonymously(auth);
  return credential.user;
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

    const user = await ensureAnonymousAuth();
    const uid = user.uid;
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

  async deleteResponse(uid, questionId) {
    if (usingLocalStore) {
      const store = readLocalStore();
      if (store.responses[uid]) {
        delete store.responses[uid][questionId];
      }
      writeLocalStore(store);
      return;
    }

    await remove(ref(database, `${namespace}/responses/${uid}/${questionId}`));
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

  async saveComprehensiveAnalysis(analysis) {
    if (usingLocalStore) {
      const store = readLocalStore();
      store.analysis.comprehensive = analysis;
      writeLocalStore(store);
      return analysis;
    }

    await ensureAnonymousAuth();
    await set(ref(database, `${namespace}/analysis/comprehensive`), analysis);
    return analysis;
  },

  async getComparisonAnalysis() {
    if (usingLocalStore) return readLocalStore().analysis.comparison || null;
    const snapshot = await get(ref(database, `${namespace}/analysis/comparison`));
    return snapshot.exists() ? snapshot.val() : null;
  },

  async saveComparisonAnalysis(analysis) {
    if (usingLocalStore) {
      const store = readLocalStore();
      store.analysis.comparison = analysis;
      writeLocalStore(store);
      return analysis;
    }

    await ensureAnonymousAuth();
    await set(ref(database, `${namespace}/analysis/comparison`), analysis);
    return analysis;
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
