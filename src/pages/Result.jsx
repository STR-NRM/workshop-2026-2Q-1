import { useEffect, useMemo, useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Button from '../components/common/Button';
import { AppShell, PageHeader, Panel } from '../components/common/Layout';
import { questions, surveyInfo } from '../data/questions';
import {
  analysisService,
  getDataSourceInfo,
  respondentService,
  responseService,
  usingLocalStore,
} from '../firebase/config';
import { buildAiAnalysisPayload, buildDashboardStats, formatAverage, toPercent } from '../utils/analytics';
import { requestWorkshopAnalysis } from '../utils/openaiAnalysis';
import styles from './Result.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join('|') : String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(allResponses) {
  const header = ['respondentId', ...questions.map((question) => question.id)];
  const rows = Object.entries(allResponses || {}).map(([uid, responses]) => [
    uid,
    ...questions.map((question) => responses?.[question.id]?.value ?? ''),
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
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

function DataSourceInfo({ dataSource }) {
  const databaseHost = dataSource.databaseURL ? new URL(dataSource.databaseURL).host : 'not configured';
  return (
    <div className={styles.dataSource}>
      <span>mode: {dataSource.mode}</span>
      <span>project: {dataSource.projectId || 'not configured'}</span>
      <span>db: {databaseHost}</span>
      <span>path: {dataSource.namespace}</span>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className={styles.sectionTitle}>
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

const analysisConfigs = {
  comprehensive: {
    type: 'comprehensive',
    tabId: 'ai-comprehensive',
    tabLabel: 'AI 종합',
    eyebrow: 'AI Comprehensive',
    title: '종합 AI 리포트',
    description: '정량과 주관식을 함께 보고 워크샵 의제, 핵심 병목, 4주 실행 실험을 도출합니다.',
    buttonLabel: '종합 리포트 생성/갱신',
  },
  closedEnded: {
    type: 'closedEnded',
    tabId: 'ai-closed',
    tabLabel: 'AI 비주관식',
    eyebrow: 'AI Closed-ended',
    title: '비주관식 문항 AI 리포트',
    description: '리커트, 단일선택, 복수선택 결과만으로 정량 신호와 선택 분포를 해석합니다.',
    buttonLabel: '비주관식 리포트 생성/갱신',
  },
  textByQuestion: {
    type: 'textByQuestion',
    tabId: 'ai-text',
    tabLabel: 'AI 주관식',
    eyebrow: 'AI Text',
    title: '주관식 문항별 AI 리포트',
    description: '서술형 응답을 문항별로 나누어 반복 테마, 소수 의견, 토론 질문을 정리합니다.',
    buttonLabel: '주관식 리포트 생성/갱신',
  },
};

function percent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

function ratioPercent(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function choiceEntries(stat) {
  return Object.entries(stat?.choice || {}).sort((a, b) => b[1] - a[1]);
}

function topChoice(dashboard, questionId) {
  const stat = dashboard.questionStats.find((item) => item.question.id === questionId);
  const entries = choiceEntries(stat);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  if (!entries.length) return null;
  const [label, count] = entries[0];
  return { label, count, total, percent: ratioPercent(count, total) };
}

function scaleInterpretation(stat) {
  const average = stat.scale.average;
  const variance = stat.scale.variance;
  const naRatio = stat.scale.naRatio;
  if (average !== null && average < 3) return '평균이 3점 미만입니다. 워크샵에서 원인 구조를 먼저 확인할 후보입니다.';
  if (variance !== null && variance >= 1.2) return '응답 차이가 큽니다. 역할, 제품, 협업 접점에 따라 경험이 다른지 확인해야 합니다.';
  if (naRatio !== null && naRatio >= 0.3) return '해당 없음/판단 어려움 비율이 높습니다. 정보 접근성 또는 업무 접점 차이를 확인해야 합니다.';
  if (average !== null && average >= 4) return '상대적으로 안정적인 신호입니다. 유지할 운영 방식으로 남길 수 있는지 확인하세요.';
  return '뚜렷한 경고 신호보다는 토론에서 맥락을 보완할 문항입니다.';
}

function buildOverview(dashboard) {
  const completedRatio = dashboard.respondentCount ? percent(dashboard.completedCount / dashboard.respondentCount) : 0;
  const validAxes = dashboard.axisStats.filter((axis) => axis.average !== null && axis.average !== undefined);
  const lowestAxis = [...validAxes].sort((a, b) => a.average - b.average)[0] || null;
  const highestAxis = [...validAxes].sort((a, b) => b.average - a.average)[0] || null;
  const bottleneck = topChoice(dashboard, 'CHOICE01');
  const improvement = topChoice(dashboard, 'CHOICE02');
  const workstream = topChoice(dashboard, 'META_WORKSTREAM');
  const discussion = topChoice(dashboard, 'CHOICE06');
  const lowestQuestion = dashboard.lowAverage[0] || null;
  const splitQuestion = dashboard.highVariance[0] || null;

  const headline = dashboard.respondentCount
    ? `${dashboard.respondentCount}명 응답 기준으로 가장 먼저 볼 축은 ${lowestAxis?.axis || '아직 없음'}입니다.`
    : '아직 응답 데이터가 없어 결과를 해석할 수 없습니다.';

  return {
    headline,
    cards: [
      {
        label: '응답 상태',
        value: `${dashboard.completedCount}/${dashboard.respondentCount} 완료`,
        detail: `완료율 ${completedRatio}%. 표본 수가 적을수록 수치는 방향성 신호로만 봅니다.`,
      },
      {
        label: '가장 낮은 운영 축',
        value: lowestAxis ? `${lowestAxis.axis} ${formatAverage(lowestAxis.average)}` : '-',
        detail: '축 평균이 낮을수록 워크샵에서 구조를 먼저 확인할 후보입니다.',
      },
      {
        label: '상대적으로 강한 축',
        value: highestAxis ? `${highestAxis.axis} ${formatAverage(highestAxis.average)}` : '-',
        detail: '강한 축은 유지할 방식과 재사용 가능한 운영 습관을 찾는 데 사용합니다.',
      },
      {
        label: '가장 많이 선택된 병목',
        value: bottleneck ? bottleneck.label : '-',
        detail: bottleneck ? `${bottleneck.count}/${bottleneck.total} 선택, ${bottleneck.percent}%` : '선택형 응답이 아직 없습니다.',
      },
      {
        label: '4주 개선 우선 후보',
        value: improvement ? improvement.label : '-',
        detail: improvement ? `${improvement.count}/${improvement.total} 선택. 바로 실험 가능한 크기로 쪼개야 합니다.` : '선택형 응답이 아직 없습니다.',
      },
      {
        label: '주요 워크스트림',
        value: workstream ? workstream.label : '-',
        detail: workstream ? `${workstream.count}회 선택. 제품별 응답 쏠림이 있는지 해석에 반영합니다.` : '선택형 응답이 아직 없습니다.',
      },
      {
        label: '분과 토론 관심',
        value: discussion ? discussion.label : '-',
        detail: discussion ? `${discussion.percent}% 비중의 선호입니다. 실제 배정은 정량/주관식 신호와 함께 봅니다.` : '분과 선호 응답이 아직 없습니다.',
      },
      {
        label: '가장 약한 문항',
        value: lowestQuestion ? `${lowestQuestion.question.id}. ${lowestQuestion.question.title}` : '-',
        detail: lowestQuestion ? `평균 ${formatAverage(lowestQuestion.scale.average)}. 개인 문제가 아니라 구조 확인 후보입니다.` : '리커트 응답이 아직 없습니다.',
      },
      {
        label: '이견이 큰 문항',
        value: splitQuestion ? `${splitQuestion.question.id}. ${splitQuestion.question.title}` : '-',
        detail: splitQuestion ? `분산 ${formatAverage(splitQuestion.scale.variance)}. 경험 차이 또는 기준 차이를 확인하세요.` : '리커트 응답이 아직 없습니다.',
      },
    ],
  };
}

function OverviewCard({ item }) {
  return (
    <div className={styles.overviewCard}>
      <span>{item.label}</span>
      <strong>{item.value}</strong>
      <p>{item.detail}</p>
    </div>
  );
}

function SignalList({ title, description, items, metric, explanation }) {
  return (
    <div className={styles.signalGroup}>
      <div className={styles.signalHead}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {items.length ? (
        items.map((stat) => (
          <div key={stat.question.id} className={styles.signalItem}>
            <div>
              <strong>{stat.question.id}. {stat.question.title}</strong>
              <span>{stat.question.question}</span>
            </div>
            <div className={styles.signalMetric}>
              <b>{metric(stat)}</b>
              <small>{explanation(stat)}</small>
            </div>
          </div>
        ))
      ) : (
        <div className={styles.signalItem}>표시할 응답이 없습니다.</div>
      )}
    </div>
  );
}

function ScaleDistribution({ stat }) {
  const total = stat.scale.numericCount;
  const scores = [1, 2, 3, 4, 5];
  return (
    <div className={styles.scaleDistribution} aria-label={`${stat.question.id} 응답 분포`}>
      {scores.map((score) => {
        const count = stat.scale.distribution[score] || 0;
        const width = ratioPercent(count, total);
        return (
          <div
            key={score}
            className={`${styles.scaleSegment} ${styles[`score${score}`]}`}
            style={{ width: `${width}%` }}
            title={`${score}점 ${count}명`}
          >
            {width >= 12 ? `${score}` : ''}
          </div>
        );
      })}
      {!total ? <div className={styles.emptyBar}>점수 응답 없음</div> : null}
    </div>
  );
}

function ChoiceBars({ stat }) {
  const entries = choiceEntries(stat);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  return (
    <div className={styles.choiceBars}>
      {entries.length ? entries.map(([label, count]) => (
        <div key={label} className={styles.choiceBarRow}>
          <div className={styles.choiceBarLabel}>
            <span>{label}</span>
            <b>{count}회</b>
          </div>
          <div className={styles.choiceBarTrack}>
            <div style={{ width: `${ratioPercent(count, total)}%` }} />
          </div>
        </div>
      )) : <div className={styles.emptyBar}>응답 없음</div>}
    </div>
  );
}

function QuestionStatRow({ stat }) {
  const question = stat.question;

  if (question.type === 'scale5na') {
    return (
      <div className={styles.questionRow}>
        <div className={styles.questionCopy}>
          <strong>
            {question.id}. {question.title}
          </strong>
          <span>{question.question}</span>
          <small>{scaleInterpretation(stat)}</small>
        </div>
        <div className={styles.questionViz}>
          <ScaleDistribution stat={stat} />
          <div className={styles.statGrid}>
            <span>평균 {formatAverage(stat.scale.average)}</span>
            <span>1~2점 {toPercent(stat.scale.lowRatio)}</span>
            <span>4~5점 {toPercent(stat.scale.highRatio)}</span>
            {stat.scale.naCount ? <span>N/A {toPercent(stat.scale.naRatio)}</span> : null}
          </div>
        </div>
      </div>
    );
  }

  if (question.type === 'singleChoice' || question.type === 'multiChoice') {
    return (
      <div className={styles.questionRow}>
        <div className={styles.questionCopy}>
          <strong>
            {question.id}. {question.title}
          </strong>
          <span>{question.question}</span>
          <small>선택 비중이 높은 항목은 공통 인식 후보이고, 선택이 갈리면 경험 차이나 기준 차이를 토론해야 합니다.</small>
        </div>
        <div className={styles.questionViz}>
          <ChoiceBars stat={stat} />
        </div>
      </div>
    );
  }

  return null;
}

function renderInline(text, keyPrefix) {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function tableCells(line) {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableSeparator(line) {
  return tableCells(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function MarkdownReport({ text }) {
  const lines = String(text || '').split('\n');
  const nodes = [];
  let list = [];
  let table = [];

  const flushList = () => {
    if (!list.length) return;
    nodes.push(
      <ul key={`list-${nodes.length}`} className={styles.reportList}>
        {list.map((item, index) => <li key={`${item}-${index}`}>{renderInline(item, `list-${nodes.length}-${index}`)}</li>)}
      </ul>,
    );
    list = [];
  };

  const flushTable = () => {
    if (!table.length) return;
    const [header, ...rows] = table.filter((row) => !isTableSeparator(row));
    if (!header) {
      table = [];
      return;
    }
    const headerCells = tableCells(header);
    nodes.push(
      <div key={`table-${nodes.length}`} className={styles.reportTableWrap}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              {headerCells.map((cell, cellIndex) => (
                <th key={`${cell}-${cellIndex}`}>{renderInline(cell, `th-${cellIndex}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${row}-${rowIndex}`}>
                {tableCells(row).map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`} data-label={headerCells[cellIndex] || ''}>
                    {renderInline(cell, `td-${rowIndex}-${cellIndex}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    table = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      flushTable();
      return;
    }
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      table.push(line);
      return;
    }
    flushTable();
    if (line.startsWith('# ')) {
      flushList();
      nodes.push(<h2 key={index}>{line.replace(/^#\s*/, '')}</h2>);
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      nodes.push(<h3 key={index}>{line.replace(/^##\s*/, '')}</h3>);
      return;
    }
    if (line.startsWith('### ')) {
      flushList();
      nodes.push(<h4 key={index}>{line.replace(/^###\s*/, '')}</h4>);
      return;
    }
    if (/^[-*]\s+/.test(line)) {
      list.push(line.replace(/^[-*]\s+/, ''));
      return;
    }
    if (/^\d+\.\s+/.test(line)) {
      list.push(line.replace(/^\d+\.\s+/, ''));
      return;
    }
    flushList();
    nodes.push(<p key={index}>{renderInline(line, `p-${index}`)}</p>);
  });

  flushList();
  flushTable();
  return <article className={styles.reportBody}>{nodes}</article>;
}

function filterPayloadQuestions(payload, predicate, options = {}) {
  const questionStats = payload.questionStats.filter(predicate);
  const questionIds = new Set(questionStats.map((stat) => stat.id));
  const filterSignal = (items = []) => items.filter((item) => questionIds.has(item.id));

  return {
    ...payload,
    axisStats: options.includeAxisStats === false ? [] : payload.axisStats,
    questionStats,
    prioritySignals: {
      lowAverage: filterSignal(payload.prioritySignals?.lowAverage),
      highVariance: filterSignal(payload.prioritySignals?.highVariance),
      highNa: filterSignal(payload.prioritySignals?.highNa),
    },
  };
}

function payloadForAnalysis(type, payload) {
  if (type === 'closedEnded') return filterPayloadQuestions(payload, (stat) => stat.type !== 'longText');
  if (type === 'textByQuestion') {
    return filterPayloadQuestions(payload, (stat) => stat.type === 'longText', { includeAxisStats: false });
  }
  return payload;
}

function getStoredReport(analysis, type) {
  if (!analysis) return null;
  if (analysis.reports?.[type]) return analysis.reports[type];
  if (type === 'comprehensive' && analysis.result) {
    return {
      ...analysis,
      analysisType: 'comprehensive',
      title: '종합 리포트',
    };
  }
  return null;
}

function mergeAnalysisReport(existingAnalysis, report) {
  const previousReports = existingAnalysis?.reports ? { ...existingAnalysis.reports } : {};
  if (!previousReports.comprehensive && existingAnalysis?.result && !existingAnalysis.reports) {
    previousReports.comprehensive = {
      ...existingAnalysis,
      analysisType: 'comprehensive',
      title: '종합 리포트',
    };
  }

  const reports = {
    ...previousReports,
    [report.analysisType]: report,
  };
  const primary = reports.comprehensive || reports.closedEnded || reports.textByQuestion || report;

  return {
    result: primary.result,
    model: primary.model,
    reasoningEffort: primary.reasoningEffort,
    analyzedAt: Date.now(),
    reportVersion: '2026-05-13-analysis-suite-v2',
    inputSummary: primary.inputSummary,
    reports,
  };
}

function existingReportTypes(analysis) {
  if (!analysis) return [];
  if (analysis.reports) {
    return Object.keys(analysis.reports).filter((type) => analysis.reports[type]?.result);
  }
  return analysis.result ? ['comprehensive'] : [];
}

export default function Result() {
  const [dataError, setDataError] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [loading, setLoading] = useState(false);
  const [allResponses, setAllResponses] = useState({});
  const [respondents, setRespondents] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [openAiKey, setOpenAiKey] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [analysisRunningType, setAnalysisRunningType] = useState('');

  const dashboard = useMemo(
    () => buildDashboardStats(allResponses, respondents),
    [allResponses, respondents],
  );
  const overview = useMemo(() => buildOverview(dashboard), [dashboard]);
  const dataSource = useMemo(() => getDataSourceInfo(), []);

  const loadData = async () => {
    setLoading(true);
    setDataError('');
    try {
      const [responses, respondentData, analysisData] = await Promise.all([
        responseService.getAllData(),
        respondentService.getAllRespondents(),
        analysisService.getComprehensiveAnalysis(),
      ]);
      setAllResponses(responses || {});
      setRespondents(respondentData || {});
      setAnalysis(analysisData || null);
    } catch (err) {
      console.error(err);
      setDataError(err.message || '결과 데이터를 불러오지 못했습니다. Firebase 권한 또는 연결 상태를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!analysisRunningType) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [analysisRunningType]);

  const runAnalysis = async (analysisType) => {
    const config = analysisConfigs[analysisType];
    setActiveTab(config.tabId);
    setAnalysisError('');
    if (!openAiKey.trim()) {
      setAnalysisError('OpenAI API key를 입력해야 AI 분석을 생성할 수 있습니다.');
      return;
    }
    setAnalysisRunningType(analysisType);
    setAnalysisProgress(`${config.title}를 생성하는 중입니다. 이 탭을 닫거나 새로고침하지 마세요.`);
    try {
      const payload = buildAiAnalysisPayload(dashboard, allResponses, respondents);
      const generated = await requestWorkshopAnalysis({
        apiKey: openAiKey,
        payload: payloadForAnalysis(analysisType, payload),
        analysisType,
      });
      setAnalysisProgress(`${config.title}를 Firebase에 저장하는 중입니다.`);
      const nextAnalysis = mergeAnalysisReport(analysis, generated);
      const saved = await analysisService.saveComprehensiveAnalysis(nextAnalysis);
      setAnalysis(saved);
    } catch (err) {
      console.error(err);
      setAnalysisError(err.message || 'AI 분석 생성에 실패했습니다.');
    } finally {
      setAnalysisRunningType('');
      setAnalysisProgress('');
    }
  };

  const exportJson = () => {
    download(
      `workshop-${Date.now()}-responses.json`,
      JSON.stringify({ respondents, responses: allResponses, analysis }, null, 2),
      'application/json;charset=utf-8',
    );
  };

  const exportCsv = () => {
    download(`workshop-${Date.now()}-responses.csv`, buildCsv(allResponses), 'text/csv;charset=utf-8');
  };

  const axisChart = {
    labels: dashboard.axisStats.map((axis) => axis.axis),
    datasets: [
      {
        label: '평균',
        data: dashboard.axisStats.map((axis) => axis.average ?? 0),
        backgroundColor: '#111111',
        borderRadius: 3,
      },
    ],
  };
  const canRunAnalysis = !loading && dashboard.respondentCount > 0;
  const generatedReportTypes = existingReportTypes(analysis);
  const activeAnalysisConfig = Object.values(analysisConfigs).find((config) => config.tabId === activeTab);
  const activeReport = activeAnalysisConfig ? getStoredReport(analysis, activeAnalysisConfig.type) : null;

  return (
    <AppShell wide>
      <PageHeader
        eyebrow={surveyInfo.organization}
        title="워크샵 설문 결과 리포트"
        description="개인 평가가 아니라 운영 병목, 이견, 4주 실행 실험 후보를 찾기 위한 결과 화면입니다."
        meta={
          <>
            <span>{usingLocalStore ? 'Local QA mode' : 'Firebase mode'}</span>
            <span>{loading ? '동기화 중' : '동기화 완료'}</span>
            <span>{analysis?.analyzedAt ? `AI 분석 ${formatTime(analysis.analyzedAt)}` : 'AI 분석 대기'}</span>
          </>
        }
      />

      <div className={styles.actions}>
        <Button variant="secondary" onClick={loadData} loading={loading}>새로고침</Button>
        <Button variant="ghost" onClick={exportCsv}>CSV export</Button>
        <Button variant="ghost" onClick={exportJson}>JSON export</Button>
      </div>
      {dataError ? <p className={styles.error}>{dataError}</p> : null}
      <DataSourceInfo dataSource={dataSource} />

      <div className={styles.metrics}>
        <Metric label="응답 세션" value={`${dashboard.respondentCount}명`} hint="응답 시작 기준" />
        <Metric label="완료" value={`${dashboard.completedCount}명`} hint="최종 제출 기준" />
        <Metric label="문항 정의" value={`${questions.length}개`} hint="역할/조건부 포함" />
        <Metric label="AI 리포트" value={analysis ? '생성됨' : '미생성'} hint="결과 화면 버튼으로 생성" />
      </div>

      <div className={styles.tabs}>
        {[
          ['overview', '요약'],
          ['signals', '우선 신호'],
          ['questions', '문항별'],
          ['text', '서술형'],
          [analysisConfigs.comprehensive.tabId, analysisConfigs.comprehensive.tabLabel],
          [analysisConfigs.closedEnded.tabId, analysisConfigs.closedEnded.tabLabel],
          [analysisConfigs.textByQuestion.tabId, analysisConfigs.textByQuestion.tabLabel],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={activeTab === id ? styles.activeTab : ''}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <div className={styles.overviewLayout}>
          <Panel className={styles.panel}>
            <div className={styles.summaryHero}>
              <span>한눈에 보는 현재 신호</span>
              <strong>{overview.headline}</strong>
              <p>
                이 요약은 의사결정을 대신하지 않습니다. 워크샵에서 어떤 질문을 먼저 확인할지 좁히기 위한 운영 신호입니다.
              </p>
            </div>
            <div className={styles.overviewCards}>
              {overview.cards.map((item) => <OverviewCard key={item.label} item={item} />)}
            </div>
          </Panel>

          <div className={styles.grid}>
            <Panel className={styles.panel}>
              <SectionTitle
                eyebrow="Overview"
                title="축별 평균"
                description="5점 척도 문항을 운영 축별로 묶은 평균입니다. 응답 수가 적을 때는 방향성 신호로만 해석해야 합니다."
              />
              <div className={styles.chartWrap}>
                <Bar
                  data={axisChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    scales: {
                      y: {
                        min: 0,
                        max: 5,
                        ticks: { stepSize: 1, color: '#55524d' },
                        grid: { color: '#e5e1d8' },
                      },
                      x: {
                        ticks: { autoSkip: false, maxRotation: 45, minRotation: 0, color: '#55524d' },
                        grid: { color: '#eeeae2' },
                      },
                    },
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </Panel>

            <Panel className={styles.panel}>
              <SectionTitle
                eyebrow="Reading Guide"
                title="해석 기준"
                description="수치가 낮거나 높다는 사실보다, 왜 그런 경험 차이가 생겼는지 확인하는 것이 중요합니다."
              />
              <div className={styles.noteList}>
                <span><strong>낮은 평균</strong> 구조와 기준을 먼저 확인할 후보입니다.</span>
                <span><strong>큰 이견</strong> 제품, 역할, 협업 접점에 따라 경험이 갈릴 가능성이 있습니다.</span>
                <span><strong>N/A</strong> 모든 문항이 아니라 실제 접점 차이가 큰 문항에만 남겼습니다.</span>
                <span><strong>선택형 상위 항목</strong> 다수가 체감하는 병목 후보이며, 서술형과 함께 확인해야 합니다.</span>
              </div>
            </Panel>
          </div>
        </div>
      ) : null}

      {activeTab === 'signals' ? (
        <Panel className={styles.panel}>
          <SectionTitle
            eyebrow="Priority Signals"
            title="우선 확인할 신호"
            description="아래 신호는 결론이 아니라 워크샵에서 먼저 질문해야 할 후보입니다. 낮은 평균, 큰 이견, N/A는 각각 의미가 다릅니다."
          />
          <div className={styles.signalCards}>
            <SignalList
              title="평균 낮은 문항"
              description="대체로 좋지 않게 체감된 영역입니다. 원인이 사람인지가 아니라 구조, 기준, 정보 흐름인지 확인합니다."
              items={dashboard.lowAverage}
              metric={(stat) => formatAverage(stat.scale.average)}
              explanation={(stat) => `낮은 점수 비율 ${toPercent(stat.scale.lowRatio)}`}
            />
            <SignalList
              title="이견이 큰 문항"
              description="응답자마다 체감이 갈린 영역입니다. 제품/역할/협업 접점별 경험 차이를 확인해야 합니다."
              items={dashboard.highVariance}
              metric={(stat) => formatAverage(stat.scale.variance)}
              explanation={(stat) => `평균 ${formatAverage(stat.scale.average)}`}
            />
            <SignalList
              title="N/A 높은 문항"
              description="일부 구성원이 판단하기 어려운 영역입니다. 정보 접근성 또는 실제 업무 접점 차이일 수 있습니다."
              items={dashboard.highNa}
              metric={(stat) => toPercent(stat.scale.naRatio)}
              explanation={(stat) => `응답 수 ${stat.scale.answeredCount}`}
            />
          </div>
        </Panel>
      ) : null}

      {activeTab === 'questions' ? (
        <Panel className={styles.panel}>
          <SectionTitle
            eyebrow="Question Details"
            title="문항별 결과"
            description="리커트 문항은 1~5점 분포와 평균을, 선택형 문항은 선택 비중 막대를 함께 봅니다. 낮은 평균과 큰 분산은 바로 결론이 아니라 토론 후보입니다."
          />
          <div className={styles.questionList}>
            {dashboard.questionStats
              .filter((stat) => stat.answeredCount > 0 && stat.question.type !== 'longText')
              .map((stat) => <QuestionStatRow key={stat.question.id} stat={stat} />)}
          </div>
        </Panel>
      ) : null}

      {activeTab === 'text' ? (
        <Panel className={styles.panel}>
          <SectionTitle
            eyebrow="Text Responses"
            title="서술형 응답"
            description="개인 식별 가능 표현은 워크샵 공유 전에 반드시 제거해야 합니다."
          />
          <div className={styles.textList}>
            {dashboard.questionStats
              .filter((stat) => stat.question.type === 'longText')
              .map((stat) => (
                <section key={stat.question.id}>
                  <h3>{stat.question.id}. {stat.question.title}</h3>
                  {stat.textValues?.length ? (
                    stat.textValues.map((text, index) => <blockquote key={`${stat.question.id}-${index}`}>{text}</blockquote>)
                  ) : (
                    <p>응답 없음</p>
                  )}
                </section>
              ))}
          </div>
        </Panel>
      ) : null}

      {activeAnalysisConfig ? (
        <Panel className={styles.panel}>
          <div className={styles.reportHeader}>
            <SectionTitle
              eyebrow={activeAnalysisConfig.eyebrow}
              title={activeAnalysisConfig.title}
              description={activeAnalysisConfig.description}
            />
            <div className={styles.reportControls}>
              <label htmlFor="openai-key">OpenAI API key</label>
              <input
                id="openai-key"
                type="password"
                value={openAiKey}
                onChange={(event) => setOpenAiKey(event.target.value)}
                placeholder="sk-..."
                autoComplete="off"
                spellCheck="false"
              />
              <Button
                onClick={() => runAnalysis(activeAnalysisConfig.type)}
                loading={analysisRunningType === activeAnalysisConfig.type}
                disabled={!canRunAnalysis || Boolean(analysisRunningType)}
              >
                {activeAnalysisConfig.buttonLabel}
              </Button>
            </div>
          </div>
          <div className={styles.reportStatusGrid}>
            {Object.values(analysisConfigs).map((config) => (
              <div
                key={config.type}
                className={`${styles.reportStatus} ${generatedReportTypes.includes(config.type) ? styles.reportReady : ''}`}
              >
                <strong>{config.tabLabel}</strong>
                <span>{generatedReportTypes.includes(config.type) ? '생성됨' : '미생성'}</span>
              </div>
            ))}
          </div>
          {analysisError ? <p className={styles.error}>{analysisError}</p> : null}
          {analysisProgress ? <p className={styles.progressNote}>{analysisProgress}</p> : null}
          {activeReport ? (
            <div className={styles.analysis}>
              <div className={styles.analysisMeta}>
                <span>model: {activeReport.model || '-'}</span>
                <span>reasoning: {activeReport.reasoningEffort || '-'}</span>
                <span>generated: {formatTime(activeReport.analyzedAt)}</span>
                <span>respondents: {activeReport.inputSummary?.respondentCount ?? dashboard.respondentCount}</span>
              </div>
              <MarkdownReport text={activeReport.result || ''} />
            </div>
          ) : (
            <div className={styles.emptyState}>
              <strong>아직 이 리포트는 생성되지 않았습니다.</strong>
              <span>{activeAnalysisConfig.buttonLabel} 버튼을 누르면 이 화면에 해당하는 리포트만 생성합니다.</span>
            </div>
          )}
        </Panel>
      ) : null}
    </AppShell>
  );
}
