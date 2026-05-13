import { QUESTION_VERSION, SURVEY_ID } from '../data/questions.js';
import {
  comparisonMappings,
  legacy2025ChoiceStats,
  legacy2025QualitativeThemes,
  legacy2025ScaleStats,
  legacy2025Survey,
} from '../data/legacy2025Comparison.js';

function roundMetric(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return Math.round(value * 100) / 100;
}

function weightedAverage(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return null;
  return items.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight;
}

function getCurrentStatMap(dashboard) {
  return new Map((dashboard?.questionStats || []).map((stat) => [stat.question.id, stat]));
}

function aggregateLegacy(ids = []) {
  const scaleStats = ids.map((id) => legacy2025ScaleStats[id]).filter(Boolean);
  if (scaleStats.length) {
    const n = scaleStats.reduce((sum, stat) => sum + stat.n, 0);
    return {
      type: 'scale',
      ids,
      titles: scaleStats.map((stat) => stat.title),
      n,
      average: roundMetric(weightedAverage(scaleStats.map((stat) => ({ value: stat.average, weight: stat.n })))),
      highRatio: roundMetric(scaleStats.reduce((sum, stat) => sum + stat.highRatio * stat.n, 0) / n),
      lowRatio: roundMetric(scaleStats.reduce((sum, stat) => sum + stat.lowRatio * stat.n, 0) / n),
      distribution: scaleStats.length === 1 ? scaleStats[0].distribution : null,
    };
  }

  const choiceStats = ids.map((id) => legacy2025ChoiceStats[id]).filter(Boolean);
  if (choiceStats.length) {
    return {
      type: 'choice',
      ids,
      titles: choiceStats.map((stat) => stat.title),
      n: choiceStats.reduce((sum, stat) => sum + stat.n, 0),
      choices: choiceStats[0].choices,
      positiveRatio: choiceStats[0].positiveRatio,
    };
  }

  return { type: 'missing', ids, titles: [], n: 0 };
}

function aggregateCurrent(ids = [], currentStatMap) {
  const stats = ids.map((id) => currentStatMap.get(id)).filter(Boolean);
  const scaleStats = stats.filter((stat) => stat.question.type === 'scale5na' && stat.scale);
  if (!scaleStats.length) {
    return {
      type: 'missing',
      ids,
      titles: stats.map((stat) => stat.question.title),
      n: 0,
      average: null,
      highRatio: null,
      lowRatio: null,
      naRatio: null,
    };
  }

  const numericCount = scaleStats.reduce((sum, stat) => sum + stat.scale.numericCount, 0);
  const answeredCount = scaleStats.reduce((sum, stat) => sum + stat.scale.answeredCount, 0);
  const highCount = scaleStats.reduce((sum, stat) => sum + stat.scale.highCount, 0);
  const lowCount = scaleStats.reduce((sum, stat) => sum + stat.scale.lowCount, 0);
  const naCount = scaleStats.reduce((sum, stat) => sum + stat.scale.naCount, 0);
  const average = weightedAverage(
    scaleStats
      .filter((stat) => stat.scale.average !== null)
      .map((stat) => ({ value: stat.scale.average, weight: stat.scale.numericCount })),
  );

  return {
    type: 'scale',
    ids,
    titles: scaleStats.map((stat) => stat.question.title),
    n: numericCount,
    answeredCount,
    average: roundMetric(average),
    highRatio: numericCount ? roundMetric(highCount / numericCount) : null,
    lowRatio: numericCount ? roundMetric(lowCount / numericCount) : null,
    naRatio: answeredCount ? roundMetric(naCount / answeredCount) : null,
    items: scaleStats.map((stat) => ({
      id: stat.question.id,
      title: stat.question.title,
      average: roundMetric(stat.scale.average),
      n: stat.scale.numericCount,
      highRatio: roundMetric(stat.scale.highRatio),
      lowRatio: roundMetric(stat.scale.lowRatio),
      naRatio: roundMetric(stat.scale.naRatio),
    })),
  };
}

function classifyDelta(delta, mapping) {
  if (!mapping.numericComparisonAllowed) {
    return { label: '참고 비교', tone: 'neutral', description: '응답 방식이나 문항 방향이 달라 숫자 변화로 단정하지 않습니다.' };
  }
  if (delta === null || delta === undefined) {
    return { label: '올해 데이터 대기', tone: 'neutral', description: '올해 응답이 충분히 쌓이면 변화 방향을 볼 수 있습니다.' };
  }
  if (delta >= 0.4) {
    return { label: '개선 신호', tone: 'positive', description: '비교 가능한 범위에서는 꽤 뚜렷한 개선 방향입니다.' };
  }
  if (delta >= 0.2) {
    return { label: '약한 개선', tone: 'positive', description: '좋아지는 방향은 보이지만 추가 확인이 필요합니다.' };
  }
  if (delta <= -0.4) {
    return { label: '우선 확인', tone: 'attention', description: '비교 가능한 범위에서는 먼저 들여다볼 만한 하락 신호입니다.' };
  }
  if (delta <= -0.2) {
    return { label: '주의 신호', tone: 'attention', description: '조금 나빠진 방향이 보여 토론에서 확인할 필요가 있습니다.' };
  }
  return { label: '큰 변화 없음', tone: 'neutral', description: '현재 수치만으로는 큰 변화가 확인되지 않습니다.' };
}

