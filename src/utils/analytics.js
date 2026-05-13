import { QUESTION_VERSION, SURVEY_ID, answerableQuestions, axisMap, surveyInfo } from '../data/questions.js';

const legacyChoiceLabels = {
  META_ROLE: {
    '웹 엔지니어링(FE/BE)': '웹 개발(프론트/백엔드)',
  },
  META_WORKSTREAM: {
    '공통 검색/AI 플랫폼/인프라성 작업': '공통 검색, AI 기반 작업, 인프라 관련 작업',
  },
  CHOICE01: {
    '제품 우선순위/전략 정렬': '제품 우선순위와 전략 정리',
    '고객/사용자 피드백 수집과 해석': '고객/사용자 의견 수집과 해석',
    '의사결정 속도와 권한': '결정 속도와 권한',
    '팀 내부 제품/개발 협업(PM/프롬프트/AI/BE/FE)': '팀 내부 제품/개발 협업(PM/프롬프트/AI/백엔드/프론트엔드)',
    '제품별 실행 방식과 성숙도 관리': '제품별 운영 방식 관리',
    '인력/시간/동시에 진행 중인 일 과다': '인력/시간 부족 또는 동시에 진행 중인 일 과다',
    '온보딩/문서화 부족': '새 구성원 적응/문서화 부족',
  },
  CHOICE02: {
    '제품별 우선순위와 책임 역할 정리': '제품별 우선순위와 끝까지 챙기는 역할 정리',
    '고객/사용자 의견이 제품 결정으로 이어지는 흐름 정리': '고객/사용자 의견이 제품 결정으로 이어지는 과정 정리',
    '의사결정자와 결정 방식 정리': '최종 결정하는 사람과 결정 방식 정리',
    '제품별 실행/공유/제품화 기준 정리': '제품별 실행/공유/정식 서비스 기준 정리',
    '온보딩/문서화 정리': '새 구성원 적응/문서화 정리',
  },
  CHOICE03: {
    'CBT/실험 단계 제품과 운영 제품의 기준 차이가 모호하다': 'CBT(사전 테스트)/실험 단계 제품과 운영 제품의 기준 차이가 모호하다',
  },
  CHOICE05: {
    '운영 제품과 CBT/실험 제품의 기준 차이 불명확': '운영 제품과 CBT(사전 테스트)/실험 제품의 기준 차이 불명확',
    '빠른 구현 방식의 리스크 관리 부족': '빠른 구현 방식의 위험 관리 부족',
    '제품화 기준 불명확': '정식 서비스로 넘길 기준 불명확',
    '제품 간 학습 공유 부족': '제품 간 배운 점 공유 부족',
  },
  CHOICE06: {
    '고객/시장/내부 피드백': '고객/시장/관련 팀 의견',
    '엔지니어링/운영': '개발/운영',
    'CBT/신규 실험': 'CBT(사전 테스트)/신규 실험',
  },
};

export function responseValue(response) {
  if (!response) return undefined;
  return Object.prototype.hasOwnProperty.call(response, 'value') ? response.value : response;
}

export function normalizeResponseValue(questionId, value) {
  const labels = legacyChoiceLabels[questionId];
  if (!labels) return value;
  if (Array.isArray(value)) return value.map((item) => labels[item] || item);
  return labels[value] || value;
}

export function flattenResponses(allResponses = {}) {
  return Object.entries(allResponses).flatMap(([uid, responses]) =>
    Object.entries(responses || {}).map(([questionId, response]) => ({
      uid,
      questionId,
      value: normalizeResponseValue(questionId, responseValue(response)),
      answeredAt: response?.answeredAt,
      type: response?.type,
    })),
  );
}

function variance(numbers, average) {
  if (numbers.length <= 1) return 0;
  return numbers.reduce((sum, value) => sum + (value - average) ** 2, 0) / numbers.length;
}

export function getQuestionResponses(allResponses, questionId) {
  return Object.values(allResponses || {})
    .map((responses) => normalizeResponseValue(questionId, responseValue(responses?.[questionId])))
    .filter((value) => value !== undefined && value !== null && value !== '');
}

