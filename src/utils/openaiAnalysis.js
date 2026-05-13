const REPORT_VERSION = '2026-05-13-browser-analysis-v7-letter-and-chapters';
const DEFAULT_MODEL = 'gpt-5.5';
const DEFAULT_REASONING_EFFORT = 'high';
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

const reportSpecs = {
  comprehensive: {
    title: '종합 리포트',
    goal:
      '설문 전체를 종합해 워크샵에서 합의해야 할 논의 주제, 일이 막히는 구조적 지점, 4주 동안 해볼 작은 개선을 도출하세요.',
    requiredSections: `1. # Executive Summary
   - 첫 줄은 반드시 **한 문장 결론:** "핵심 문장" 형식으로 작성하세요. 따옴표 안은 10단어 이내여야 합니다.
   - 이어서 "## 쉬운 분석 요약"을 만들고, 설문 결과를 쉬운 말로 3~5개 목록으로 풀어쓰세요.
   - 이어서 "## 그래서 무엇을 해야 하나"를 만들고, 바로 실행할 제안 3~5개를 목록으로 작성하세요.
   - 각 목록은 18단어 이내로 짧게 쓰고, 가능한 경우 근거 수치 또는 관찰 신호를 붙이세요.
2. ## 1. 데이터 범위와 해석 주의
   - 응답자 수, 완료율, 응답 편향 가능성, 해석하면 안 되는 것과 해석 가능한 것을 구분하세요.
3. ## 2. 먼저 확인할 신호와 운영 관점 의미
   - 낮은 평균, 큰 응답 차이, 제한적으로 제공된 해당 없음/판단 어려움, 서술형 신호를 분리하고 "왜 중요한지"를 설명하세요.
4. ## 3. 일하는 방식 진단
   - 목표/우선순위, 역할과 책임, 직군 간 협업, 결정 방식, 사용자 문제 확인과 검증, 개발 실행, 타팀 협업을 나누어 진단하세요.
5. ## 4. 제품·기술·협업 운영 관점
   - AI Agent, AI Viewer, AI Idea, AI Reader, AI Editor를 별도 제품명이 등장하는 경우에만 조심스럽게 해석하세요.
   - 설문 데이터만으로 제품별 결론을 낼 수 없으면 "추가 확인 필요"로 남기세요.
6. ## 5. 함께 조정해야 할 문제와 합의 질문
   - 속도와 품질, 실험과 안정화, 자율과 조율, 내부 실행과 외부 협업을 균형 있게 정리하세요.
7. ## 6. 4주 동안 해볼 작은 개선 후보
   - 최소 5개, 최대 8개 후보를 제안하세요.
8. ## 7. 토론 그룹 주제
   - PM/제품, AI/데이터, BE/FE/개발, 외부 협업/운영 중 실제 응답 신호에 맞는 토론 그룹을 제안하세요.
9. ## 8. 다음 설문 또는 추가 확인 항목
   - 다음에 더 물어봐야 할 문항, 인터뷰로 확인할 것, 데이터로 검증할 것을 나누세요.`,
  },
  letter: {
    title: '편지',
    goal:
      '모든 문항을 망라하되, 긴 진단서가 아니라 팀원이 한 번에 읽을 수 있는 한 장짜리 편지형 분석을 작성하세요. 핵심 흐름, 우선 논의할 문제, 직무별로 건넬 말을 부드럽고 쉬운 언어로 정리하세요.',
    requiredSections: `1. # Executive Summary
   - 첫 줄은 반드시 **한 문장 결론:** "핵심 문장" 형식으로 작성하세요. 따옴표 안은 10단어 이내여야 합니다.
   - 이어서 "## 한 장으로 읽는 현재 이야기"를 작성하세요.
   - 본문은 3~5개 문단으로만 작성하세요. 목록을 남발하지 말고, 편하게 읽히는 짧은 문단으로 쓰세요.
   - 각 문단의 첫 문장은 반드시 **굵은 글씨**로 쓰고, 그 문단의 핵심 흐름이 첫 문장만 읽어도 보이게 하세요.
   - 각 문단의 첫 문장은 18단어 이내로 짧게 쓰세요.
   - 각 문단은 첫 문장 포함 2~4문장으로 제한하세요.
   - 쉬운 비유를 1~2개까지 사용할 수 있습니다. 단, 과장하거나 특정 직군을 탓하는 비유는 쓰지 마세요.
   - 수치, 선택형 신호, 서술형 신호, 직무별 추가 문항을 자연스럽게 연결하되, 데이터가 약한 부분은 조심스럽게 표현하세요.
2. ## 직무별로 건네는 말
   - 역할은 반드시 이 순서로 작성하세요: 제품/PM/프롬프트, AI 엔지니어링, 웹 개발(프론트/백엔드).
   - 각 역할은 반드시 아래 Markdown blockquote 형식을 사용하세요.
   - 각 역할 메시지는 정확히 3문장으로 작성하세요.
   - 첫 문장은 응답 기반 공감, 둘째 문장은 조심스러운 진단, 셋째 문장은 작은 제안 또는 격려로 작성하세요.
   - 따뜻하게 말하되, 칭찬이나 위로를 과하게 쓰지 마세요. 실제 응답 근거가 없는 말은 하지 마세요.
   - 한 역할 메시지는 130자 이내로 작성하세요.
   - 형식 예시:
     > **제품/PM/프롬프트에게:** "요구사항과 우선순위를 연결하느라 신경 쓸 일이 많았을 것 같습니다. 지금은 기준을 더 보이게 만드는 일이 도움이 됩니다. 작은 결정 기준표부터 함께 맞춰보면 좋겠습니다."
     > **AI 엔지니어링에게:** "품질 개선과 운영 안정 사이에서 균형을 잡는 부담이 있었을 수 있습니다. 실험 결과가 결정으로 이어지는 길을 더 짧게 만들 필요가 있습니다. 바꾼 것과 배운 것을 한 장으로 남겨보면 좋겠습니다."
     > **웹 개발(프론트/백엔드)에게:** "AI 기능의 느림과 실패까지 화면과 API로 받아내느라 고려할 것이 많았을 수 있습니다. 구현 전 합의가 늦으면 뒤에서 비용이 커질 가능성이 있습니다. 예외 상태와 책임 기준을 먼저 맞춰보면 좋겠습니다."`,
    letter: true,
  },
  closedEnded: {
    title: '선택형·척도형 문항 리포트',
    goal:
      '1~5점 척도, 단일선택, 복수선택 문항만 분석해 숫자로 보이는 신호와 선택 분포에서 드러나는 논의 주제를 도출하세요. 서술형 응답 원문은 사용하지 마세요.',
    requiredSections: `1. # Executive Summary
   - 첫 줄은 반드시 **한 문장 결론:** "핵심 문장" 형식으로 작성하세요. 따옴표 안은 10단어 이내여야 합니다.
   - 이어서 "## 쉬운 분석 요약"을 만들고, 점수/선택 결과에서 보이는 핵심 신호 3~5개를 쉬운 한국어 목록으로 요약하세요.
   - 이어서 "## 그래서 무엇을 해야 하나"를 만들고, 점수/선택 결과만 보고도 시작할 수 있는 제안 3~5개를 목록으로 작성하세요.
   - 각 목록은 18단어 이내로 짧게 쓰세요.
2. ## 1. 점수/선택 데이터 범위와 한계
   - 1~5점 척도, 단일선택, 복수선택 문항만 본다는 한계를 명시하세요.
3. ## 2. 낮은 평균과 큰 응답 차이 신호
   - 낮은 평균은 구조 확인 후보로, 큰 응답 차이는 경험 차이 또는 기준 차이 후보로 해석하세요.
4. ## 3. 선택형 문항에서 보이는 우선순위
   - 일이 막히는 지점, 4주 개선 영역, 여러 제품 운영, 타팀 협업, 토론 주제 선호를 표로 정리하세요.
5. ## 4. 직무별/추가 문항 해석
   - 직무별 문항은 개인/직군 평가가 아니라 역할별 업무 경험 차이로만 해석하세요.
6. ## 5. 워크샵 논의 주제 후보
   - 점수/선택 결과만으로 도출 가능한 논의 주제와, 서술형 또는 토론으로 확인해야 할 논의 주제를 구분하세요.
7. ## 6. 4주 동안 해볼 작은 개선 후보
   - 점수/선택 결과에 근거한 작고 검증 가능한 개선을 3~6개 제안하세요.`,
  },
  textByQuestion: {
    title: '서술형 문항별 리포트',
    goal:
      '서술형 응답을 문항별로 분석해 반복 테마, 소수 의견, 해석 주의점, 워크샵 토론 질문을 도출하세요.',
    requiredSections: `1. # Executive Summary
   - 첫 줄은 반드시 **한 문장 결론:** "핵심 문장" 형식으로 작성하세요. 따옴표 안은 10단어 이내여야 합니다.
   - 이어서 "## 쉬운 분석 요약"을 만들고, 서술형 응답 전체에서 보이는 핵심 테마 3~5개를 쉬운 한국어 목록으로 요약하세요.
   - 이어서 "## 그래서 무엇을 해야 하나"를 만들고, 워크샵에서 바로 다룰 제안 3~5개를 목록으로 작성하세요.
   - 각 목록은 18단어 이내로 짧게 쓰세요.
2. ## 1. 서술형 데이터 범위와 익명성 주의
   - 응답 수, 표현 수위, 개인 식별 위험을 어떻게 다루었는지 설명하세요.
3. ## 2. 문항별 분석
   - 각 TEXT 문항마다 "반복 테마", "소수이지만 중요한 신호", "해석 주의", "워크샵에서 확인할 질문"을 구분하세요.
4. ## 3. 문항 간 공통 패턴
   - 여러 문항에서 반복되는 운영 패턴과 서로 조정해야 할 문제를 정리하세요.
5. ## 4. 점수/선택 결과와 함께 확인해야 할 지점
   - 서술형만으로 단정하면 안 되는 부분과 점수/선택 결과 또는 토론으로 확인할 부분을 나누세요.
6. ## 5. 토론 그룹용 질문
   - 실제 워크샵에서 바로 사용할 수 있는 질문을 토론 그룹별로 제안하세요.`,
  },
};

