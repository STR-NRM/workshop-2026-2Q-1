const REPORT_VERSION = '2026-05-13-browser-analysis-v13-letter-message-human';
const DEFAULT_MODEL = 'gpt-5.5';
const DEFAULT_REASONING_EFFORT = 'high';
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

const reportSpecs = {
  comprehensive: {
    title: '종합 리포트',
    goal:
      '설문 전체를 종합해 팀원이 읽고 바로 토론할 수 있는 전문가 리포트를 작성하세요. 수치 나열보다 현재 상황의 의미, 워크샵에서 합의할 질문, 4주 동안 해볼 작은 개선을 중심으로 정리하세요.',
    requiredSections: `1. # Executive Summary
   - 첫 줄은 반드시 **한 문장 결론:** "핵심 문장" 형식으로 작성하세요. 따옴표 안은 10단어 이내여야 합니다.
   - 이어서 "## 쉬운 분석 요약"을 만들고, 지금 상황을 팀원이 바로 이해할 수 있게 3~5개 문장형 목록으로 풀어쓰세요.
   - 이어서 "## 그래서 무엇을 해야 하나"를 만들고, 워크샵에서 바로 합의할 제안 3~5개를 작성하세요.
   - 각 목록은 짧고 구체적으로 쓰되, 숫자는 꼭 필요한 경우에만 한두 개만 언급하세요.
2. ## 1. 지금 팀의 큰 그림
   - 전체 응답이 말하는 현재 상태를 하나의 이야기로 설명하세요.
   - 잘하고 있는 점과 흔들리는 점을 동시에 보되, 칭찬이나 비판으로 치우치지 마세요.
3. ## 2. 워크샵에서 먼저 맞춰야 할 질문
   - 우선순위, 역할 합의, 외부 협업, 운영 제품과 실험 제품의 차이 중 무엇을 먼저 맞춰야 하는지 정리하세요.
   - 질문은 실제 토론에서 바로 읽을 수 있는 문장으로 작성하세요.
4. ## 3. 제품과 협업 운영의 해석
   - AI Agent, AI Viewer, AI Idea, AI Reader, AI Editor는 응답에 등장하는 범위 안에서만 조심스럽게 해석하세요.
   - 제품별 결론을 낼 수 없으면 결론 대신 확인 질문으로 남기세요.
5. ## 4. 4주 동안 해볼 작은 개선
   - 최소 5개, 최대 7개 후보를 제안하세요.
   - 각 후보는 "무엇을 바꿀지", "처음 1주에 할 일", "좋아졌는지 볼 신호"만 간결하게 적으세요.
6. ## 5. 다음에 확인할 것
   - 이번 설문만으로 단정하면 안 되는 부분, 토론으로 확인할 부분, 다음 설문이나 업무 데이터로 확인할 부분을 나누세요.`,
  },
  letter: {
    title: '한 장의 편지',
    goal:
      '설문 데이터를 참고해 팀에게 건네는 짧고 따뜻한 편지를 작성하세요. 분석 결과를 설명하는 글이 아니라, 응답을 읽고 마음을 헤아린 사람이 조심스럽게 전하는 편지여야 합니다.',
    requiredSections: `1. # 한 장의 편지
   - 제목 다음 줄에 짧은 인사말을 넣으세요. 예: "스쿼드 여러분께."
   - 본문은 3~4개 문단으로만 작성하세요.
   - 전체 분량은 650~900자 정도로 제한하세요. 지금보다 짧고, 숨이 편해야 합니다.
   - 각 문단은 2~3문장으로만 쓰세요. 길게 설명하지 말고, 편지처럼 여백을 남기세요.
   - 각 문단의 첫 문장은 **굵은 글씨**로 쓰되, 보고서 제목이나 요약 문장처럼 만들지 마세요.
   - 첫 문장은 팀에게 조심스럽게 말을 거는 문장이어야 합니다. 첫 문장들만 이어 읽어도 마음의 흐름과 핵심이 잡혀야 합니다.
   - 좋은 첫 문장 예: "**여러 일을 동시에 붙잡고 오느라, 마음이 꽤 바빴을 것 같습니다.**"
   - 좋은 첫 문장 예: "**열심히 움직였는데 방향이 자주 바뀌면, 누구라도 조금은 지칠 수 있습니다.**"
   - 피해야 할 첫 문장 예: "**이번 설문은 우선순위 정렬과 협업 구조의 병목을 보여줍니다.**"
   - 피해야 할 첫 문장 예: "**흐린 항로표 위에 접힌 등대가 조용히 흔들립니다.**"
   - 말투는 따뜻하고 배려 깊고 정중한 상담자가 편지를 건네는 느낌으로 쓰세요.
   - 분석한다고 말하지 말고, "보다 보니", "읽다 보니", "그 마음이 조금 느껴졌습니다"처럼 응답을 읽고 마음을 헤아리는 표현을 쓰세요.
   - 공감은 설문 신호와 연결하되, 특정 위로 문구를 반복하지 마세요. 문단마다 다른 말로 자연스럽게 표현하세요.
   - 비유는 쓰면 좋습니다. 다만 초등학생도 이해할 만큼 쉬운 비유만 1~2개 정도 쓰고, 어려운 상징 문장으로 시작하지 마세요.
   - 비유를 썼다면 바로 뒤에 실제 업무 의미를 쉬운 말로 풀어주세요.
   - 숫자, 응답 수, 평균, 확신 수준, 문항 ID, 표본 한계 같은 분석 표현은 쓰지 마세요.
   - "진단", "병목", "메트릭", "워크스트림", "의존성", "확신 수준", "근거" 같은 리포트 어휘는 되도록 쓰지 마세요.
   - 마지막 문단은 거창한 결론이 아니라, "조금 덜 흔들리게 같이 맞춰가면 좋겠습니다"처럼 짧고 따뜻하게 닫으세요.
   - 이 문서는 오직 편지만 담습니다. Executive Summary, 한 문장 결론, 역할별 메시지, 표, 실행 후보 목록, 토론 질문 목록은 작성하지 마세요.`,
    letter: true,
  },
  roleMessages: {
    title: '직무별 메시지',
    goal:
      '역할별 응답 신호를 참고해 각 직무의 팀원에게 건네는 따뜻한 한마디를 작성하세요. 이것은 분석 설명이 아니라, 응답을 읽은 따뜻한 상담자가 조심스럽게 건네는 공감과 작은 제안입니다.',
    requiredSections: `1. # 직무별 메시지
   - 반드시 아래 5개 역할을 이 순서로 작성하세요: PM/제품 담당 분들께, 프롬프트 엔지니어 분들께, AI 엔지니어링 분들께, 프론트엔드 분들께, 백엔드 분들께.
   - 각 역할 메시지는 반드시 Markdown blockquote 형식을 사용하세요.
   - 각 역할 메시지는 3~4문장으로 작성하세요.
   - 각 메시지는 "그 역할이 겪었을 법한 마음을 알아주는 말" → "그 안에서 보이는 조심스러운 흐름을 쉬운 말로 짚어주는 말" → "부담을 덜어주는 작은 제안 또는 격려" 순서로 이어가세요.
   - 공감 표현은 고정 문구처럼 반복하지 마세요. 역할별 상황에 맞게 자연스럽게 변주하세요.
   - 사용할 수 있는 어조의 예시는 다음과 같습니다. 이 문장을 그대로 복사하지 말고 상황에 맞게 새로 쓰세요: "여러 우선순위를 다시 정리해야 하는 시간이 많았겠어요", "답이 하나로 떨어지지 않는 문제를 계속 붙잡고 계셨겠어요", "화면과 일정 사이에서 다시 맞춰야 할 일이 적지 않았겠어요", "배포와 안정성 뒤편을 조용히 챙기느라 신경 쓸 일이 많았겠어요".
   - 과도한 위로, 같은 감정어 반복, 모든 역할에 같은 문장 구조를 쓰는 방식은 피하세요.
   - 한 역할 메시지는 180~320자 정도로 쓰되, 충분히 따뜻하게 느껴져야 합니다.
   - 말투는 마음 따뜻한 상담자가 조용히 말을 건네는 느낌으로 쓰세요. 다만 실제 응답 근거가 없는 위로나 칭찬은 하지 마세요.
   - "고생하셨습니다"처럼 포괄적인 격려만 반복하지 말고, 각 역할의 일상에 닿는 말을 쓰세요.
   - 응답 수, 평균, 확신 수준, 표본, 다수 의견, 근거, 진단, 병목 같은 분석용 표현은 쓰지 마세요.
   - "제품/PM/프롬프트 응답에서", "웹 개발 응답에서"처럼 데이터 묶음을 설명하는 말도 쓰지 마세요. 대신 "일을 하다 보면", "화면을 맞추다 보면", "실험을 이어가다 보면"처럼 일상 언어로 풀어 쓰세요.
   - 설문 메타 역할은 제품/PM/프롬프트, AI 엔지니어링, 웹 개발(프론트/백엔드) 세 묶음입니다.
   - PM과 프롬프트, 프론트엔드와 백엔드는 별도 응답값이 없으므로, 개별 직무만의 사실처럼 단정하지 마세요. 다만 이 한계를 본문에 직접 설명하지는 마세요.
   - 이모티콘은 사용하지 마세요.
   - 형식 예시:
     > **PM/제품 담당 분들께:** "우선순위와 고객 이야기, 회사 안 여러 팀의 흐름을 함께 붙잡다 보면 매주 마음을 다시 정리해야 하는 순간이 많았겠어요. 방향을 설명하고 또 맞추는 일이 반복될수록 혼자 더 많이 안고 있는 느낌도 들 수 있습니다. 다음 몇 주는 제품마다 '이번엔 여기까지만 보자'는 작은 선을 함께 그어두면, 설명의 무게가 조금 나뉠 수 있겠습니다."
     > **AI 엔지니어링 분들께:** "품질, 검색, 속도, 안정성 사이에서 한 번에 답이 나오지 않는 문제를 오래 바라보고 계셨을 것 같습니다. 그런 일은 겉으로는 조용해 보여도 마음 안에서는 계속 판단을 요구합니다. 먼저 중요한 제품 한두 개부터 '좋아졌다'고 말할 수 있는 기준을 작게 맞춰두면, 매번 혼자 가늠해야 하는 부담이 조금 줄어들 수 있겠습니다."
     > **프론트엔드 분들께:** "사용자가 보는 마지막 화면을 맞추는 일은 작은 문구 하나까지 신경이 남는 일입니다. 일정과 디자인, 상태 처리 기준이 늦게 움직이면 이미 만든 화면도 다시 만져야 해서 마음이 바빠질 수 있습니다. 화면을 만들기 전에 함께 보는 짧은 확인 목록을 하나 두면, 다시 맞추는 시간을 조금 줄일 수 있겠습니다."`,
    roleMessages: true,
  },
  closedEnded: {
    title: '선택형·척도형 문항 리포트',
    goal:
      '1~5점 척도, 단일선택, 복수선택 문항만 분석해 숫자로 보이는 방향을 쉽게 해석하세요. 기본 결과 화면에서 상세 수치는 볼 수 있으므로, 이 리포트는 숫자 나열보다 의미와 토론 제안에 집중하세요. 서술형 응답 원문은 사용하지 마세요.',
    requiredSections: `1. # Executive Summary
   - 첫 줄은 반드시 **한 문장 결론:** "핵심 문장" 형식으로 작성하세요. 따옴표 안은 10단어 이내여야 합니다.
   - 이어서 "## 숫자로 보이는 현재 그림"을 만들고, 점수/선택 결과에서 보이는 핵심 흐름 3~5개를 쉬운 한국어 목록으로 요약하세요.
   - 이어서 "## 그래서 무엇을 해야 하나"를 만들고, 점수/선택 결과만 보고도 시작할 수 있는 제안 3~5개를 목록으로 작성하세요.
   - 각 목록은 18단어 이내로 짧게 쓰세요.
2. ## 1. 숫자가 말해주는 현재 그림
   - 낮은 평균, 큰 응답 차이, 선택 쏠림을 세부 수치표가 아니라 읽기 쉬운 해석으로 풀어주세요.
   - 숫자는 꼭 필요한 경우에만 괄호 안에 짧게 언급하세요.
3. ## 2. 의견이 모이는 곳과 갈리는 곳
   - 공통으로 느끼는 막힘과 역할/제품별 경험 차이 가능성을 구분하세요.
4. ## 3. 워크샵에서 바로 확인할 질문
   - 점수/선택 결과만으로 도출 가능한 토론 질문을 4~6개 제안하세요.
5. ## 4. 작게 해볼 개선
   - 점수/선택 결과에 근거한 작고 검증 가능한 개선을 3~5개 제안하세요.`,
  },
  textByQuestion: {
    title: '서술형 문항별 리포트',
    goal:
      '서술형 응답을 문항별로 분석하되, 원문을 단순 요약하지 말고 팀원이 읽고 이해할 수 있는 반복 감정, 맥락, 소수 의견, 토론 질문을 도출하세요.',
    requiredSections: `1. # Executive Summary
   - 첫 줄은 반드시 **한 문장 결론:** "핵심 문장" 형식으로 작성하세요. 따옴표 안은 10단어 이내여야 합니다.
   - 이어서 "## 사람들이 남긴 말의 흐름"을 만들고, 서술형 응답 전체에서 보이는 핵심 테마 3~5개를 쉬운 한국어 목록으로 요약하세요.
   - 이어서 "## 그래서 무엇을 해야 하나"를 만들고, 워크샵에서 바로 다룰 제안 3~5개를 목록으로 작성하세요.
   - 각 목록은 18단어 이내로 짧게 쓰세요.
2. ## 1. 반복해서 들리는 말
   - 여러 응답에서 반복되는 말의 결을 정리하세요. 원문을 길게 옮기지 말고, 익명성이 지켜지게 일반화하세요.
3. ## 2. 작지만 놓치면 안 되는 말
   - 소수 의견이라도 운영상 중요한 신호가 있으면 조심스럽게 다루세요.
4. ## 3. 말 뒤에 있는 감정과 부담
   - 피로, 답답함, 기대, 신뢰, 조심스러움 같은 정서적 신호를 과장 없이 읽어주세요.
5. ## 4. 워크샵에서 물어볼 질문
   - 실제 토론에서 바로 사용할 수 있는 질문을 4~6개 제안하세요.`,
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
  const isLetter = Boolean(spec.letter);
  const isRoleMessages = Boolean(spec.roleMessages);
  const isNarrativeMessage = isLetter || isRoleMessages;
  const executiveSummaryRule = isLetter
    ? '- Executive Summary와 한 문장 결론을 쓰지 마세요. 바로 "# 한 장의 편지"로 시작하세요.'
    : isRoleMessages
      ? '- Executive Summary와 한 문장 결론을 쓰지 마세요. 바로 "# 직무별 메시지"로 시작하세요.'
      : '- Executive Summary는 길게 쓰지 마세요. 한 문장 결론, 쉬운 분석 요약 3~5개, 해야 할 일 3~5개만 넣으세요.';
  const structureRule = isLetter
    ? '- 편지는 설명문보다 마음의 흐름이 우선입니다. 각 문단은 공감, 짧은 관찰, 조심스러운 한마디가 자연스럽게 이어지게 쓰세요.'
    : isRoleMessages
      ? '- 직무별 메시지는 역할별 업무 경험을 알아주는 짧은 한마디입니다. 설명보다 공감, 판단보다 조심스러운 제안을 우선하세요.'
      : '- 긴 보고서여도 구조가 선명해야 합니다. 각 섹션은 "상황", "해석", "의미", "제안" 순서가 드러나게 정리하세요.';
  const workshopActionRule = isLetter
    ? '- 편지에는 별도 "워크샵에서 확인할 질문" 목록이나 4주 개선 후보 상세 목록을 넣지 마세요. 필요한 질문과 제안은 문단 안에 자연스럽게 녹이세요.'
    : isRoleMessages
      ? '- 직무별 메시지에는 별도 토론 질문이나 4주 개선 후보 상세 목록을 넣지 마세요. 역할별 마지막 문장에 작고 현실적인 제안을 녹이세요.'
      : '- 워크샵 현장에서 바로 토론할 수 있는 질문과 4주 동안 해볼 작은 개선 후보를 포함하세요.';
  const sectionClosingRule = isLetter || isRoleMessages
    ? '- 별도 "워크샵에서 확인할 질문" 줄을 각 섹션 끝에 반복하지 마세요.'
    : '- 각 섹션 끝에는 팀원이 바로 이해할 수 있는 "워크샵에서 확인할 질문"을 1~3개 포함하세요.';
  const sectionSignalRule = isLetter
    ? `- 편지는 짧은 이야기 흐름이 중요합니다. **한 문장 결론:**, **한문장 정리:**, **한문장 제안:** 형식을 쓰지 마세요.
- 대신 각 문단의 첫 문장을 굵게 처리해, 첫 문장들만 읽어도 전체 흐름이 이어지게 하세요.`
    : isRoleMessages
      ? `- 역할별 메시지는 반드시 blockquote 형식으로 작성해 화면에서 따로 보이게 하세요.
- **한 문장 결론:**, **한문장 정리:**, **한문장 제안:** 형식을 쓰지 마세요.
- 각 역할 제목은 반드시 "~분들께"로 끝나야 합니다.`
    : `- Executive Summary 이후 모든 큰 섹션은 반드시 첫 부분에 **한문장 정리:** "핵심 정리"와 **한문장 제안:** "핵심 제안"을 각각 한 줄씩 넣고, 그 아래에 상세 해석과 제안을 작성하세요.
- "한문장 정리"는 그 섹션에서 관찰한 사실 또는 해석을 10단어 이내로 말합니다.
- "한문장 제안"은 그 섹션을 읽고 워크샵에서 무엇을 해야 하는지 10단어 이내로 말합니다.
- 상세 리포트는 충분히 길고 구조적이어야 하지만, 각 섹션의 핵심은 위 두 문장만 읽어도 파악되어야 합니다.`;
  const closingRule = isLetter
    ? '편지에는 별도의 "4주 개선 후보" 상세 양식을 붙이지 마세요. 필요한 바람은 본문 안에 짧게 녹이세요.'
    : isRoleMessages
      ? '직무별 메시지에는 별도의 "4주 개선 후보" 상세 양식을 붙이지 마세요. 각 역할의 마지막 문장에 부담이 크지 않은 작은 제안을 자연스럽게 담으세요.'
      : '각 4주 개선 후보는 길게 표로 만들지 말고, "무엇을 바꿀지", "첫 1주 실행", "좋아졌는지 볼 신호"만 간결하게 포함하세요.';
  const purposeBlock = isLetter
    ? `편지 작성 목표:
- 이 글은 분석 리포트가 아니라, 설문 응답을 읽은 뒤 스쿼드에게 보내는 짧은 편지입니다.
- 독자는 실제 워크샵에 참여하는 팀원입니다. 설명하려 들기보다, 먼저 마음을 알아주고 조심스럽게 방향을 건네세요.
- 설문 데이터는 편지를 쓰기 위한 참고 메모입니다. 본문에서 숫자와 분석 용어를 늘어놓지 마세요.`
    : isRoleMessages
      ? `메시지 작성 목표:
- 이 글은 직무별 분석표가 아니라, 각 역할의 팀원에게 건네는 따뜻한 한마디입니다.
- 독자는 실제 워크샵에 참여하는 팀원입니다. 역할별로 겪었을 법한 마음을 알아주고, 부담이 크지 않은 제안을 짧게 건네세요.
- 설문 데이터는 말의 방향을 잡기 위한 참고 메모입니다. 본문에서 응답 수나 확신 수준을 설명하지 마세요.`
      : `보고서 목표:
- ${spec.goal}
- 단순 요약이 아니라, 조직 운영, 제품 운영, 개발 협업, AI 제품 사업화 경험이 있는 외부 전문가들이 함께 검토한 수준의 보고서처럼 작성하세요.
- 다만 독자는 실제 워크샵에 참여하는 실무 팀원입니다. 어려운 전문 용어를 남발하지 말고, 필요하면 쉬운 한국어로 풀어 쓰세요.
- 보고서의 목적은 "좋다/나쁘다" 판정이 아니라, 워크샵에서 합의해야 할 논의 주제와 4주 동안 해볼 작은 개선을 찾는 것입니다.`;
  const dataHandlingRule = isNarrativeMessage
    ? `- 설문 데이터는 글의 방향을 잡는 데만 사용하세요. 본문에서는 숫자, 응답 수, 평균, 확신 수준, 표본 한계, 문항 ID를 쓰지 마세요.
- 데이터가 약한 부분은 "그럴 수 있겠다", "이런 마음도 있었을 수 있겠다"처럼 부드럽게 낮춰 말하세요.
- 수치와 서술형 응답을 구분해 설명하지 마세요. 읽는 사람이 분석표를 보는 느낌을 받지 않아야 합니다.`
    : `- 응답 수가 적으면 응답자 수의 한계를 명시하고, 결론을 단정하지 마세요.
- 수치와 서술형 응답을 구분해서 해석하고, 서술형은 익명성을 해칠 수 있는 표현을 일반화하세요.
- 수치가 약한 지점에서는 "추정", "가능성", "확인 필요"를 명확히 구분하세요.
- 확신 수준은 높음/중간/낮음으로 표시하고, 확신 수준이 낮은 결론은 실행안으로 단정하지 마세요.`;
  const flowRule = isNarrativeMessage
    ? '- 글의 흐름은 마음을 알아주는 말, 함께 본 장면, 조금 덜 힘들게 해볼 작은 바람 순서로 자연스럽게 이어지게 하세요.'
    : '- 챕터 흐름은 팀 경험/몰입, 목표와 실행, 협업과 운영, 우선순위, 직무별 추가, 마지막 회고 순서로 읽어야 합니다.';
  const npsRule = isNarrativeMessage
    ? '- 팀 추천 의향 문항은 마음의 온도를 참고하는 정도로만 보세요. 본문에 점수나 표본 이야기를 쓰지 마세요.'
    : '- 팀 추천 의향 0~10 문항은 표본이 작으므로 단독 점수로 단정하지 말고, 다른 신호와 함께 보는 기준점으로만 해석하세요.';

  return `다음은 누리미디어 AI 사업부 2026 상반기 워크샵 사전 설문의 익명 집계 데이터입니다.

분석 유형:
- ${spec.title}

응답 데이터:
${JSON.stringify(payload, null, 2)}

${purposeBlock}

작성 원칙:
- ${isNarrativeMessage ? '반드시 지정된 한국어 제목으로 시작하고, "Executive Summary" 제목은 사용하지 마세요.' : '반드시 "# Executive Summary"로 시작하세요.'}
- ${isNarrativeMessage ? '한 문장 결론은 쓰지 마세요. 이 문서는 보고서가 아니라 말 건넴에 가깝습니다.' : '전체 보고서는 한국어로 작성하되, 첫 제목 "Executive Summary"는 영어 그대로 유지하세요.'}
- 읽는 사람은 PM, 프론트엔드, 백엔드, AI 엔지니어, 프롬프트 엔지니어가 섞인 실무 팀원입니다.
- ${isNarrativeMessage ? '편지와 직무별 메시지에는 "**한 문장 결론:**", "**한문장 정리:**", "**한문장 제안:**" 형식을 절대 쓰지 마세요.' : '모든 "**한 문장 결론:**", "**한문장 정리:**", "**한문장 제안:**" 값은 반드시 큰따옴표로 감싸고 10단어 이내로 작성하세요.'}
- ${isNarrativeMessage ? '핵심 문장은 문단 첫 문장이나 역할별 첫 문장에 자연스럽게 녹이세요. 누구나 바로 이해할 수 있는 쉬운 문장이어야 합니다.' : '이 세 문장은 포스터 헤드라인처럼 짧고 선명해야 합니다. 예: "일은 빠른데, 교통정리가 늦습니다."'}
- 쉬운 비유는 쓰면 좋습니다. 다만 이해를 돕는 도구일 때만 쓰고, 특정 직군을 탓하거나 과장된 선동 문구처럼 쓰지 마세요.
- 독자가 10초 안에 핵심을 잡아야 합니다. 긴 개념어, 전문 용어, 추상명사는 줄이고 동사 중심으로 쓰세요.
${executiveSummaryRule}
- 개인 평가처럼 보이는 표현, 특정 직군 탓으로 읽히는 표현, 과장된 긍정/부정 표현을 피하세요.
${structureRule}
${dataHandlingRule}
- ${isNarrativeMessage ? '공감 표현은 반드시 설문 신호와 연결해 쓰세요. 따뜻하고 배려 있는 상담자처럼 쓰되, 데이터 없이 다 안다는 듯한 위로나 같은 문구 반복은 피하세요.' : '상세 수치는 기본 결과 화면에서 확인할 수 있으므로, 수치표를 반복하기보다 의미와 제안을 중심으로 쓰세요.'}
${flowRule}
${npsRule}
${workshopActionRule}
- ${isNarrativeMessage ? '편지와 직무별 메시지에는 표를 쓰지 마세요.' : '표는 꼭 읽기 쉬워지는 경우에만 사용하세요. 수치표를 반복하기 위한 표는 만들지 마세요.'}
${sectionClosingRule}
- ${isNarrativeMessage ? '핵심만 읽고 싶은 사람도 각 문단의 첫 문장 또는 각 역할의 첫 문장만 읽으면 전체 흐름을 느낄 수 있게 작성하세요.' : '핵심만 읽고 싶은 사람도 이해할 수 있게 Executive Summary를 가장 정교하게 작성하세요.'}
${sectionSignalRule}

필수 섹션:
${spec.requiredSections}

${closingRule}`;
}

function normalizeReport(text, analysisType = 'comprehensive') {
  const trimmed = String(text || '').trim();
  if (analysisType === 'letter' || analysisType === 'roleMessages') {
    const title = analysisType === 'letter' ? '한 장의 편지' : '직무별 메시지';
    const cleaned = trimmed
      .replace(/^#?\s*Executive Summary\s*/i, '')
      .split('\n')
      .filter((line) => !extractNarrativeSignalLine(line))
      .join('\n')
      .trim()
      .replace(new RegExp(`^##\\s*${title}\\s*`, 'i'), `# ${title}\n\n`);
    if (/^#\s+/.test(cleaned)) return cleaned;
    return `# ${title}

${cleaned}`;
  }
  if (/^#\s*Executive Summary/i.test(trimmed)) return trimmed;
  if (/^Executive Summary/i.test(trimmed)) return `# ${trimmed}`;
  return `# Executive Summary
- 생성된 응답이 지정된 제목으로 시작하지 않아, 운영자가 읽을 수 있도록 제목을 보정했습니다.

${trimmed}`;
}

function extractNarrativeSignalLine(line) {
  return /^(?:[-*]\s*)?(?:\*\*)?\s*(한\s*문장\s*결론|한문장\s*결론|한\s*문장\s*정리|한문장\s*정리|한\s*문장\s*제안|한문장\s*제안)\s*:/i.test(String(line || '').trim());
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
    result: normalizeReport(extractOutputText(body), analysisType),
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
