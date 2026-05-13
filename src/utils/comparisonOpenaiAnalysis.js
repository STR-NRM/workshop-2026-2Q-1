const COMPARISON_REPORT_VERSION = '2026-05-14-comparison-analysis-v1';
const DEFAULT_MODEL = 'gpt-5.5';
const DEFAULT_REASONING_EFFORT = 'high';
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const LEGACY_COMPARISON_LETTER_HEADING = ['비교', '편지'].join(' ');

export const comparisonAnalysisConfigs = {
  comparisonLetter: {
    type: 'comparisonLetter',
    tabId: 'ai-comparison-letter',
    tabLabel: '💌 한 장의 편지',
    title: '한 장의 편지',
    narrative: true,
    goal:
      '2025 하반기와 2026 상반기 설문을 비교해 팀에게 건네는 짧고 따뜻한 편지를 작성하세요. 분석표가 아니라, 시간이 지나며 팀이 어떤 길을 지나왔는지 조심스럽게 읽어주는 편지여야 합니다.',
    requiredSections: `# 한 장의 편지
- 제목 다음 줄에 "스쿼드 여러분께."처럼 짧은 인사말을 넣으세요.
- 본문은 4문단만 작성하세요. 전체 분량은 750~1,000자 정도로 제한하세요.
- 각 문단의 첫 문장은 굵게 쓰고, 첫 문장들만 이어 읽어도 작년에서 올해로 이어진 흐름이 보여야 합니다.
- 첫 세 문단은 제안보다 공감과 편지 말투의 가벼운 해석이 중심이어야 합니다.
- 마지막 문단에서만 조심스럽게 한두 가지 바람을 건네고, 마지막 문장은 격려와 공감으로 닫으세요.
- 숫자, 표본, 평균, 매핑 등급, 문항 ID, 확신 수준 같은 분석 표현은 쓰지 마세요.
- "작년에는", "올해는"이라는 표현은 자연스럽게 쓸 수 있지만, 비교표처럼 딱딱하게 나열하지 마세요.
- 쉬운 비유는 1개 정도만 사용할 수 있습니다. 너무 시적이거나 이해하기 어려운 비유는 피하세요.
- Executive Summary, 한 문장 결론, 표, 실행 목록은 쓰지 마세요.`,
  },
  comparisonOverview: {
    type: 'comparisonOverview',
    tabId: 'ai-comparison-overview',
    tabLabel: '종합',
    title: '비교 종합 리포트',
    goal:
      '2025 하반기와 2026 상반기의 조직 신호를 비교해, 유지된 강점, 달라진 문제, 새로 생긴 복잡도, 워크샵에서 다룰 질문을 정리하세요.',
    requiredSections: `# Executive Summary
- 첫 줄은 반드시 **한 문장 결론:** "핵심 문장" 형식으로 작성하세요. 따옴표 안은 10단어 이내로 쓰세요.
- 이어서 "## 쉬운 비교 요약"에 3~5개 문장형 목록을 작성하세요.
- 이어서 "## 그래서 무엇을 해야 하나"에 워크샵 제안 3~5개를 작성하세요.

## 1. 유지된 힘
- 작년부터 올해까지 이어진 강점과 그 의미를 설명하세요.

## 2. 달라진 막힘
- 같은 문제가 다른 모습으로 남아 있는지, 또는 새 문제가 생겼는지 설명하세요.

## 3. 비교하면 안 되는 지점
- 문항 변경, 역할 분기, 작은 표본 때문에 단정하면 안 되는 부분을 명확히 쓰세요.

## 4. 워크샵에서 확인할 질문
- 현장에서 바로 읽을 수 있는 질문 4~6개를 작성하세요.`,
  },
  matchedItems: {
    type: 'matchedItems',
    tabId: 'ai-matched-items',
    tabLabel: '문항 변화',
    title: '매칭 문항 변화 리포트',
    goal:
      '문항 매핑 등급과 caveat를 기준으로, 실제로 비교 가능한 변화와 조심해서 봐야 할 변화를 분리해 해석하세요.',
    requiredSections: `# Executive Summary
- 첫 줄은 반드시 **한 문장 결론:** "핵심 문장" 형식으로 작성하세요.
- 이어서 "## 비교 가능한 변화"와 "## 조심해서 볼 변화"를 각각 3~5개 목록으로 작성하세요.

## 1. 근거가 비교적 강한 변화
- M1 중심으로 해석하세요.

## 2. 제한적으로만 볼 변화
- M2와 numericComparisonAllowed=false 항목은 caveat를 먼저 말하고 해석하세요.

## 3. 숫자보다 토론이 필요한 문항
- 평균 차이로 결론 내리면 안 되는 항목과 토론 질문을 정리하세요.`,
  },
  qualitativeChange: {
    type: 'qualitativeChange',
    tabId: 'ai-qualitative-change',
    tabLabel: '서술형 변화',
    title: '서술형 변화 리포트',
    goal:
      '작년의 익명 정성 요약과 올해 서술형 응답을 비교해, 팀원들이 쓰는 말과 걱정의 주제가 어떻게 달라졌는지 정리하세요.',
    requiredSections: `# Executive Summary
- 첫 줄은 반드시 **한 문장 결론:** "핵심 문장" 형식으로 작성하세요.
- 이어서 "## 말의 흐름 변화"에 3~5개 목록을 작성하세요.

## 1. 작년에도 있었고 올해도 남은 말
- 이어진 정서와 문제를 설명하세요.

## 2. 올해 더 뚜렷해진 말
- 제품 운영, 우선순위, 협업, 지식 공유처럼 새로 강해진 언어를 정리하세요.

## 3. 워크샵에서 놓치면 안 되는 목소리
- 올해 서술형에서 워크샵 질문으로 바꿀 내용을 제안하세요.`,
  },
};