export function getScaleStats(values = []) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, NA: 0 };
  const numeric = [];

  values.forEach((value) => {
    if (value === 'NA') {
      distribution.NA += 1;
      return;
    }
    const number = Number(value);
    if (number >= 1 && number <= 5) {
      distribution[number] += 1;
      numeric.push(number);
    }
  });

  const numericCount = numeric.length;
  const average = numericCount ? numeric.reduce((sum, value) => sum + value, 0) / numericCount : null;
  const lowCount = numeric.filter((value) => value <= 2).length;
  const highCount = numeric.filter((value) => value >= 4).length;
  const naCount = distribution.NA;
  const answeredCount = numericCount + naCount;

  return {
    distribution,
    numericCount,
    answeredCount,
    naCount,
    average,
    variance: average === null ? null : variance(numeric, average),
    lowCount,
    highCount,
    lowRatio: numericCount ? lowCount / numericCount : null,
    highRatio: numericCount ? highCount / numericCount : null,
    naRatio: answeredCount ? naCount / answeredCount : null,
  };
}

export function getChoiceStats(values = []) {
  const counts = {};
  values.forEach((value) => {
    const items = Array.isArray(value) ? value : [value];
    items
      .filter((item) => item !== undefined && item !== null && item !== '')
      .forEach((item) => {
        counts[item] = (counts[item] || 0) + 1;
      });
  });
  return counts;
}

export function buildQuestionStats(allResponses = {}) {
  return answerableQuestions.map((question) => {
    const values = getQuestionResponses(allResponses, question.id);
    const base = {
      question,
      values,
      answeredCount: values.length,
    };

    if (question.type === 'scale5na') {
      return { ...base, scale: getScaleStats(values) };
    }
    if (question.type === 'singleChoice' || question.type === 'multiChoice') {
      return { ...base, choice: getChoiceStats(values) };
    }
    if (question.type === 'longText') {
      return {
        ...base,
        textValues: values.map((value) => String(value || '').trim()).filter(Boolean),
      };
    }
    return base;
  });
}

export function buildAxisStats(questionStats = []) {
  const byTag = new Map();
  questionStats.forEach((stat) => {
    if (stat.question.tag && stat.scale?.average !== null && stat.scale?.average !== undefined) {
      byTag.set(stat.question.tag, stat);
    }
  });

  return axisMap.map((axis) => {
    const stats = axis.tags.map((tag) => byTag.get(tag)).filter(Boolean);
    const averages = stats.map((stat) => stat.scale.average).filter((value) => value !== null);
    const average = averages.length ? averages.reduce((sum, value) => sum + value, 0) / averages.length : null;
    const lowItems = stats
      .filter((stat) => stat.scale.lowRatio !== null)
      .sort((a, b) => b.scale.lowRatio - a.scale.lowRatio)
      .slice(0, 3);

    return {
      axis: axis.axis,
      average,
      answeredQuestionCount: stats.length,
      lowItems,
    };
  });
}

export function buildDashboardStats(allResponses = {}, respondents = {}) {
  const questionStats = buildQuestionStats(allResponses);
  const axisStats = buildAxisStats(questionStats);
  const respondentIds = new Set([
    ...Object.keys(respondents || {}),
    ...Object.keys(allResponses || {}),
  ]);
  const completedCount = Object.values(respondents || {}).filter((respondent) => respondent?.completed).length;

  const scaleStats = questionStats.filter((stat) => stat.question.type === 'scale5na');
  const lowAverage = scaleStats
    .filter((stat) => stat.scale.average !== null)
    .sort((a, b) => a.scale.average - b.scale.average)
    .slice(0, 6);
  const highVariance = scaleStats
    .filter((stat) => stat.scale.variance !== null)
    .sort((a, b) => b.scale.variance - a.scale.variance)
    .slice(0, 6);
  const highNa = scaleStats
    .filter((stat) => stat.scale.naRatio !== null)
    .sort((a, b) => b.scale.naRatio - a.scale.naRatio)
    .slice(0, 6);

  return {
    respondentCount: respondentIds.size,
    completedCount,
    questionStats,
    axisStats,
    lowAverage,
    highVariance,
    highNa,
  };
}

