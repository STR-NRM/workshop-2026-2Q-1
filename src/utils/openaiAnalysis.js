const REPORT_VERSION = '2026-05-13-browser-analysis-v4-report-suite';
const DEFAULT_MODEL = 'gpt-5.5';
const DEFAULT_REASONING_EFFORT = 'high';
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

const reportSpecs = {
  comprehensive: {
    title: '종합 리포트',
    goal:
      '설문 전체를 종합해 워크샵에서 합의해야 할 운영 의제, 구조적 병목, 4주 실행 실험을 도출하세요.',
    requiredSections: `1. # Executive Summary
   - 5~8개 bullet로 핵심 결론, 가장 큰 리스크, 가장 먼저 합의할 의제, 4주 내 실행 후보를 요약하세요.
   - 각 bullet에는 가능한 경우 근거 수치 또는 관찰 신호를 붙이세요.
2. ## 1. 데이터 범위와 해석 주의
   - 표본 수, 완료율, 응답 편향 가능성, 해석하면 안 되는 것과 해석 가능한 것을 구분하세요.
3. ## 2. 우선순위 신호와 경영적 의미
   - 낮은 평균, 큰 이견, 제한적으로 제공된 N/A, 서술형 신호를 분리하고 "왜 중요한지"를 설명하세요.
4. ## 3. 운영체계 진단
   - 목표/우선순위, 역할과 책임, 직군 간 협업, 의사결정, 제품 발견과 검증, 개발 실행, 외부 협업 접점을 나누어 진단하세요.
5. ## 4. 제품·기술·협업 포트폴리오 관점
   - AI Agent, AI Viewer, AI Idea, AI Reader, AI Editor를 별도 제품명이 등장하는 경우에만 조심스럽게 해석하세요.
   - 설문 데이터만으로 제품별 결론을 낼 수 없으면 "추가 확인 필요"로 남기세요.
6. ## 5. 주요 긴장관계와 합의가 필요한 질문
   - 속도와 품질, 실험과 안정화, 자율과 조율, 내부 실행과 외부 협업을 균형 있게 정리하세요.
7. ## 6. 4주 실행 실험 후보
   - 최소 5개, 최대 8개 후보를 제안하세요.
8. ## 7. 분과 토론 아젠다
   - PM/제품, AI/데이터, BE/FE/개발, 외부 협업/운영 중 실제 응답 신호에 맞는 분과를 제안하세요.
9. ## 8. 다음 설문 또는 추가 확인 항목
   - 다음에 더 물어봐야 할 문항, 인터뷰로 확인할 것, 데이터로 검증할 것을 나누세요.`,
  },
  closedEnded: {
    title: '비주관식 문항 리포트',
    goal:
      '리커트, 단일선택, 복수선택 문항만 분석해 정량 신호와 선택 분포에서 드러나는 운영 의제를 도출하세요. 서술형 응답 원문은 사용하지 마세요.',
    requiredSections: `1. # Executive Summary
   - 정량 문항에서 보이는 핵심 신호 5~8개를 쉬운 한국어 bullet로 요약하세요.
2. ## 1. 정량 데이터 범위와 한계
   - 리커트, 단일선택, 복수선택 문항만 본다는 한계를 명시하세요.
3. ## 2. 낮은 평균과 높은 분산 신호
   - 낮은 평균은 구조 확인 후보로, 높은 분산은 경험 차이 또는 기준 차이 후보로 해석하세요.
4. ## 3. 선택형 문항에서 보이는 우선순위
   - 병목, 4주 개선 영역, 제품 포트폴리오, 외부 협업, 분과 선호를 표로 정리하세요.
5. ## 4. 역할/조건부 라우팅 해석
   - 역할별 문항은 개인/직군 평가가 아니라 역할 접점별 경험 차이로만 해석하세요.
6. ## 5. 워크샵 의제 후보
   - 정량 신호만으로 도출 가능한 의제와, 서술형 또는 토론으로 확인해야 할 의제를 구분하세요.
7. ## 6. 4주 실행 실험 후보
   - 정량 신호에 근거한 작고 검증 가능한 실험을 3~6개 제안하세요.`,
  },
  textByQuestion: {
    title: '주관식 문항별 리포트',
    goal:
      '주관식 응답을 문항별로 분석해 반복 테마, 소수 의견, 해석 주의점, 워크샵 토론 질문을 도출하세요.',
    requiredSections: `1. # Executive Summary
   - 주관식 응답 전체에서 보이는 핵심 테마 5~8개를 쉬운 한국어 bullet로 요약하세요.
2. ## 1. 주관식 데이터 범위와 익명성 주의
   - 응답 수, 표현 수위, 개인 식별 위험을 어떻게 다루었는지 설명하세요.
3. ## 2. 문항별 분석
   - 각 TEXT 문항마다 "반복 테마", "소수이지만 중요한 신호", "해석 주의", "워크샵에서 확인할 질문"을 구분하세요.
4. ## 3. 문항 간 공통 패턴
   - 여러 문항에서 반복되는 운영 패턴과 긴장관계를 정리하세요.
5. ## 4. 정량 결과와 함께 확인해야 할 지점
   - 주관식만으로 단정하면 안 되는 부분과 정량/토론으로 확인할 부분을 나누세요.
6. ## 5. 분과 토론용 질문
   - 실제 워크샵에서 바로 사용할 수 있는 질문을 분과별로 제안하세요.`,
  },
};