export const comparisonAnalysisTypes = Object.keys(comparisonAnalysisConfigs);

function requireComparisonPayload(payload) {
  if (!payload?.survey?.comparisonId || !Array.isArray(payload?.comparisonRows)) {
    throw new Error('비교 리포트를 만들 데이터가 부족합니다.');
  }
  return payload;
}

function buildPrompt(payload, analysisType) {
  const spec = comparisonAnalysisConfigs[analysisType] || comparisonAnalysisConfigs.comparisonOverview;
  const isNarrative = Boolean(spec.narrative);
  const dataHandling = isNarrative
    ? `- 데이터는 편지의 방향을 잡는 참고 자료입니다. 본문에 숫자, 평균, 응답 수, 문항 ID, 매핑 등급을 쓰지 마세요.
- 단정하지 말고 "그랬을 수 있겠습니다", "그 마음이 조금 느껴집니다"처럼 조심스럽게 말하세요.
- 공감은 실제 비교 흐름과 연결하되, 모든 문단을 위로나 격려로만 채우지 마세요.`
    : `- 매핑 등급과 caveat를 반드시 반영하세요.
- M2 이하이거나 numericComparisonAllowed=false인 항목은 숫자 변화로 단정하지 마세요.
- 작은 표본이므로 통계적 유의성 표현을 쓰지 말고, 사람 수와 분포의 방향 신호로 설명하세요.
- 서술형 원문은 개인이 드러나지 않게 일반화하세요.`;

  return `다음은 누리미디어 AI 사업부 워크샵의 2025 하반기 설문과 2026 상반기 설문을 비교하기 위한 익명 집계 데이터입니다.

분석 유형:
- ${spec.title}

응답 데이터:
${JSON.stringify(payload, null, 2)}

작성 목표:
- ${spec.goal}
- 독자는 실제 워크샵에 참여하는 PM, 프론트엔드, 백엔드, AI 엔지니어, 프롬프트 엔지니어입니다.
- 목적은 평가가 아니라 작년에서 올해로 이어진 조직 신호를 읽고, 이번 워크샵에서 다룰 질문을 찾는 것입니다.

작성 원칙:
- ${isNarrative ? '반드시 "# 한 장의 편지"로 시작하고 Executive Summary를 쓰지 마세요.' : '반드시 "# Executive Summary"로 시작하세요.'}
- ${isNarrative ? '한 문장 결론, 한문장 정리, 한문장 제안 형식을 쓰지 마세요.' : '첫 섹션에는 반드시 **한 문장 결론:** "핵심 문장"을 포함하세요.'}
- 한국어로 작성하세요. 전문 용어를 쓰더라도 바로 쉬운 말로 풀어주세요.
- 긍정/부정 어느 쪽으로도 몰아가지 말고, 근거가 약한 부분은 약하다고 말하세요.
${dataHandling}
- 2025는 스쿼드 전환 초기, 2026은 AI 사업부 확장 이후라는 맥락 차이를 반영하세요.

필수 섹션:
${spec.requiredSections}`;
}

