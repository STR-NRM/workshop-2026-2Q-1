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
import { QUESTION_VERSION, answerableQuestions, surveyInfo } from '../data/questions';
import {
  analysisService,
  respondentService,
  responseService,
} from '../firebase/config';
import {
  buildAiAnalysisPayload,
  buildDashboardStats,
  filterCurrentSurveyData,
  formatAverage,
  toPercent,
} from '../utils/analytics';
import { requestWorkshopAnalysis } from '../utils/openaiAnalysis';
import styles from './Result.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const EXCEL_CSV_BOM = '\uFEFF';

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
  const header = ['respondentId', ...answerableQuestions.map((question) => question.id)];
  const rows = Object.entries(allResponses || {}).map(([uid, responses]) => [
    uid,
    ...answerableQuestions.map((question) => responses?.[question.id]?.value ?? ''),
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
}

function buildExcelCsv(allResponses) {
  return `${EXCEL_CSV_BOM}${buildCsv(allResponses)}`;
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
  letter: {
    type: 'letter',
    tabId: 'ai-letter',
    tabLabel: '💌 한 장의 편지',
    eyebrow: '한 장의 편지',
    title: '💌 한 장의 편지',
    description: '모든 문항을 한 장으로 읽히는 따뜻한 편지로 정리합니다. 직무별 메시지는 별도 탭에서 봅니다.',
    buttonLabel: '한 장의 편지 생성/갱신',
  },
  roleMessages: {
    type: 'roleMessages',
    tabId: 'ai-role-messages',
    tabLabel: '직무별 메시지',
    eyebrow: '직무별 메시지',
    title: '직무별 메시지',
    description: '역할별 응답 신호를 바탕으로 각 직무의 팀원에게 건네는 짧고 따뜻한 메시지를 정리합니다.',
    buttonLabel: '직무별 메시지 생성/갱신',
  },
  comprehensive: {
    type: 'comprehensive',
    tabId: 'ai-comprehensive',
    tabLabel: '종합',
    eyebrow: '종합 분석',
    title: '종합 리포트',
    description: '점수/선택 결과와 서술형 응답을 함께 보고 워크샵에서 논의할 주제와 4주 동안 해볼 작은 개선을 정리합니다.',
    buttonLabel: '종합 리포트 생성/갱신',
  },
  closedEnded: {
    type: 'closedEnded',
    tabId: 'ai-closed',
    tabLabel: '선택형',
    eyebrow: '선택형/척도 분석',
    title: '선택형·척도형 문항 리포트',
    description: '1~5점 척도, 단일선택, 복수선택 결과만으로 숫자로 보이는 신호와 선택 분포를 해석합니다.',
    buttonLabel: '선택형 리포트 생성/갱신',
  },
  textByQuestion: {
    type: 'textByQuestion',
    tabId: 'ai-text',
    tabLabel: '서술형',
    eyebrow: '서술형 분석',
    title: '서술형 문항별 리포트',
    description: '서술형 응답을 문항별로 나누어 반복 테마, 소수 의견, 토론 질문을 정리합니다.',
    buttonLabel: '서술형 리포트 생성/갱신',
  },
};

const allAnalysisTypes = Object.keys(analysisConfigs);
const analysisReportCount = allAnalysisTypes.length;
const roleMessageQuestionIds = new Set([
  'META_ROLE',
  'META_WORKSTREAM',
  'META_EXTERNAL',
  'META_CBT',
  'CHOICE01',
  'CHOICE01_OTHER',
  'CHOICE02',
  'CHOICE03',
  'CHOICE04',
  'CHOICE05',
  'CHOICE06',
  'CHOICE06_OTHER',
  'NPS01',
  'TEXT01',
  'TEXT02',
  'TEXT03',
  'TEXT04',
  'TEXT05',
]);
const roleMessageSectionKeywords = [
  'E. 역할 간 협업 방식',
  'G. 개발과 운영 환경',
  'H. 지식 공유와 새 구성원 적응',
  'I. 일하는 속도와 학습 문화',
  '직무별 추가 문항',
  '추가 문항',
];
const basicTabs = [
  ['overview', '요약'],
  ['signals', '먼저 볼 신호'],
  ['questions', '문항별'],
  ['text', '서술형'],
];
const aiTabs = Object.values(analysisConfigs).map((config) => [config.tabId, config.tabLabel]);

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
  if (average !== null && average < 3) return '평균이 3점 미만입니다. 워크샵에서 원인과 구조를 먼저 확인할 후보입니다.';
  if (variance !== null && variance >= 1.2) return '응답 차이가 큽니다. 역할, 제품, 함께 일하는 팀에 따라 경험이 다른지 확인해야 합니다.';
  if (naRatio !== null && naRatio >= 0.3) return '해당 없음/판단 어려움 비율이 높습니다. 필요한 정보를 볼 수 있는 정도나 실제 업무 연결 정도를 확인해야 합니다.';
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
  const workArea = topChoice(dashboard, 'META_WORKSTREAM');
  const discussion = topChoice(dashboard, 'CHOICE06');
  const lowestQuestion = dashboard.lowAverage[0] || null;
  const splitQuestion = dashboard.highVariance[0] || null;

  const headline = dashboard.respondentCount
    ? `${dashboard.respondentCount}명 응답 기준으로 가장 먼저 볼 영역은 ${lowestAxis?.axis || '아직 없음'}입니다.`
    : '아직 응답 데이터가 없어 결과를 해석할 수 없습니다.';

  return {
    headline,
    cards: [
      {
        label: '응답 상태',
        value: `${dashboard.completedCount}/${dashboard.respondentCount} 완료`,
        detail: `완료율 ${completedRatio}%. 응답자 수가 적을수록 수치는 방향성 신호로만 봅니다.`,
      },
      {
        label: '점수가 가장 낮은 영역',
        value: lowestAxis ? `${lowestAxis.axis} ${formatAverage(lowestAxis.average)}` : '-',
        detail: '영역 평균이 낮을수록 워크샵에서 구조를 먼저 확인할 후보입니다.',
      },
      {
        label: '상대적으로 강한 영역',
        value: highestAxis ? `${highestAxis.axis} ${formatAverage(highestAxis.average)}` : '-',
        detail: '강한 영역은 유지할 방식과 재사용 가능한 운영 습관을 찾는 데 사용합니다.',
      },
      {
        label: '가장 많이 선택된 막힘',
        value: bottleneck ? bottleneck.label : '-',
        detail: bottleneck ? `${bottleneck.count}/${bottleneck.total} 선택, ${bottleneck.percent}%` : '선택형 응답이 아직 없습니다.',
      },
      {
        label: '4주 개선 우선 후보',
        value: improvement ? improvement.label : '-',
        detail: improvement ? `${improvement.count}/${improvement.total} 선택. 바로 시도할 수 있는 작은 크기로 쪼개야 합니다.` : '선택형 응답이 아직 없습니다.',
      },
      {
        label: '주요 제품/업무 영역',
        value: workArea ? workArea.label : '-',
        detail: workArea ? `${workArea.count}회 선택. 제품이나 업무 영역별 응답 쏠림이 있는지 함께 봅니다.` : '선택형 응답이 아직 없습니다.',
      },
      {
        label: '토론 주제 관심',
        value: discussion ? discussion.label : '-',
        detail: discussion ? `${discussion.percent}% 비중의 선호입니다. 실제 토론 주제는 점수/선택 결과와 서술형 응답을 함께 봅니다.` : '토론 주제 선호 응답이 아직 없습니다.',
      },
      {
        label: '점수가 가장 낮은 문항',
        value: lowestQuestion ? `${lowestQuestion.question.id}. ${lowestQuestion.question.title}` : '-',
        detail: lowestQuestion ? `평균 ${formatAverage(lowestQuestion.scale.average)}. 개인 문제가 아니라 구조 확인 후보입니다.` : '척도 응답이 아직 없습니다.',
      },
      {
        label: '응답 차이가 큰 문항',
        value: splitQuestion ? `${splitQuestion.question.id}. ${splitQuestion.question.title}` : '-',
        detail: splitQuestion ? `응답 차이 ${formatAverage(splitQuestion.scale.variance)}. 경험 차이 또는 기준 차이를 확인하세요.` : '척도 응답이 아직 없습니다.',
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
            {stat.scale.naCount ? <span>판단 어려움 {toPercent(stat.scale.naRatio)}</span> : null}
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
          <small>선택 비중이 높은 항목은 공통 인식 후보이고, 선택이 갈리면 경험 차이나 기준 차이를 확인해야 합니다.</small>
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

function cleanSignalText(text) {
  return String(text || '')
    .trim()
    .replace(/^\*\*\s*/, '')
    .replace(/\s*\*\*$/, '')
    .replace(/^["'“”]+/, '')
    .replace(/["'“”]+$/, '')
    .trim();
}

function extractReportSignal(line) {
  const normalized = String(line || '')
    .replace(/^[-*]\s+/, '')
    .replace(/^\d+\.\s+/, '')
    .trim()
    .replace(/^\*\*/, '');
  const match = normalized.match(/^(한\s*문장\s*결론|한문장\s*결론|한\s*문장\s*정리|한문장\s*정리|한\s*문장\s*제안|한문장\s*제안)\s*:\s*(.+)$/);
  if (!match) return null;

  const label = match[1].replace(/\s+/g, '');
  const text = cleanSignalText(match[2]);
  if (!text) return null;
  if (label.includes('결론')) return { kind: 'conclusion', label: '한 문장 결론', text };
  if (label.includes('제안')) return { kind: 'suggestion', label: '한문장 제안', text };
  return { kind: 'summary', label: '한문장 정리', text };
}

function ReportHeroConclusion({ signal }) {
  if (!signal) return null;
  return (
    <div className={styles.reportHeroConclusion}>
      <span>{signal.label}</span>
      <strong>“{signal.text}”</strong>
    </div>
  );
}

function ReportCallout({ signal }) {
  const kindClass = {
    conclusion: styles.reportCalloutConclusion,
    summary: styles.reportCalloutSummary,
    suggestion: styles.reportCalloutSuggestion,
  }[signal.kind];

  return (
    <div className={`${styles.reportCallout} ${kindClass}`}>
      <span>{signal.label}</span>
      <strong>“{signal.text}”</strong>
    </div>
  );
}

function MarkdownReport({ text }) {
  const lines = String(text || '').split('\n');
  const nodes = [];
  let list = [];
  let table = [];
  const heroConclusion = lines.map(extractReportSignal).find((signal) => signal?.kind === 'conclusion');
  let skippedHeroConclusion = false;

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
    if (line.startsWith('>')) {
      flushList();
      const quote = line.replace(/^>\s?/, '').trim();
      if (quote) {
        nodes.push(
          <blockquote key={`quote-${index}`} className={styles.reportQuote}>
            {renderInline(quote, `quote-${index}`)}
          </blockquote>,
        );
      }
      return;
    }
    const signal = extractReportSignal(line);
    if (signal) {
      flushList();
      if (signal.kind === 'conclusion' && !skippedHeroConclusion) {
        skippedHeroConclusion = true;
        return;
      }
      nodes.push(<ReportCallout key={`signal-${index}`} signal={signal} />);
      return;
    }
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
  return (
    <article className={styles.reportBody}>
      <ReportHeroConclusion signal={heroConclusion} />
      {nodes}
    </article>
  );
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

function isRoleMessageQuestion(stat) {
  if (roleMessageQuestionIds.has(stat.id)) return true;
  if (stat.role || stat.roles || stat.condition) return true;
  return roleMessageSectionKeywords.some((keyword) => stat.section?.includes(keyword));
}

function payloadForAnalysis(type, payload) {
  if (type === 'closedEnded') return filterPayloadQuestions(payload, (stat) => stat.type !== 'longText');
  if (type === 'textByQuestion') {
    return filterPayloadQuestions(payload, (stat) => stat.type === 'longText', { includeAxisStats: false });
  }
  if (type === 'roleMessages') return filterPayloadQuestions(payload, isRoleMessageQuestion);
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

function reportMatchesCurrentQuestions(report) {
  return report?.inputSummary?.questionVersion === QUESTION_VERSION;
}

function analysisMatchesCurrentQuestions(analysis) {
  if (!analysis) return null;
  if (analysis.reports) {
    const reports = Object.fromEntries(
      Object.entries(analysis.reports).filter(([, report]) => reportMatchesCurrentQuestions(report)),
    );
    if (!Object.keys(reports).length) return null;
    const primary = reports.letter || reports.roleMessages || reports.comprehensive || reports.closedEnded || reports.textByQuestion;
    return {
      ...analysis,
      result: primary?.result,
      model: primary?.model,
      reasoningEffort: primary?.reasoningEffort,
      analyzedAt: primary?.analyzedAt || analysis.analyzedAt,
      inputSummary: primary?.inputSummary || analysis.inputSummary,
      reports,
    };
  }
  return reportMatchesCurrentQuestions(analysis) ? analysis : null;
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
  const primary = reports.letter || reports.roleMessages || reports.comprehensive || reports.closedEnded || reports.textByQuestion || report;

  return {
    result: primary.result,
    model: primary.model,
    reasoningEffort: primary.reasoningEffort,
    analyzedAt: Date.now(),
    reportVersion: '2026-05-13-analysis-suite-v6-letter-role-split',
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
  const [analysisRunningTypes, setAnalysisRunningTypes] = useState([]);

  const dashboard = useMemo(
    () => buildDashboardStats(allResponses, respondents),
    [allResponses, respondents],
  );
  const overview = useMemo(() => buildOverview(dashboard), [dashboard]);

  const loadData = async () => {
    setLoading(true);
    setDataError('');
    try {
      const [responses, respondentData, analysisData] = await Promise.all([
        responseService.getAllData(),
        respondentService.getAllRespondents(),
        analysisService.getComprehensiveAnalysis(),
      ]);
      const currentData = filterCurrentSurveyData(responses || {}, respondentData || {});
      setAllResponses(currentData.responses);
      setRespondents(currentData.respondents);
      setAnalysis(analysisMatchesCurrentQuestions(analysisData));
    } catch (err) {
      console.error(err);
      setDataError(err.message || '결과 데이터를 불러오지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!analysisRunningTypes.length) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [analysisRunningTypes.length]);

  const runAllAnalyses = async (sourceType = 'comprehensive') => {
    const sourceConfig = analysisConfigs[sourceType] || analysisConfigs.comprehensive;
    setActiveTab(sourceConfig.tabId);
    setAnalysisError('');
    if (!openAiKey.trim()) {
      setAnalysisError('리포트 생성용 키를 입력해야 합니다.');
      return;
    }
    if (!canRunAnalysis) return;

    setAnalysisRunningTypes(allAnalysisTypes);
    setAnalysisProgress(`리포트 ${analysisReportCount}개를 동시에 만드는 중입니다. 이 탭을 닫거나 새로고침하지 마세요.`);
    try {
      const payload = buildAiAnalysisPayload(dashboard, allResponses, respondents);
      const generatedReports = await Promise.all(
        allAnalysisTypes.map((analysisType) => requestWorkshopAnalysis({
          apiKey: openAiKey,
          payload: payloadForAnalysis(analysisType, payload),
          analysisType,
        })),
      );
      setAnalysisProgress(`리포트 ${analysisReportCount}개를 저장하는 중입니다.`);
      const latestAnalysis = await analysisService.getComprehensiveAnalysis();
      const nextAnalysis = generatedReports.reduce(
        (currentAnalysis, report) => mergeAnalysisReport(currentAnalysis, report),
        latestAnalysis || analysis,
      );
      const saved = await analysisService.saveComprehensiveAnalysis(nextAnalysis);
      setAnalysis(saved);
    } catch (err) {
      console.error(err);
      setAnalysisError(err.message || '리포트를 만들지 못했습니다.');
    } finally {
      setAnalysisRunningTypes([]);
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
    download(`workshop-${Date.now()}-responses.csv`, buildExcelCsv(allResponses), 'text/csv;charset=utf-8');
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
  const isRunningAllAnalyses = allAnalysisTypes.every((type) => analysisRunningTypes.includes(type));
  const activeResultMode = activeAnalysisConfig ? 'ai' : 'basic';
  const visibleTabs = activeResultMode === 'ai' ? aiTabs : basicTabs;
  const changeResultMode = (mode) => {
    setActiveTab(mode === 'ai' ? analysisConfigs.letter.tabId : 'overview');
  };

  return (
    <AppShell wide>
      <PageHeader
        eyebrow={surveyInfo.organization}
        title="워크샵 설문 결과 리포트"
        description="개인 평가가 아니라 일이 막히는 지점, 의견 차이, 4주 동안 해볼 작은 개선을 찾기 위한 결과 화면입니다."
        meta={
          <>
            <span>{loading ? '결과 불러오는 중' : '결과 불러옴'}</span>
            <span>{analysis?.analyzedAt ? `리포트 생성 ${formatTime(analysis.analyzedAt)}` : '리포트 미생성'}</span>
          </>
        }
      />

      <div className={styles.toolbar}>
        <Button variant="secondary" onClick={loadData} loading={loading}>새로고침</Button>
        <div className={styles.exportLinks} aria-label="결과 데이터 내보내기">
          <button type="button" onClick={exportCsv}>Excel CSV</button>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={exportJson}>JSON</button>
        </div>
      </div>
      {dataError ? <p className={styles.error}>{dataError}</p> : null}

      <div className={styles.metrics}>
        <Metric label="응답 시작" value={`${dashboard.respondentCount}명`} hint="설문을 시작한 인원" />
        <Metric label="완료" value={`${dashboard.completedCount}명`} hint="최종 제출 기준" />
        <Metric label="전체 문항" value={`${answerableQuestions.length}개`} hint="직무별/추가 문항 포함" />
        <Metric label="분석 리포트" value={analysis ? '생성됨' : '미생성'} hint={`한 번에 ${analysisReportCount}개 리포트 생성`} />
      </div>

      <div className={styles.modeSwitch} role="group" aria-label="결과 화면 구분">
        <button
          type="button"
          className={activeResultMode === 'basic' ? styles.activeMode : ''}
          onClick={() => changeResultMode('basic')}
        >
          <strong>기본 결과</strong>
          <span>AI 없이 바로 계산한 요약, 신호, 문항별 결과입니다.</span>
        </button>
        <button
          type="button"
          className={activeResultMode === 'ai' ? styles.activeMode : ''}
          onClick={() => changeResultMode('ai')}
        >
          <strong>AI 분석</strong>
          <span>편지, 직무별 메시지, 종합·선택형·서술형 리포트를 따로 봅니다.</span>
        </button>
      </div>

      <div className={styles.modeGuide}>
        {activeResultMode === 'ai'
          ? 'AI 분석은 해석을 돕는 보조 자료입니다. 한 장의 편지를 먼저 읽고, 직무별 메시지와 종합·선택형·서술형 리포트로 근거를 확인하세요.'
          : '기본 결과는 응답을 그대로 집계한 화면입니다. 먼저 숫자와 원문 신호를 확인한 뒤, AI 분석에서 해석을 보완하세요.'}
      </div>

      <div className={styles.tabs}>
        {visibleTabs.map(([id, label]) => (
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
                이 요약은 결정을 대신하지 않습니다. 워크샵에서 어떤 질문을 먼저 확인할지 좁히기 위한 신호입니다.
              </p>
            </div>
            <div className={styles.overviewCards}>
              {overview.cards.map((item) => <OverviewCard key={item.label} item={item} />)}
            </div>
          </Panel>

          <div className={styles.grid}>
            <Panel className={styles.panel}>
              <SectionTitle
                eyebrow="결과 요약"
                title="영역별 평균"
                description="5점 척도 문항을 일하는 방식의 영역별로 묶은 평균입니다. 응답 수가 적을 때는 방향성 신호로만 해석해야 합니다."
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
                eyebrow="해석 기준"
                title="해석 기준"
                description="수치가 낮거나 높다는 사실보다, 왜 그런 경험 차이가 생겼는지 확인하는 것이 중요합니다."
              />
              <div className={styles.noteList}>
                <span><strong>낮은 평균</strong> 구조와 기준을 먼저 확인할 후보입니다.</span>
                <span><strong>큰 응답 차이</strong> 제품, 역할, 함께 일하는 팀에 따라 경험이 갈릴 가능성이 있습니다.</span>
                <span><strong>판단 어려움</strong> 실제 업무 연결이나 정보 접근 차이가 있을 수 있습니다.</span>
                <span><strong>선택형 상위 항목</strong> 다수가 체감하는 막힘 후보이며, 서술형과 함께 확인해야 합니다.</span>
              </div>
            </Panel>
          </div>
        </div>
      ) : null}

      {activeTab === 'signals' ? (
        <Panel className={styles.panel}>
          <SectionTitle
            eyebrow="먼저 볼 신호"
            title="우선 확인할 신호"
            description="아래 신호는 결론이 아니라 워크샵에서 먼저 질문해야 할 후보입니다. 낮은 평균, 큰 응답 차이, 판단 어려움은 각각 의미가 다릅니다."
          />
          <div className={styles.signalCards}>
            <SignalList
              title="점수가 낮은 문항"
              description="대체로 좋지 않게 체감된 영역입니다. 원인이 사람인지가 아니라 구조, 기준, 정보 흐름인지 확인합니다."
              items={dashboard.lowAverage}
              metric={(stat) => formatAverage(stat.scale.average)}
              explanation={(stat) => `낮은 점수 비율 ${toPercent(stat.scale.lowRatio)}`}
            />
            <SignalList
              title="응답 차이가 큰 문항"
              description="응답자마다 체감이 갈린 영역입니다. 제품, 역할, 함께 일하는 팀에 따라 경험이 다른지 확인해야 합니다."
              items={dashboard.highVariance}
              metric={(stat) => formatAverage(stat.scale.variance)}
              explanation={(stat) => `평균 ${formatAverage(stat.scale.average)}`}
            />
            <SignalList
              title="판단하기 어렵다는 응답이 많은 문항"
              description="일부 구성원이 판단하기 어려운 영역입니다. 필요한 정보를 볼 수 있는 정도나 실제 업무 연결 정도의 차이일 수 있습니다."
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
            eyebrow="문항별 결과"
            title="문항별 결과"
            description="1~5점 척도 문항은 점수 분포와 평균을, 선택형 문항은 선택 비중 막대를 함께 봅니다. 낮은 평균과 큰 응답 차이는 바로 결론이 아니라 토론 후보입니다."
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
            eyebrow="서술형 응답"
            title="서술형 응답"
            description="서술형 문항과 기타 선택 후 입력한 응답을 함께 봅니다. 누군지 알 수 있는 표현은 워크샵 공유 전에 반드시 제거해야 합니다."
          />
          <div className={styles.textList}>
            {dashboard.questionStats
              .filter((stat) => stat.question.type === 'longText' && stat.textValues?.length)
              .map((stat) => (
                <section key={stat.question.id}>
                  <h3>{stat.question.id}. {stat.question.title}</h3>
                  {stat.textValues.map((text, index) => <blockquote key={`${stat.question.id}-${index}`}>{text}</blockquote>)}
                </section>
              ))}
            {dashboard.questionStats.every((stat) => stat.question.type !== 'longText' || !stat.textValues?.length) ? (
              <div className={styles.emptyState}>
                <strong>아직 서술형 응답이 없습니다.</strong>
                <span>서술형 문항 또는 기타 입력 응답이 제출되면 여기에 표시됩니다.</span>
              </div>
            ) : null}
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
              <label htmlFor="report-key">리포트 생성용 키</label>
              <input
                id="report-key"
                type="password"
                value={openAiKey}
                onChange={(event) => setOpenAiKey(event.target.value)}
                placeholder="리포트 생성용 키를 입력하세요"
                autoComplete="off"
                spellCheck="false"
              />
              <Button
                onClick={() => runAllAnalyses(activeAnalysisConfig.type)}
                loading={isRunningAllAnalyses}
                disabled={!canRunAnalysis || Boolean(analysisRunningTypes.length)}
              >
                {activeAnalysisConfig.buttonLabel}
              </Button>
              <small className={styles.controlHelp}>
                어떤 AI 분석 탭에서 누르더라도 {analysisReportCount}개 리포트가 동시에 만들어지고 각 탭에 저장됩니다.
              </small>
            </div>
          </div>
          <div className={styles.reportStatusGrid}>
            {Object.values(analysisConfigs).map((config) => (
              <div
                key={config.type}
                className={[
                  styles.reportStatus,
                  generatedReportTypes.includes(config.type) ? styles.reportReady : '',
                  analysisRunningTypes.includes(config.type) ? styles.reportRunning : '',
                ].filter(Boolean).join(' ')}
              >
                <strong>{config.tabLabel}</strong>
                <span>
                  {analysisRunningTypes.includes(config.type)
                    ? '생성 중'
                    : generatedReportTypes.includes(config.type) ? '생성됨' : '미생성'}
                </span>
              </div>
            ))}
          </div>
          {analysisError ? <p className={styles.error}>{analysisError}</p> : null}
          {analysisProgress ? <p className={styles.progressNote}>{analysisProgress}</p> : null}
          {activeReport ? (
            <div className={styles.analysis}>
              <div className={styles.analysisMeta}>
                <span>생성 시각: {formatTime(activeReport.analyzedAt)}</span>
                <span>응답자: {activeReport.inputSummary?.respondentCount ?? dashboard.respondentCount}</span>
              </div>
              <MarkdownReport text={activeReport.result || ''} />
            </div>
          ) : (
            <div className={styles.emptyState}>
              <strong>아직 이 리포트는 생성되지 않았습니다.</strong>
              <span>{activeAnalysisConfig.buttonLabel} 버튼을 누르면 {analysisReportCount}개 리포트가 동시에 만들어지고, 이 탭에는 해당 리포트가 표시됩니다.</span>
            </div>
          )}
        </Panel>
      ) : null}
    </AppShell>
  );
}