function requirePayload(payload) {
  if (!payload?.survey?.id || !payload?.sample || !Array.isArray(payload?.questionStats)) {
    throw new Error('리포트를 만들 설문 데이터가 부족합니다.');
  }
  return payload;
}

function buildPrompt(payload, analysisType) {
  const spec = reportSpecs[analysisType] || reportSpecs.comprehensive;
  const executiveSummaryRule = spec.letter
    ? '- Executive Summary에는 첫 줄 한 문장 결론만 두고, 별도의 요약 목록은 넣지 마세요. 핵심 설명은 "한 장으로 읽는 현재 이야기"에 담으세요.'
    : '- Executive Summary는 길게 쓰지 마세요. 한 문장 결론, 쉬운 분석 요약 3~5개, 해야 할 일 3~5개만 넣으세요.';
  const structureRule = spec.letter
    ? '- 편지는 긴 보고서 문법보다 읽히는 흐름이 우선입니다. 각 문단은 요약, 근거, 해석, 제안이 자연스럽게 이어지게 쓰세요.'
    : '- 긴 보고서여도 구조가 선명해야 합니다. 각 섹션은 "요약", "근거", "해석", "실행 시사점" 순서가 드러나게 정리하세요.';
  const workshopActionRule = spec.letter
    ? '- 편지에는 별도 "워크샵에서 확인할 질문" 목록이나 4주 개선 후보 상세 목록을 넣지 마세요. 필요한 질문과 제안은 문단 안에 자연스럽게 녹이세요.'
    : '- 워크샵 현장에서 바로 토론할 수 있는 질문과 4주 동안 해볼 작은 개선 후보를 포함하세요.';
  const sectionClosingRule = spec.letter
    ? '- 별도 "워크샵에서 확인할 질문" 줄을 각 섹션 끝에 반복하지 마세요.'
    : '- 각 섹션 끝에는 팀원이 바로 이해할 수 있는 "워크샵에서 확인할 질문"을 1~3개 포함하세요.';
  const sectionSignalRule = spec.letter
    ? `- 편지는 짧은 이야기 흐름이 중요합니다. Executive Summary 이후에 **한문장 정리:**, **한문장 제안:** 형식을 반복하지 마세요.
- 대신 각 문단의 첫 문장을 굵게 처리해, 첫 문장들만 읽어도 전체 흐름이 이어지게 하세요.
- 직무별 메시지는 반드시 blockquote 형식으로 작성해 화면에서 따로 보이게 하세요.`
    : `- Executive Summary 이후 모든 큰 섹션은 반드시 첫 부분에 **한문장 정리:** "핵심 정리"와 **한문장 제안:** "핵심 제안"을 각각 한 줄씩 넣고, 그 아래에 상세 근거와 해석을 작성하세요.
- "한문장 정리"는 그 섹션에서 관찰한 사실 또는 해석을 10단어 이내로 말합니다.
- "한문장 제안"은 그 섹션을 읽고 워크샵에서 무엇을 해야 하는지 10단어 이내로 말합니다.
- 상세 리포트는 충분히 길고 구조적이어야 하지만, 각 섹션의 핵심은 위 두 문장만 읽어도 파악되어야 합니다.`;
  const closingRule = spec.letter
    ? '편지에는 별도의 "4주 개선 후보" 상세 양식을 붙이지 마세요. 필요한 제안은 본문과 직무별 메시지 안에 짧게 녹이세요.'
    : '각 4주 개선 후보에는 반드시 "가설", "첫 1주 실행", "성공 판단 신호", "부작용/주의점", "중단 기준"을 포함하세요.';

  return `다음은 누리미디어 AI 사업부 2026 상반기 워크샵 사전 설문의 익명 집계 데이터입니다.

분석 유형:
- ${spec.title}

응답 데이터:
${JSON.stringify(payload, null, 2)}

보고서 목표:
- ${spec.goal}
- 단순 요약이 아니라, 조직 운영, 제품 운영, 개발 협업, AI 제품 사업화 경험이 있는 외부 전문가들이 함께 검토한 수준의 보고서처럼 작성하세요.
- 다만 독자는 실제 워크샵에 참여하는 실무 팀원입니다. 어려운 전문 용어를 남발하지 말고, 필요하면 쉬운 한국어로 풀어 쓰세요.
- 보고서의 목적은 "좋다/나쁘다" 판정이 아니라, 워크샵에서 합의해야 할 논의 주제와 4주 동안 해볼 작은 개선을 찾는 것입니다.

작성 원칙:
- 반드시 "# Executive Summary"로 시작하세요.
- 전체 보고서는 한국어로 작성하되, 첫 제목 "Executive Summary"는 영어 그대로 유지하세요.
- 읽는 사람은 PM, 프론트엔드, 백엔드, AI 엔지니어, 프롬프트 엔지니어가 섞인 실무 팀원입니다.
- 모든 "**한 문장 결론:**", "**한문장 정리:**", "**한문장 제안:**" 값은 반드시 큰따옴표로 감싸고 10단어 이내로 작성하세요.
- 이 세 문장은 포스터 헤드라인처럼 짧고 선명해야 합니다. 예: "일은 빠른데, 교통정리가 늦습니다."
- 쉬운 비유를 써도 됩니다. 단, 특정 직군을 탓하거나 과장된 선동 문구처럼 쓰지 마세요.
- 독자가 10초 안에 핵심을 잡아야 합니다. 긴 개념어, 전문 용어, 추상명사는 줄이고 동사 중심으로 쓰세요.
${executiveSummaryRule}
- 개인 평가처럼 보이는 표현, 특정 직군 탓으로 읽히는 표현, 과장된 긍정/부정 표현을 피하세요.
- 응답 수가 적으면 응답자 수의 한계를 명시하고, 결론을 단정하지 마세요.
${structureRule}
- 수치와 서술형 응답을 구분해서 해석하고, 서술형은 익명성을 해칠 수 있는 표현을 일반화하세요.
- 챕터 흐름은 팀 경험/몰입, 목표와 실행, 협업과 운영, 우선순위, 직무별 추가, 마지막 회고 순서로 읽어야 합니다.
- 팀 추천 의향 0~10 문항은 표본이 작으므로 단독 점수로 단정하지 말고, 다른 신호와 함께 보는 기준점으로만 해석하세요.
- 수치가 약한 지점에서는 "추정", "가능성", "확인 필요"를 명확히 구분하세요.
- 확신 수준은 높음/중간/낮음으로 표시하고, 확신 수준이 낮은 결론은 실행안으로 단정하지 마세요.
${workshopActionRule}
- 표를 사용하면 읽기 쉬운 곳에는 Markdown 표를 사용하세요.
${sectionClosingRule}
- 핵심만 읽고 싶은 사람도 이해할 수 있게 Executive Summary를 가장 정교하게 작성하세요.
${sectionSignalRule}

필수 섹션:
${spec.requiredSections}

${closingRule}`;
}