export function filterCurrentSurveyData(allResponses = {}, respondents = {}) {
  const currentResponses = {};

  Object.entries(allResponses || {}).forEach(([uid, responses]) => {
    const entries = Object.entries(responses || {}).filter(([, response]) => (
      response?.questionVersion === QUESTION_VERSION
    ));
    if (entries.length) currentResponses[uid] = Object.fromEntries(entries);
  });

  const currentRespondents = {};
  Object.entries(respondents || {}).forEach(([uid, respondent]) => {
    if (respondent?.questionVersion === QUESTION_VERSION || currentResponses[uid]) {
      currentRespondents[uid] = respondent;
    }
  });

  return {
    responses: currentResponses,
    respondents: currentRespondents,
  };
}

function roundMetric(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return Math.round(value * 100) / 100;
}

function summarizeQuestionStat(stat) {
  const question = stat.question;
  const base = {
    id: question.id,
    section: question.section,
    role: question.role || null,
    roles: question.roles || null,
    condition: question.condition || null,
    externalOptions: question.externalOptions || null,
    type: question.type,
    title: question.title,
    question: question.question,
    answeredCount: stat.answeredCount,
  };

  if (question.type === 'scale5na') {
    return {
      ...base,
      scale: {
        average: roundMetric(stat.scale.average),
        variance: roundMetric(stat.scale.variance),
        lowRatio: roundMetric(stat.scale.lowRatio),
        highRatio: roundMetric(stat.scale.highRatio),
        naRatio: roundMetric(stat.scale.naRatio),
        distribution: stat.scale.distribution,
      },
    };
  }

  if (question.type === 'singleChoice' || question.type === 'multiChoice') {
    return {
      ...base,
      choices: Object.entries(stat.choice || {})
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => ({ label, count })),
    };
  }

  if (question.type === 'longText') {
    return {
      ...base,
      textValues: (stat.textValues || []).slice(0, 24),
    };
  }

  return base;
}

export function buildAiAnalysisPayload(dashboard, allResponses = {}, respondents = {}) {
  return {
    survey: {
      id: SURVEY_ID,
      questionVersion: QUESTION_VERSION,
      organization: surveyInfo.organization,
      title: surveyInfo.title,
      description: surveyInfo.description,
      generatedAt: Date.now(),
    },
    sample: {
      respondentCount: dashboard.respondentCount,
      completedCount: dashboard.completedCount,
      responseRowCount: Object.keys(allResponses || {}).length,
      completedRatio: dashboard.respondentCount ? roundMetric(dashboard.completedCount / dashboard.respondentCount) : null,
      respondentStatusCounts: Object.values(respondents || {}).reduce(
        (acc, respondent) => {
          if (respondent?.completed) acc.completed += 1;
          else acc.inProgress += 1;
          return acc;
        },
        { completed: 0, inProgress: 0 },
      ),
    },
    axisStats: dashboard.axisStats.map((axis) => ({
      axis: axis.axis,
      average: roundMetric(axis.average),
      answeredQuestionCount: axis.answeredQuestionCount,
      lowItems: axis.lowItems.map((item) => ({
        id: item.question.id,
        title: item.question.title,
        average: roundMetric(item.scale.average),
        lowRatio: roundMetric(item.scale.lowRatio),
      })),
    })),
    prioritySignals: {
      lowAverage: dashboard.lowAverage.map((stat) => summarizeQuestionStat(stat)),
      highVariance: dashboard.highVariance.map((stat) => summarizeQuestionStat(stat)),
      highNa: dashboard.highNa.map((stat) => summarizeQuestionStat(stat)),
    },
    questionStats: dashboard.questionStats
      .filter((stat) => stat.answeredCount > 0)
      .map((stat) => summarizeQuestionStat(stat)),
  };
}

export function toPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return `${Math.round(value * 100)}%`;
}

export function formatAverage(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return value.toFixed(2);
}