function summarizeChoiceStats(dashboard) {
  return (dashboard?.questionStats || [])
    .filter((stat) => ['CHOICE01', 'CHOICE02', 'CHOICE03', 'CHOICE04', 'CHOICE05', 'CHOICE06'].includes(stat.question.id))
    .map((stat) => ({
      id: stat.question.id,
      title: stat.question.title,
      choices: Object.entries(stat.choice || {})
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => ({ label, count })),
    }));
}

function summarizeCurrentText(dashboard) {
  return (dashboard?.questionStats || [])
    .filter((stat) => stat.question.type === 'longText' && stat.textValues?.length)
    .map((stat) => ({
      id: stat.question.id,
      title: stat.question.title,
      textValues: stat.textValues,
    }));
}

export function buildComparisonDataset(dashboard) {
  const currentStatMap = getCurrentStatMap(dashboard);
  const rows = comparisonMappings.map((mapping) => {
    const legacy = aggregateLegacy(mapping.legacyIds);
    const current = aggregateCurrent(mapping.currentIds, currentStatMap);
    const canCompare =
      mapping.numericComparisonAllowed &&
      legacy.type === 'scale' &&
      current.type === 'scale' &&
      legacy.average !== null &&
      current.average !== null;
    const averageDelta = canCompare ? roundMetric(current.average - legacy.average) : null;
    const favorableDelta = canCompare && current.highRatio !== null
      ? roundMetric(current.highRatio - legacy.highRatio)
      : null;
    const signal = classifyDelta(averageDelta, mapping);

    return {
      ...mapping,
      legacy,
      current,
      averageDelta,
      favorableDelta,
      signal,
    };
  });

  const constructs = [...new Set(rows.map((row) => row.construct))].map((construct) => {
    const constructRows = rows.filter((row) => row.construct === construct);
    const comparableRows = constructRows.filter((row) => row.averageDelta !== null);
    const averageDelta = comparableRows.length
      ? roundMetric(comparableRows.reduce((sum, row) => sum + row.averageDelta, 0) / comparableRows.length)
      : null;
    const signal = classifyDelta(averageDelta, { numericComparisonAllowed: Boolean(comparableRows.length) });

    return {
      construct,
      rows: constructRows,
      comparableCount: comparableRows.length,
      averageDelta,
      signal,
    };
  });

  const comparableRows = rows.filter((row) => row.averageDelta !== null);
  const improvements = [...comparableRows].sort((a, b) => b.averageDelta - a.averageDelta).slice(0, 4);
  const attention = [...comparableRows].sort((a, b) => a.averageDelta - b.averageDelta).slice(0, 4);

  return {
    legacySurvey: legacy2025Survey,
    currentSummary: {
      respondentCount: dashboard.respondentCount,
      completedCount: dashboard.completedCount,
      questionVersion: QUESTION_VERSION,
    },
    rows,
    constructs,
    improvements,
    attention,
    qualitativeThemes: legacy2025QualitativeThemes,
    currentText: summarizeCurrentText(dashboard),
    currentChoiceSignals: summarizeChoiceStats(dashboard),
  };
}

export function buildComparisonAiPayload(comparison) {
  return {
    survey: {
      id: SURVEY_ID,
      comparisonId: '2025-4Q-vs-2026-2Q',
      generatedAt: Date.now(),
    },
    samples: {
      legacy: {
        id: comparison.legacySurvey.id,
        title: comparison.legacySurvey.title,
        validResponseCount: comparison.legacySurvey.validResponseCount,
        validityRule: comparison.legacySurvey.validityRule,
      },
      current: comparison.currentSummary,
    },
    comparisonRows: comparison.rows.map((row) => ({
      id: row.id,
      construct: row.construct,
      title: row.title,
      level: row.level,
      legacyIds: row.legacyIds,
      currentIds: row.currentIds,
      numericComparisonAllowed: row.numericComparisonAllowed,
      legacy: {
        type: row.legacy.type,
        n: row.legacy.n,
        average: row.legacy.average,
        highRatio: row.legacy.highRatio,
        lowRatio: row.legacy.lowRatio,
        positiveRatio: row.legacy.positiveRatio,
        titles: row.legacy.titles,
      },
      current: {
        type: row.current.type,
        n: row.current.n,
        average: row.current.average,
        highRatio: row.current.highRatio,
        lowRatio: row.current.lowRatio,
        naRatio: row.current.naRatio,
        titles: row.current.titles,
        items: row.current.items,
      },
      averageDelta: row.averageDelta,
      favorableDelta: row.favorableDelta,
      signal: row.signal.label,
      rationale: row.rationale,
      caveat: row.caveat,
    })),
    constructComparisons: comparison.constructs.map((construct) => ({
      construct: construct.construct,
      comparableCount: construct.comparableCount,
      averageDelta: construct.averageDelta,
      signal: construct.signal.label,
      rowTitles: construct.rows.map((row) => row.title),
    })),
    qualitativeThemes: comparison.qualitativeThemes,
    currentText: comparison.currentText,
    currentChoiceSignals: comparison.currentChoiceSignals,
  };
}
