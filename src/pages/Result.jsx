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

function SignalList({ title, items, metric }) {
  return (
    <div className={styles.signalGroup}>
      <h3>{title}</h3>
      {items.length ? (
        items.map((stat) => (
          <span key={stat.question.id}>
            <strong>{stat.question.id}</strong> {stat.question.title}: {metric(stat)}
          </span>
        ))
      ) : (
        <span>표시할 응답이 없습니다.</span>
      )}
    </div>
  );
}

function QuestionStatRow({ stat }) {
  const question = stat.question;

  if (question.type === 'scale5na') {
    return (
      <div className={styles.questionRow}>
        <div>
          <strong>
            {question.id}. {question.title}
          </strong>
          <span>{question.question}</span>
        </div>
        <div className={styles.statGrid}>
          <span>평균 {formatAverage(stat.scale.average)}</span>
          <span>1~2점 {toPercent(stat.scale.lowRatio)}</span>
          <span>4~5점 {toPercent(stat.scale.highRatio)}</span>
          <span>N/A {toPercent(stat.scale.naRatio)}</span>
        </div>
      </div>
    );
  }

  if (question.type === 'singleChoice' || question.type === 'multiChoice') {
    const entries = Object.entries(stat.choice || {}).sort((a, b) => b[1] - a[1]);
    return (
      <div className={styles.questionRow}>
        <div>
          <strong>
            {question.id}. {question.title}
          </strong>
          <span>{question.question}</span>
        </div>
        <div className={styles.choiceList}>
          {entries.length ? entries.map(([label, count]) => <span key={label}>{label}: {count}</span>) : <span>응답 없음</span>}
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

function buildAnalysisBundle(reports) {
  const analyzedAt = Date.now();
  return {
    result: reports.comprehensive.result,
    model: reports.comprehensive.model,
    reasoningEffort: reports.comprehensive.reasoningEffort,
    analyzedAt,
    reportVersion: '2026-05-13-analysis-suite-v1',
    inputSummary: reports.comprehensive.inputSummary,
    reports,
  };
}

function reportItems(analysis) {
  if (!analysis) return [];
  if (analysis.reports) {
    return [
      ['comprehensive', '1. 종합 리포트', '설문 전체를 함께 보고 워크샵 의제와 4주 실행 실험을 도출합니다.', analysis.reports.comprehensive],
      ['closedEnded', '2. 비주관식 문항 리포트', '리커트, 단일선택, 복수선택 결과만으로 정량 신호를 해석합니다.', analysis.reports.closedEnded],
      ['textByQuestion', '3. 주관식 문항별 리포트', '서술형 응답을 문항별로 나누어 반복 테마와 토론 질문을 정리합니다.', analysis.reports.textByQuestion],
    ].filter(([, , , report]) => report?.result);
  }
  if (analysis.result) {
    return [['legacy', '종합 리포트', '기존 형식으로 저장된 AI 리포트입니다.', analysis]];
  }
  return [];
}

export default function Result() {
  const [dataError, setDataError] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [allResponses, setAllResponses] = useState({});
  const [respondents, setRespondents] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [openAiKey, setOpenAiKey] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState('');

  const dashboard = useMemo(
    () => buildDashboardStats(allResponses, respondents),
    [allResponses, respondents],
  );
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
    if (!analysisRunning) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [analysisRunning]);

  const runAnalysis = async () => {
    setActiveTab('analysis');
    setAnalysisError('');
    setAnalysisRunning(true);
    setAnalysisProgress('1/3 종합 리포트를 생성하는 중입니다.');
    try {
      const payload = buildAiAnalysisPayload(dashboard, allResponses, respondents);
      const comprehensive = await requestWorkshopAnalysis({
        apiKey: openAiKey,
        payload,
        analysisType: 'comprehensive',
      });

      setAnalysisProgress('2/3 비주관식 문항 리포트를 생성하는 중입니다.');
      const closedEnded = await requestWorkshopAnalysis({
        apiKey: openAiKey,
        payload: filterPayloadQuestions(payload, (stat) => stat.type !== 'longText'),
        analysisType: 'closedEnded',
      });

      setAnalysisProgress('3/3 주관식 문항별 리포트를 생성하는 중입니다.');
      const textByQuestion = await requestWorkshopAnalysis({
        apiKey: openAiKey,
        payload: filterPayloadQuestions(payload, (stat) => stat.type === 'longText', { includeAxisStats: false }),
        analysisType: 'textByQuestion',
      });

      setAnalysisProgress('AI 리포트를 Firebase에 저장하는 중입니다.');
      const generated = buildAnalysisBundle({ comprehensive, closedEnded, textByQuestion });
      const saved = await analysisService.saveComprehensiveAnalysis(generated);
      setAnalysis(saved);
    } catch (err) {
      console.error(err);
      setAnalysisError(err.message || 'AI 분석 생성에 실패했습니다.');
    } finally {
      setAnalysisRunning(false);
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
  const reports = reportItems(analysis);

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
        <Button onClick={runAnalysis} loading={analysisRunning} disabled={!canRunAnalysis}>
          AI 분석 3종 생성/갱신
        </Button>
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
          ['analysis', 'AI 리포트'],
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
              description="이 화면은 사람이나 직군을 평가하기 위한 화면이 아니라, 워크샵에서 다룰 운영 의제를 좁히기 위한 화면입니다."
            />
            <div className={styles.noteList}>
              <span>평균이 낮은 문항은 먼저 구조를 확인할 후보입니다.</span>
              <span>이견이 큰 문항은 실제 경험이 다르거나 기준 해석이 갈리는 지점입니다.</span>
              <span>N/A가 높은 문항은 정보 접근성 또는 업무 접점 차이를 의미할 수 있습니다.</span>
            </div>
          </Panel>
        </div>
      ) : null}

      {activeTab === 'signals' ? (
        <Panel className={styles.panel}>
          <SectionTitle
            eyebrow="Priority Signals"
            title="우선 확인할 신호"
            description="워크샵 안건으로 가져갈 가능성이 높은 신호를 낮은 평균, 큰 이견, 높은 N/A로 나누어 봅니다."
          />
          <div className={styles.signalCards}>
            <SignalList
              title="평균 낮은 문항"
              items={dashboard.lowAverage}
              metric={(stat) => formatAverage(stat.scale.average)}
            />
            <SignalList
              title="이견이 큰 문항"
              items={dashboard.highVariance}
              metric={(stat) => formatAverage(stat.scale.variance)}
            />
            <SignalList
              title="N/A 높은 문항"
              items={dashboard.highNa}
              metric={(stat) => toPercent(stat.scale.naRatio)}
            />
          </div>
        </Panel>
      ) : null}

      {activeTab === 'questions' ? (
        <Panel className={styles.panel}>
          <SectionTitle
            eyebrow="Question Details"
            title="문항별 결과"
            description="객관식, 복수선택, 리커트 문항을 문항 단위로 확인합니다."
          />
          <div className={styles.questionList}>
            {dashboard.questionStats
              .filter((stat) => stat.answeredCount > 0)
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

      {activeTab === 'analysis' ? (
        <Panel className={styles.panel}>
          <div className={styles.reportHeader}>
            <SectionTitle
              eyebrow="AI Report"
              title="전문가 검토형 AI 분석 리포트"
              description="종합, 비주관식, 주관식 문항별 리포트를 순차 생성합니다. 생성 중에는 이 탭을 닫거나 새로고침하지 마세요."
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
              <Button onClick={runAnalysis} loading={analysisRunning} disabled={!canRunAnalysis}>
                AI 분석 3종 생성/갱신
              </Button>
            </div>
          </div>
          {analysisError ? <p className={styles.error}>{analysisError}</p> : null}
          {analysisProgress ? <p className={styles.progressNote}>{analysisProgress}</p> : null}
          {analysis ? (
            <div className={styles.analysis}>
              <div className={styles.analysisMeta}>
                <span>model: {analysis.model || '-'}</span>
                <span>reasoning: {analysis.reasoningEffort || '-'}</span>
                <span>generated: {formatTime(analysis.analyzedAt)}</span>
                <span>respondents: {analysis.inputSummary?.respondentCount ?? dashboard.respondentCount}</span>
              </div>
              {reports.map(([id, title, description, report]) => (
                <section key={id} className={styles.reportBlock}>
                  <div className={styles.reportBlockHeader}>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <div className={styles.analysisMeta}>
                      <span>type: {report.analysisType || id}</span>
                      <span>generated: {formatTime(report.analyzedAt || analysis.analyzedAt)}</span>
                    </div>
                  </div>
                  <MarkdownReport text={report.result || ''} />
                </section>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <strong>아직 생성된 AI 리포트가 없습니다.</strong>
              <span>위 버튼을 누르면 현재 응답 집계 기준으로 종합, 비주관식, 주관식 문항별 리포트를 생성합니다.</span>
            </div>
          )}
        </Panel>
      ) : null}
    </AppShell>
  );
}
