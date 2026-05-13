import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { AppShell, PageHeader, Panel } from '../components/common/Layout';
import { baseVisibleQuestionCount, surveyInfo } from '../data/questions';
import styles from './Landing.module.css';

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
      setError('설문을 시작하지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className={styles.content}>
        <PageHeader
          eyebrow={surveyInfo.organization}
          title="같이 일하는 방식을 더 쉽게 만들기 위한 사전 설문"
          description="이번 워크샵에서 막연한 이야기가 아니라, 실제 업무에서 어디가 막히고 무엇부터 바꾸면 좋을지 함께 확인하기 위한 설문입니다."
          meta={
            <>
              <span>{surveyInfo.estimatedTime}</span>
              <span>{baseVisibleQuestionCount}개 기본 문항</span>
              <span>역할과 경험에 따라 일부 문항이 달라집니다</span>
            </>
          }
        />

        <Panel className={styles.panel}>
          <section className={styles.heroNote}>
            <span>무엇을 보려고 하나요?</span>
            <strong>일을 더 잘 굴러가게 만드는 작은 합의점을 찾습니다.</strong>
            <p>
              제품 우선순위, 요구사항, 의사결정, 협업, 온보딩처럼 매일의 실행에 영향을 주는 부분을
              확인합니다. 결과는 워크샵에서 4주 안에 해볼 수 있는 운영 실험을 고르는 데 사용합니다.
            </p>
          </section>

          <div className={styles.focusGrid}>
            <div>
              <strong>어디서 막히는지</strong>
              <span>개인 탓이 아니라 반복되는 병목과 정보 흐름을 봅니다.</span>
            </div>
            <div>
              <strong>어디서 경험이 갈리는지</strong>
              <span>역할, 제품, 협업 접점에 따라 다르게 느끼는 지점을 봅니다.</span>
            </div>
            <div>
              <strong>무엇부터 바꿀지</strong>
              <span>워크샵 뒤 4주 안에 시작할 수 있는 작은 실험을 찾습니다.</span>
            </div>
          </div>

          <section className={styles.notice}>
            <h2>응답 기준</h2>
            <p>
              최근 6주 동안 실제로 겪은 업무를 기준으로 답해주세요. 좋은 이야기와 불편한 이야기 모두
              필요합니다. 다만 특정 개인 이름보다 반복되는 상황, 기준, 흐름 중심으로 적어주세요.
            </p>
          </section>

          <div className={styles.principles}>
            <div>
              <strong>개인 평가 금지</strong>
              <span>응답은 특정 개인이나 직군의 성과 평가에 사용하지 않습니다.</span>
            </div>
            <div>
              <strong>정답 없음</strong>
              <span>많이 아는 답보다 본인이 실제로 체감한 경험이 중요합니다.</span>
            </div>
            <div>
              <strong>같은 기기에서 이어하기</strong>
              <span>중간에 닫아도 같은 브라우저에서는 이어서 진행할 수 있습니다.</span>
            </div>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <Button size="lg" fullWidth loading={loading} onClick={startSurvey}>
            설문 시작하기
          </Button>

          <p className={styles.footnote}>
            이름이나 사번을 입력하지 않습니다. 휴대폰과 PC를 바꿔 접속하면 별도 응답으로 시작될 수 있으니,
            가능하면 한 기기에서 끝까지 진행해주세요.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
