import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { AppShell, Panel } from '../components/common/Layout';
import ProgressBar from '../components/common/ProgressBar';
import QuestionRenderer from '../components/survey/QuestionRenderer';
import {
  getVisibleQuestions,
  isAnswered,
  surveyInfo,
} from '../data/questions';
import { authService, respondentService, responseService } from '../firebase/config';
import styles from './Survey.module.css';

function toValueMap(savedResponses = {}) {
  return Object.fromEntries(
    Object.entries(savedResponses).map(([questionId, response]) => [questionId, response?.value]),
  );
}

function validationText(question) {
  if (question.type === 'longText' && question.minLength) {
    return `이 문항은 ${question.minLength}자 이상 입력해야 넘어갈 수 있습니다.`;
  }
  if (question.type === 'multiChoice') return '하나 이상 선택해주세요.';
  return '응답을 선택해주세요.';
}

export default function Survey() {
  const navigate = useNavigate();
  const [uid, setUid] = useState('');
  const [responses, setResponses] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState('');

  const visibleQuestions = useMemo(() => getVisibleQuestions(responses), [responses]);
  const currentQuestion = visibleQuestions[currentIndex];
  const currentValue = currentQuestion ? responses[currentQuestion.id] : undefined;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === visibleQuestions.length - 1;

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const session = await authService.getOrCreateRespondentSession();
        const saved = await responseService.getAllResponses(session.uid);
        if (!alive) return;
        const values = toValueMap(saved);
        setUid(session.uid);
        setResponses(values);

        const initialVisible = getVisibleQuestions(values);
        const savedQuestionId = session.respondent?.currentQuestionId;
        const savedIndex = savedQuestionId
          ? initialVisible.findIndex((question) => question.id === savedQuestionId)
          : -1;
        setCurrentIndex(savedIndex >= 0 ? savedIndex : 0);
      } catch (err) {
        console.error(err);
        setError('설문 데이터를 불러오지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해주세요.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (currentIndex >= visibleQuestions.length) {
      setCurrentIndex(Math.max(visibleQuestions.length - 1, 0));
    }
  }, [currentIndex, visibleQuestions.length]);

  const persist = useCallback(
    async (question, value) => {
      if (!uid || !question) return;
      setSaving(true);
      setError('');
      try {
        await responseService.saveResponse(uid, question, value);
      } catch (err) {
        console.error(err);
        setError('응답 저장에 실패했습니다. 연결을 확인한 뒤 다시 시도해주세요.');
      } finally {
        setSaving(false);
      }
    },
    [uid],
  );

  useEffect(() => {
    if (!uid || !currentQuestion || currentQuestion.type !== 'longText') return undefined;
    const value = responses[currentQuestion.id];
    if (value === undefined) return undefined;
    const timer = window.setTimeout(() => {
      persist(currentQuestion, value);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [currentQuestion, persist, responses, uid]);

  const handleChange = async (value) => {
    if (!currentQuestion) return;
    setValidation('');
    setResponses((prev) => ({ ...prev, [currentQuestion.id]: value }));
    if (currentQuestion.type !== 'longText') {
      await persist(currentQuestion, value);
    }
  };

  const updateProgress = async (nextIndex) => {
    if (!uid) return;
    const nextQuestion = visibleQuestions[nextIndex];
    await respondentService.updateProgress(
      uid,
      nextQuestion?.id || null,
      visibleQuestions.map((question) => question.id),
    );
  };

  const goToIndex = async (nextIndex) => {
    const bounded = Math.min(Math.max(nextIndex, 0), visibleQuestions.length - 1);
    setCurrentIndex(bounded);
    setValidation('');
    await updateProgress(bounded);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = async () => {
    if (!currentQuestion) return;
    if (!isAnswered(currentQuestion, currentValue)) {
      setValidation(validationText(currentQuestion));
      return;
    }
    if (isLast) {
      await submit();
      return;
    }
    await goToIndex(currentIndex + 1);
  };

  const submit = async () => {
    if (!uid) return;
    const missing = visibleQuestions.filter((question) => !isAnswered(question, responses[question.id]));
    if (missing.length > 0) {
      const firstMissingIndex = visibleQuestions.findIndex((question) => question.id === missing[0].id);
      setCurrentIndex(firstMissingIndex);
      setValidation(validationText(missing[0]));
      return;
    }

    setSaving(true);
    setError('');
    try {
      await respondentService.completeSurvey(
        uid,
        visibleQuestions.map((question) => question.id),
      );
      navigate('/complete', { replace: true });
    } catch (err) {
      console.error(err);
      setError('최종 제출에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <Panel className={styles.loadingPanel}>설문을 불러오는 중입니다.</Panel>
      </AppShell>
    );
  }

  if (error && !currentQuestion) {
    return (
      <AppShell>
        <Panel className={styles.loadingPanel}>
          <p>{error}</p>
          <Button onClick={() => navigate('/')}>처음으로</Button>
        </Panel>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={styles.wrap}>
        <header className={styles.top}>
          <div>
            <p className={styles.org}>{surveyInfo.organization}</p>
            <h1>{surveyInfo.shortTitle}</h1>
          </div>
          <span className={styles.saveState}>{saving ? '저장 중' : '자동 저장'}</span>
        </header>

        <ProgressBar current={currentIndex + 1} total={visibleQuestions.length} />

        {error ? <p className={styles.error}>{error}</p> : null}

        <Panel>
          {currentQuestion ? (
            <QuestionRenderer
              question={currentQuestion}
              value={currentValue}
              onChange={handleChange}
              validationMessage={validation}
            />
          ) : null}
        </Panel>

        <footer className={styles.nav}>
          <Button variant="ghost" disabled={isFirst || saving} onClick={() => goToIndex(currentIndex - 1)}>
            이전
          </Button>
          <Button variant={isLast ? 'primary' : 'secondary'} disabled={saving} onClick={goNext}>
            {isLast ? '최종 제출' : '다음'}
          </Button>
        </footer>
      </div>
    </AppShell>
  );
}