function normalizeReport(text) {
  const trimmed = String(text || '').trim();
  if (/^#\s*Executive Summary/i.test(trimmed)) return trimmed;
  if (/^Executive Summary/i.test(trimmed)) return `# ${trimmed}`;
  return `# Executive Summary
- 생성된 응답이 지정된 제목으로 시작하지 않아, 운영자가 읽을 수 있도록 제목을 보정했습니다.

${trimmed}`;
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

  const serialized = JSON.stringify(body?.output ?? body, null, 2);
  if (serialized && serialized !== '{}') return serialized;
  return '';
}

export async function requestWorkshopAnalysis({
  apiKey,
  payload,
  analysisType = 'comprehensive',
  model = DEFAULT_MODEL,
  reasoningEffort = DEFAULT_REASONING_EFFORT,
}) {
  const normalizedApiKey = String(apiKey || '').trim();
  if (!normalizedApiKey) {
    throw new Error('리포트 생성용 키를 입력해야 합니다.');
  }

  const validPayload = requirePayload(payload);
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
    throw new Error(body?.error?.message || `리포트 생성 요청이 실패했습니다. (${response.status})`);
  }

  return {
    result: normalizeReport(extractOutputText(body)),
    analysisType,
    title: (reportSpecs[analysisType] || reportSpecs.comprehensive).title,
    model,
    reasoningEffort,
    analyzedAt: Date.now(),
    reportVersion: REPORT_VERSION,
    generatedBy: {
      mode: 'browser',
    },
    inputSummary: {
      surveyId: validPayload.survey.id,
      questionVersion: validPayload.survey.questionVersion || null,
      respondentCount: validPayload.sample.respondentCount,
      completedCount: validPayload.sample.completedCount,
      questionCount: validPayload.questionStats.length,
    },
  };
}