function extractOutputText(body) {
  if (typeof body?.output_text === 'string' && body.output_text.trim()) return body.output_text;
  const output = Array.isArray(body?.output) ? body.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const contentItem of content) {
      if (typeof contentItem?.text === 'string' && contentItem.text.trim()) return contentItem.text;
    }
  }
  return JSON.stringify(body?.output ?? body, null, 2);
}

function normalizeReport(text, analysisType) {
  const trimmed = String(text || '').trim();
  if (analysisType === 'comparisonLetter') {
    const cleaned = trimmed
      .replace(/^#?\s*Executive Summary\s*/i, '')
      .replace(/^(?:[-*]\s*)?(?:\*\*)?\s*한\s*문장\s*결론\s*:[^\n]+\n?/i, '')
      .trim();
    if (/^#\s+한 장의 편지/.test(cleaned)) return cleaned;
    if (cleaned.startsWith(`# ${LEGACY_COMPARISON_LETTER_HEADING}`)) {
      return cleaned.replace(`# ${LEGACY_COMPARISON_LETTER_HEADING}`, '# 한 장의 편지');
    }
    return `# 한 장의 편지\n\n${cleaned}`;
  }
  if (/^#\s*Executive Summary/i.test(trimmed)) return trimmed;
  if (/^Executive Summary/i.test(trimmed)) return `# ${trimmed}`;
  return `# Executive Summary\n\n${trimmed}`;
}

export async function requestComparisonAnalysis({
  apiKey,
  payload,
  analysisType = 'comparisonOverview',
  model = DEFAULT_MODEL,
  reasoningEffort = DEFAULT_REASONING_EFFORT,
}) {
  const normalizedApiKey = String(apiKey || '').trim();
  if (!normalizedApiKey) {
    throw new Error('리포트 생성용 키를 입력해야 합니다.');
  }

  const validPayload = requireComparisonPayload(payload);
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${normalizedApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: reasoningEffort },
      max_output_tokens: 12000,
      input: buildPrompt(validPayload, analysisType),
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error?.message || `비교 리포트 생성 요청이 실패했습니다. (${response.status})`);
  }

  const config = comparisonAnalysisConfigs[analysisType] || comparisonAnalysisConfigs.comparisonOverview;
  return {
    result: normalizeReport(extractOutputText(body), analysisType),
    analysisType,
    title: config.title,
    model,
    reasoningEffort,
    analyzedAt: Date.now(),
    reportVersion: COMPARISON_REPORT_VERSION,
    generatedBy: { mode: 'browser' },
    inputSummary: {
      comparisonId: validPayload.survey.comparisonId,
      legacyRespondentCount: validPayload.samples.legacy.validResponseCount,
      currentCompletedCount: validPayload.samples.current.completedCount,
      mappingCount: validPayload.comparisonRows.length,
    },
  };
}
