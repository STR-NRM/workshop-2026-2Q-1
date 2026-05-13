import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { AppShell, PageHeader, Panel } from '../components/common/Layout';
import { baseVisibleQuestionCount, surveyInfo } from '../data/questions';
import styles from './Landing.module.css';

const runtimeMode =
  import.meta.env.VITE_USE_LOCAL_STORE === 'true' ||
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  !import.meta.env.VITE_FIREBASE_DATABASE_URL
    ? 'local'
    : 'firebase';

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startSurvey = async () => {
    setLoading(true);
    setError('');
    try {
      const { authService } = await import('../firebase/config');
      await authService.getOrCreateRespondentSession();
      navigate('/survey');
    } catch (err) {
      console.error(err);
      setError('설문을 시작하지 못했습니다. 네트워크 또는 Firebase 설정을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className={styles.content}>
        <PageHeader
          eyebrow={surveyInfo.organization}
          title={surveyInfo.title}
          description={surveyInfo.description}
          meta={
            <>
              <span>{surveyInfo.estimatedTime}</span>
              <span>{baseVisibleQuestionCount}개 기본 문항 + 역할/조건부 문항</span>
              <span>{runtimeMode === 'local' ? 'Local QA mode' : 'Firebase mode'}</span>
            </>
          }
        />

        <Panel className={styles.panel}>
          <section className={styles.notice}>
            <h2>응답 기준</h2>
            <p>
              최근 6주 동안의 실제 업무 경험을 기준으로 답해주세요. 판단하기 어렵거나 직접 경험하지
              않은 문항은 해당 없음/판단하기 어려움을 선택해도 됩니다.
            </p>
          </section>

          <div className={styles.principles}>
            <div>
              <strong>개인 평가 금지</strong>
              <span>응답은 특정 개인이나 직군의 성과 평가에 사용하지 않습니다.</span>
            </div>
            <div>
              <strong>워크샵 실행 중심</strong>
              <span>결과는 운영 병목과 4주 실행 실험 후보를 찾는 데 사용합니다.</span>
            </div>
            <div>
              <strong>익명 세션</strong>
              <span>이름이나 아이디 입력 없이 브라우저 세션으로 이어서 진행합니다.</span>
            </div>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <Button size="lg" fullWidth loading={loading} onClick={startSurvey}>
            설문 시작하기
          </Button>

          <p className={styles.footnote}>
            중간에 닫아도 같은 브라우저에서 이어서 진행할 수 있습니다. 다른 기기나 브라우저에서는 새
            익명 세션이 생성됩니다.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
