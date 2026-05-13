import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { AppShell, Panel } from '../components/common/Layout';
import styles from './Complete.module.css';

export default function Complete() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <Panel className={styles.panel}>
        <div className={styles.mark} aria-hidden="true">
          ✓
        </div>
        <h1>설문이 제출되었습니다</h1>
        <p>
          응답은 워크샵에서 개인 평가가 아니라 운영 병목, 이견, 4주 실행 실험 후보를 정리하는 데
          사용됩니다.
        </p>
        <div className={styles.notice}>
          <strong>다음 단계</strong>
          <span>전체 응답이 모이면 결과 화면에서 집계와 워크샵 리포트를 확인합니다.</span>
        </div>
        <Button variant="secondary" onClick={() => navigate('/')}>
          처음 화면으로
        </Button>
      </Panel>
    </AppShell>
  );
}
