import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { AppShell, PageHeader, Panel } from '../components/common/Layout';
import MarkdownReport from '../components/report/MarkdownReport';
import { analysisService, respondentService, responseService } from '../firebase/config';
import { buildDashboardStats, filterCurrentSurveyData } from '../utils/analytics';
import { buildComparisonAiPayload, buildComparisonDataset } from '../utils/comparisonAnalysis';
import {
  comparisonAnalysisConfigs,
  comparisonAnalysisTypes,
  requestComparisonAnalysis,
} from '../utils/comparisonOpenaiAnalysis';
import styles from './Comparison.module.css';

function formatAverage(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return value.toFixed(2);
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return `${Math.round(value * 100)}%`;
}

function formatDelta(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}`;
}

function formatTime(timestamp) {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString('ko-KR');
}

function Metric({ label, value, hint }) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

function ModeSwitch({ mode, onChange }) {
  return (
    <div className={styles.modeSwitch} role="group" aria-label="비교 화면 구분">
      <button
        type="button"
        className={mode === 'basic' ? styles.activeMode : ''}
        onClick={() => onChange('basic')}
      >
        <strong>기본 비교</strong>
        <span>AI 없이 계산한 문항·축·서술형 변화입니다.</span>
      </button>
      <button
        type="button"
        className={mode === 'ai' ? styles.activeMode : ''}
        onClick={() => onChange('ai')}
      >
        <strong>AI 비교</strong>
        <span>비교 편지와 전문가식 해석 리포트입니다.</span>
      </button>
    </div>
  );
}

function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          type="button"
          className={activeTab === id ? styles.activeTab : ''}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SignalPill({ signal }) {
  return <span className={`${styles.signalPill} ${styles[signal.tone] || ''}`}>{signal.label}</span>;
}

function ScoreLine({ label, value, muted = false }) {
  const width = value === null || value === undefined ? 0 : Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <div className={styles.scoreLine}>
      <div className={styles.scoreLabel}>
        <span>{label}</span>
        <strong>{formatAverage(value)}</strong>
      </div>
      <div className={styles.scoreTrack} aria-hidden="true">
        <span className={muted ? styles.mutedBar : ''} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function Overview({ comparison }) {
  const topImprovement = comparison.improvements[0];
  const topAttention = comparison.attention[0];

  return (
    <div className={styles.stack}>
      <Panel className={styles.explainPanel}>
        <strong>비교 기준</strong>
        <p>
          작년 설문은 스쿼드 전환 초기 회고이고, 올해 설문은 AI 사업부가 커진 뒤의 일하는 방식 점검입니다.
          그래서 같은 듯 보이는 문항도 직접 비교, 제한 비교, 참고 비교로 나누어 봅니다.
        </p>
      </Panel>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span>가장 큰 개선 후보</span>
          <strong>{topImprovement?.title || '-'}</strong>
          <p>{topImprovement ? `평균 변화 ${formatDelta(topImprovement.averageDelta)}` : '올해 응답이 더 쌓이면 계산됩니다.'}</p>
        </div>
        <div className={styles.summaryCard}>
          <span>먼저 확인할 후보</span>
          <strong>{topAttention?.title || '-'}</strong>
          <p>{topAttention ? `평균 변화 ${formatDelta(topAttention.averageDelta)}` : '올해 응답이 더 쌓이면 계산됩니다.'}</p>
        </div>
        <div className={styles.summaryCard}>
          <span>직접 비교 제외</span>
          <strong>{comparison.rows.filter((row) => !row.numericComparisonAllowed).length}개</strong>
          <p>응답 방식, 문항 방향, 역할 분기 차이 때문에 숫자 변화로 단정하지 않는 항목입니다.</p>
        </div>
      </div>

      <div className={styles.cardGrid}>
        {comparison.improvements.map((row) => (
          <div key={row.id} className={styles.deltaCard}>
            <SignalPill signal={row.signal} />
            <h3>{row.title}</h3>
            <ScoreLine label="2025" value={row.legacy.average} muted />
            <ScoreLine label="2026" value={row.current.average} />
            <p>{row.signal.description}</p>
          </div>
        ))}
        {comparison.attention.map((row) => (
          <div key={row.id} className={styles.deltaCard}>
            <SignalPill signal={row.signal} />
            <h3>{row.title}</h3>
            <ScoreLine label="2025" value={row.legacy.average} muted />
            <ScoreLine label="2026" value={row.current.average} />
            <p>{row.caveat}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchedRows({ rows }) {
  return (
    <Panel className={styles.tablePanel}>
      <div className={styles.panelHeader}>
        <span>같거나 유사한 문항 변화</span>
        <p>평균 변화는 M1/M2 중 숫자 비교가 허용된 항목에만 표시합니다.</p>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.compareTable}>
          <thead>
            <tr>
              <th>비교 항목</th>
              <th>등급</th>
              <th>2025</th>
              <th>2026</th>
              <th>변화</th>
              <th>해석</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.title}</strong>
                  <small>{row.rationale}</small>
                </td>
                <td>{row.level}</td>
                <td>
                  <strong>{row.legacy.type === 'choice' ? formatPercent(row.legacy.positiveRatio) : formatAverage(row.legacy.average)}</strong>
                  <small>{row.legacy.n ? `n=${row.legacy.n}` : '-'}</small>
                </td>
                <td>
                  <strong>{formatAverage(row.current.average)}</strong>
                  <small>{row.current.n ? `응답값 ${row.current.n}` : '-'}</small>
                </td>
                <td>
                  <strong>{formatDelta(row.averageDelta)}</strong>
                  <small>{row.favorableDelta !== null ? `호의 변화 ${formatPercent(row.favorableDelta)}` : '참고'}</small>
                </td>
                <td>
                  <SignalPill signal={row.signal} />
                  <small>{row.caveat}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function AxisRows({ constructs }) {
  return (
    <div className={styles.axisGrid}>
      {constructs.map((construct) => (
        <div key={construct.construct} className={styles.axisCard}>
          <div>
            <SignalPill signal={construct.signal} />
            <h3>{construct.construct}</h3>
          </div>
          <strong>{formatDelta(construct.averageDelta)}</strong>
          <p>
            비교 가능한 항목 {construct.comparableCount}개 기준입니다.
            숫자 비교가 어려운 문항은 아래 항목명에는 포함되지만 변화 평균에는 넣지 않았습니다.
          </p>
          <ul>
            {construct.rows.map((row) => <li key={row.id}>{row.title}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

function TextChange({ comparison }) {
  const textById = new Map(comparison.currentText.map((item) => [item.id, item]));

  return (
    <div className={styles.textGrid}>
      {comparison.qualitativeThemes.map((theme) => {
        const currentCount = theme.currentQuestionIds.reduce((sum, id) => sum + (textById.get(id)?.textValues?.length || 0), 0);
        return (
          <div key={theme.id} className={styles.textCard}>
            <span>{theme.legacyQuestionIds.join(', ')} → {theme.currentQuestionIds.join(', ')}</span>
            <h3>{theme.title}</h3>
            <p>{theme.summary}</p>
            <small>올해 연결 서술형 응답 {currentCount}개</small>
          </div>
        );
      })}
    </div>
  );
}

const basicTabs = [
  ['overview', '개요'],
  ['matched', '문항 변화'],
  ['axis', '축 변화'],
  ['text', '서술형 변화'],
];

const aiTabs = Object.values(comparisonAnalysisConfigs).map((config) => [config.tabId, config.tabLabel]);

export default function Comparison() {
  const [allResponses, setAllResponses] = useState({});
  const [respondents, setRespondents] = useState({});
  const [comparisonAnalysis, setComparisonAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [mode, setMode] = useState('basic');
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKey, setApiKey] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [runningTypes, setRunningTypes] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setDataError('');
    try {
      const [rawResponses, rawRespondents, savedComparison] = await Promise.all([
        responseService.getAllData(),
        respondentService.getAllRespondents(),
        analysisService.getComparisonAnalysis(),
      ]);
      const current = filterCurrentSurveyData(rawResponses, rawRespondents);
      setAllResponses(current.responses);
      setRespondents(current.respondents);
      setComparisonAnalysis(savedComparison);
    } catch (error) {
      console.error(error);
      setDataError(error.message || '비교 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dashboard = useMemo(() => buildDashboardStats(allResponses, respondents), [allResponses, respondents]);
  const comparison = useMemo(() => buildComparisonDataset(dashboard), [dashboard]);
  const visibleTabs = mode === 'ai' ? aiTabs : basicTabs;
  const activeAiConfig = Object.values(comparisonAnalysisConfigs).find((config) => config.tabId === activeTab);
  const activeReport = activeAiConfig ? comparisonAnalysis?.reports?.[activeAiConfig.type] : null;
  const generatedCount = Object.keys(comparisonAnalysis?.reports || {}).length;

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setActiveTab(nextMode === 'ai' ? comparisonAnalysisConfigs.comparisonLetter.tabId : 'overview');
  };

  const runComparisonReports = async () => {
    setAnalysisError('');
    setRunningTypes(comparisonAnalysisTypes);
    try {
      const payload = buildComparisonAiPayload(comparison);
      const reports = await Promise.all(
        comparisonAnalysisTypes.map(async (analysisType) => {
          const report = await requestComparisonAnalysis({ apiKey, payload, analysisType });
          return [analysisType, report];
        }),
      );
      const nextAnalysis = {
        analyzedAt: Date.now(),
        reports: Object.fromEntries(reports),
      };
      const saved = await analysisService.saveComparisonAnalysis(nextAnalysis);
      setComparisonAnalysis(saved);
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      setAnalysisError(error.message || '비교 리포트를 만들지 못했습니다.');
    } finally {
      setRunningTypes([]);
    }
  };

  return (
    <AppShell wide>
      <PageHeader
        eyebrow="2025 하반기 ↔ 2026 상반기"
        title="작년과 올해 워크샵 비교"
        description="같거나 유사한 문항은 변화 방향을 보고, 달라진 문항은 조직 맥락의 변화로만 조심스럽게 해석합니다."
        meta={
          <>
            <span>{loading ? '비교 데이터 불러오는 중' : '비교 데이터 준비됨'}</span>
            <span>{comparisonAnalysis?.analyzedAt ? `비교 리포트 생성 ${formatTime(comparisonAnalysis.analyzedAt)}` : '비교 리포트 미생성'}</span>
          </>
        }
      />

      <div className={styles.toolbar}>
        <div className={styles.navLinks}>
          <Link to="/admin">결과 페이지로 돌아가기</Link>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={loadData}>새로고침</button>
        </div>
        {mode === 'ai' ? (
          <button type="button" className={styles.generateLink} onClick={() => setIsDialogOpen(true)}>
            비교 리포트 생성/갱신
          </button>
        ) : null}
      </div>
      {dataError ? <p className={styles.error}>{dataError}</p> : null}

      <div className={styles.metrics}>
        <Metric label="2025 기준 응답" value={`${comparison.legacySurvey.validResponseCount}명`} hint={comparison.legacySurvey.validityRule} />
        <Metric label="2026 완료 응답" value={`${dashboard.completedCount}명`} hint="현재 설문 최종 제출 기준" />
        <Metric label="비교 매핑" value={`${comparison.rows.length}개`} hint="직접/제한/참고 비교 포함" />
        <Metric label="비교 리포트" value={`${generatedCount}/${comparisonAnalysisTypes.length}`} hint="편지, 종합, 문항, 서술형" />
      </div>

      <ModeSwitch mode={mode} onChange={changeMode} />
      <div className={styles.modeGuide}>
        {mode === 'ai'
          ? 'AI 비교는 기본 비교 결과를 바탕으로 해석을 돕는 보조 자료입니다. 비교 편지를 먼저 읽고, 종합·문항·서술형 리포트로 근거를 확인하세요.'
          : '기본 비교는 AI 없이 계산한 화면입니다. 문항이 달라진 곳은 숫자보다 매핑 등급과 주의점을 함께 봐야 합니다.'}
      </div>
      <Tabs tabs={visibleTabs} activeTab={activeTab} onChange={setActiveTab} />

      {mode === 'basic' && activeTab === 'overview' ? <Overview comparison={comparison} /> : null}
      {mode === 'basic' && activeTab === 'matched' ? <MatchedRows rows={comparison.rows} /> : null}
      {mode === 'basic' && activeTab === 'axis' ? <AxisRows constructs={comparison.constructs} /> : null}
      {mode === 'basic' && activeTab === 'text' ? <TextChange comparison={comparison} /> : null}

      {mode === 'ai' ? (
        <div className={styles.aiLayout}>
          <Panel className={styles.aiSide}>
            <strong>{activeAiConfig?.title}</strong>
            <p>비교 리포트는 올해 응답과 2025 집계 기준을 함께 보되, 문항이 달라진 부분은 단정하지 않도록 작성합니다.</p>
            <small>
              {runningTypes.length
                ? `생성 중: ${runningTypes.length}개 리포트`
                : activeReport
                  ? `생성됨: ${formatTime(activeReport.analyzedAt)}`
                  : '아직 생성되지 않았습니다.'}
            </small>
          </Panel>
          {activeReport?.result ? (
            <MarkdownReport text={activeReport.result} styles={styles} />
          ) : (
            <Panel className={styles.emptyReport}>
              아직 생성된 비교 리포트가 없습니다. 오른쪽 위의 생성 버튼으로 비교 리포트를 만들 수 있습니다.
            </Panel>
          )}
        </div>
      ) : null}

      {isDialogOpen ? (
        <div className={styles.dialogBackdrop} role="presentation">
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="comparison-report-dialog-title">
            <h2 id="comparison-report-dialog-title">비교 리포트 생성</h2>
            <p>비교 편지, 종합, 문항 변화, 서술형 변화 리포트 4개를 동시에 만듭니다.</p>
            <label>
              <span>리포트 생성용 키</span>
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="sk-..."
                disabled={runningTypes.length > 0}
              />
            </label>
            <small>브라우저에서 직접 요청하므로 완료될 때까지 이 화면을 유지하는 편이 안전합니다.</small>
            {analysisError ? <p className={styles.error}>{analysisError}</p> : null}
            <div className={styles.dialogActions}>
              <Button variant="secondary" onClick={() => setIsDialogOpen(false)} disabled={runningTypes.length > 0}>닫기</Button>
              <Button onClick={runComparisonReports} loading={runningTypes.length > 0}>4개 리포트 생성/갱신</Button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
