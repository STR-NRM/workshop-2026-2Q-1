import { QUESTION_VERSION, SURVEY_ID, axisMap, questions, surveyInfo } from '../data/questions.js';

export function responseValue(response) {
  if (!response) return undefined;
  return Object.prototype.hasOwnProperty.call(response, 'value') ? response.value : response;
}

export function flattenResponses(allResponses = {}) {
  return Object.entries(allResponses).flatMap(([uid, responses]) =>
    Object.entries(responses || {}).map(([questionId, response]) => ({
      uid,
      questionId,
      value: responseValue(response),
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
    .map((responses) => responseValue(responses?.[questionId]))
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
  return questions.map((question) => {
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
    condition: question.condition || null,
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