function requirePayload(payload) {
  if (!payload?.survey?.id || !payload?.sample || !Array.isArray(payload?.questionStats)) {
    throw new Error('AI 분석에 필요한 설문 데이터가 부족합니다.');
  }
  return payload;
}

function buildPrompt(payload, analysisType) {
  const spec = reportSpecs[analysisType] || reportSpecs.comprehensive;
  return `다음은 누리미디어 AI 사업부 2026 상반기 워크샵 사전 설문의 익명 집계 데이터입니다.

분석 유형:
- ${spec.title}

응답 데이터:
${JSON.stringify(payload, null, 2)}

보고서 목표:
- ${spec.goal}
- 단순 요약이 아니라, 조직 운영, 제품 운영, 개발 협업, AI 제품 사업화 경험이 있는 외부 전문가들이 함께 검토한 수준의 컨설팅 보고서처럼 작성하세요.
- 다만 독자는 실제 워크샵에 참여하는 실무 팀원입니다. 어려운 컨설팅 용어를 남발하지 말고, 필요하면 쉬운 한국어로 풀어 쓰세요.
- 보고서의 목적은 "좋다/나쁘다" 판정이 아니라, 워크샵에서 합의해야 할 운영 의제와 4주 실행 실험을 찾는 것입니다.

작성 원칙:
- 반드시 "# Executive Summary"로 시작하세요.
- 전체 보고서는 한국어로 작성하되, 첫 제목 "Executive Summary"는 영어 그대로 유지하세요.
- 읽는 사람은 PM, 프론트엔드, 백엔드, AI 엔지니어, 프롬프트 엔지니어가 섞인 실무 팀원입니다.
- 개인 평가처럼 보이는 표현, 특정 직군 탓으로 읽히는 표현, 과장된 긍정/부정 표현을 피하세요.
- 응답 수가 적으면 표본 한계를 명시하고, 결론을 단정하지 마세요.
- 긴 보고서여도 구조가 선명해야 합니다. 각 섹션은 "요약", "근거", "해석", "실행 시사점" 순서가 드러나게 정리하세요.
- 수치와 서술형 응답을 구분해서 해석하고, 서술형은 익명성을 해칠 수 있는 표현을 일반화하세요.
- 수치가 약한 지점에서는 "추정", "가능성", "확인 필요"를 명확히 구분하세요.
- 확신도는 높음/중간/낮음으로 표시하고, 확신도가 낮은 결론은 실행안으로 단정하지 마세요.
- 워크샵 현장에서 바로 토론할 수 있는 질문과 4주 운영 실험 후보를 포함하세요.
- 표를 사용하면 읽기 쉬운 곳에는 Markdown 표를 사용하세요.
- 각 섹션 끝에는 팀원이 바로 이해할 수 있는 "워크샵에서 확인할 질문"을 1~3개 포함하세요.

필수 섹션:
${spec.requiredSections}

각 실행 실험 후보에는 반드시 "가설", "첫 1주 실행", "성공 판단 신호", "부작용/주의점", "중단 기준"을 포함하세요.`;
}

function normalizeReport(text) {
  const trimmed = String(text || '').trim();
  if (/^#\s*Executive Summary/i.test(trimmed)) return trimmed;
  if (/^Executive Summary/i.test(trimmed)) return `# ${trimmed}`;
  return `# Executive Summary
- 모델 응답이 지정된 제목으로 시작하지 않아, 운영자가 읽을 수 있도록 제목을 보정했습니다.

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
    throw new Error('OpenAI API key를 입력해야 AI 분석을 생성할 수 있습니다.');
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
    throw new Error(body?.error?.message || `OpenAI 분석 요청이 실패했습니다. (${response.status})`);
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
