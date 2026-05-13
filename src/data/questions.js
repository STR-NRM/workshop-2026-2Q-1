export const SURVEY_ID = '2026-2Q-1';
export const QUESTION_VERSION = '2026-05-13-v1.6';

export const surveyInfo = {
  title: '2026 상반기 AI 사업부 일하는 방식 점검 설문',
  shortTitle: 'AI 사업부 워크샵 사전 설문',
  description:
    '개인 평가가 아니라 워크샵에서 다룰 막히는 지점과 4주 동안 해볼 작은 개선을 찾기 위한 설문입니다.',
  target: '문치웅 팀장과 스쿼드 리드를 제외한 실무 팀원 14명',
  estimatedTime: '35~45분',
  organization: '누리미디어 AI 사업부',
};

export const scaleOptions = [
  { value: 1, label: '전혀 그렇지 않다' },
  { value: 2, label: '그렇지 않은 편이다' },
  { value: 3, label: '보통이다' },
  { value: 4, label: '그런 편이다' },
  { value: 5, label: '매우 그렇다' },
  { value: 'NA', label: '해당 없음 / 판단하기 어려움', shortLabel: '해당 없음', isNeutral: true },
];

export const roleOptions = [
  '제품/PM/프롬프트',
  'AI 엔지니어링',
  '웹 개발(프론트/백엔드)',
];

export const externalExcludedOptions = ['특별히 없음'];

export const roleGroups = {
  product: ['제품/PM/프롬프트'],
  ai: ['AI 엔지니어링'],
  web: ['웹 개발(프론트/백엔드)'],
  engineering: ['AI 엔지니어링', '웹 개발(프론트/백엔드)'],
  productAi: ['제품/PM/프롬프트', 'AI 엔지니어링'],
  aiWeb: ['AI 엔지니어링', '웹 개발(프론트/백엔드)'],
};

const q = (item) => ({
  required: true,
  ...item,
});

const scale = (id, section, title, question, helpText, tag, options = {}) =>
  q({
    id,
    type: 'scale5na',
    section,
    title,
    question,
    helpText,
    tag,
    ...options,
  });

const chapter = (id, title, question, helpText) =>
  q({
    id,
    type: 'sectionIntro',
    section: '챕터 안내',
    title,
    question,
    helpText,
    required: false,
  });

const roleQuestion = (role, id, title, question, helpText, tag) =>
  q({
    id,
    type: 'scale5na',
    section: `직무별 추가 문항: ${role}`,
    role,
    title,
    question,
    helpText,
    tag,
  });

export const questions = [
  chapter(
    'CHAPTER_BASIC',
    '시작하기 전에',
    '먼저 응답 기준을 맞춥니다.',
    '역할, 최근 관여한 제품, 함께 일한 팀을 먼저 확인합니다. 개인을 구분하려는 목적이 아니라 뒤 문항을 본인 경험에 맞게 보여주기 위한 단계입니다.',
  ),
  q({
    id: 'META_ROLE',
    type: 'singleChoice',
    section: '기본 정보',
    title: '주로 맡는 역할',
    question: '현재 본인이 주로 수행하는 역할에 가장 가까운 것을 선택해주세요.',
    helpText:
      '결과 공개 시 직군별 평균은 따로 비교하지 않습니다. 이 문항은 직무별 추가 문항을 나누고 전체 결과를 해석하는 데만 사용합니다.',
    options: roleOptions,
  }),
  q({
    id: 'META_WORKSTREAM',
    type: 'multiChoice',
    section: '기본 정보',
    title: '최근 6주 주요 제품/업무 영역',
    question:
      '최근 6주 동안 관여한 제품 또는 업무 영역을 모두 선택해주세요.',
    helpText:
      '직접 담당, 부분 지원, 검토, 협업 요청 대응까지 포함해 실제로 시간을 쓴 항목을 선택해주세요. 이 문항은 제품별 책임 범위와 우선순위가 어디서 막히는지 해석하기 위한 보조 정보입니다.',
    options: [
      'AI Agent',
      'AI Viewer',
      'AI Idea',
      'AI Reader',
      'AI Editor',
      '공통 검색, AI 기반 작업, 인프라 관련 작업',
      '여러 제품에 비슷하게 관여',
    ],
  }),
  q({
    id: 'META_TENURE',
    type: 'singleChoice',
    section: '기본 정보',
    title: '현재 방식으로 일한 기간',
    question: 'AI 사업부 또는 현재 실무 스쿼드 방식으로 일한 기간은 어느 정도입니까?',
    helpText:
      '신규 합류자 개인을 식별하려는 목적이 아니라, 새로 합류한 사람이 적응하는 과정과 결정/학습 기록의 상태를 해석하기 위한 문항입니다.',
    options: ['3개월 미만', '3~6개월', '6개월 이상'],
  }),
  q({
    id: 'META_EXTERNAL',
    type: 'multiChoice',
    section: '기본 정보',
    title: '최근 6주 타팀 협업',
    question: '최근 6주 동안 업무상 자주 협업했거나 요청을 주고받은 다른 팀/파트를 선택해주세요.',
    helpText:
      '여기서 다른 팀/파트는 AI 사업부 실무 스쿼드 밖에서 함께 일한 곳을 뜻합니다. 특정 개인 평가가 아니라 협업 흐름을 보기 위한 문항입니다.',
    options: [
      '개발운영/인프라',
      '서비스/디자인',
      '영업기획/콘텐츠영업',
      '마케팅',
      '서비스 운영/고객 문의',
      '콘텐츠운영',
      '외주/협력사',
      '특별히 없음',
    ],
    exclusiveOptions: ['특별히 없음'],
  }),
  q({
    id: 'META_CBT',
    type: 'singleChoice',
    section: '기본 정보',
    title: 'CBT(사전 테스트)/신규 실험 관여 여부',
    question: '최근 6주 동안 AI Editor 등 CBT(사전 테스트) 또는 신규 실험 업무에 직접 관여했습니까?',
    helpText: '사전 테스트나 신규 실험 업무의 운영 기준을 별도로 보기 위한 문항입니다.',
    options: ['예', '아니오'],
  }),

  chapter(
    'CHAPTER_TEAM_EXPERIENCE',
    '1. 팀에서 일하는 감각',
    '이제 팀 안에서 얼마나 편하게 말하고, 몰입하고, 연결되어 일하는지 봅니다.',
    '정답은 없습니다. 최근 몇 주 동안 실제로 느낀 안전감, 동기, 공정성, 자율성을 기준으로 답해주세요.',
  ),
  scale('PS01', 'J. 팀에서 일하는 감각', '실수 공유 안전감', '우리 팀에서는 실수나 어려움을 인정하고 공유해도 안전하다고 느낀다.', '최근 실수, 장애, 일정 지연, 판단 착오 같은 어려움을 공유했을 때의 느낌을 떠올려 답해주세요.', 'mistake-safety'),
  scale('PS02', 'J. 팀에서 일하는 감각', '까다로운 이슈 제기', '우리 팀에서는 문제나 까다로운 이슈를 솔직하게 꺼낼 수 있다.', '회의, 메신저, 1:1 등에서 불편하거나 민감한 이야기를 꺼낼 수 있는지 기준으로 답해주세요.', 'candor'),
  scale('PS03', 'J. 팀에서 일하는 감각', '새로운 시도 안전감', '우리 팀에서는 새로운 시도나 실험적 접근을 제안해도 안전하다고 느낀다.', '완전히 검증되지 않은 아이디어, 빠른 실험, 다른 방식의 제안을 할 때의 안전감을 기준으로 답해주세요.', 'risk-safety'),
  scale('PS04', 'J. 팀에서 일하는 감각', '고유 역량 활용', '우리 팀에서 일하면서 나의 고유한 역량이 인정받고 활용되고 있다.', '본인의 강점이나 전문성이 실제 업무에서 쓰이고 있다고 느끼는지 기준으로 답해주세요.', 'strength-use'),
  scale('EN01', 'J. 팀에서 일하는 감각', '일의 충족감', '지금 하고 있는 일에서 의미나 충족감을 느낀다.', '업무가 항상 즐겁다는 뜻은 아닙니다. 맡은 일이 의미나 보람으로 연결되는지 기준으로 답해주세요.', 'meaningful-work'),
  scale('EN02', 'J. 팀에서 일하는 감각', '팀 연결감', '우리 팀 사람들과 연결되어 있다고 느낀다.', '친밀함의 정도보다, 필요한 때 함께 일하고 도움을 주고받는 연결감을 기준으로 답해주세요.', 'team-connection'),
  scale('EN03', 'J. 팀에서 일하는 감각', '팀 방향에 대한 공감', '우리 팀이 향하는 방향과 내가 하는 일이 연결되어 있다고 느낀다.', '팀의 목표, 제품 방향, 본인의 업무가 서로 이어져 있다고 느끼는지 답해주세요.', 'mission-commitment'),
  scale('EN04', 'J. 팀에서 일하는 감각', '1년 뒤 함께 일할 감각', '1년 뒤에도 이 팀에서 일하고 있을 것 같다고 느낀다.', '정확한 계획을 묻는 문항이 아닙니다. 현재 팀 경험을 바탕으로 한 가까운 미래 감각을 답해주세요.', 'future-intent'),
  scale('EN05', 'J. 팀에서 일하는 감각', '기여 인정의 공정성', '우리 팀에서 기여가 공정하게 인정된다고 느낀다.', '성과 평가가 아니라, 본인과 동료의 기여가 필요한 만큼 보이고 인정되는지 기준으로 답해주세요.', 'fair-recognition'),
  scale('EN06', 'J. 팀에서 일하는 감각', '결정 과정의 공정성', '우리 팀의 의사결정 과정이 공정하다고 느낀다.', '모든 의견이 채택되어야 한다는 뜻은 아닙니다. 결정 과정과 기준이 납득 가능한지 기준으로 답해주세요.', 'decision-fairness'),
  scale('EN07', 'J. 팀에서 일하는 감각', '일하는 방식의 자율성', '내 업무를 수행하는 방식을 스스로 결정할 여지가 있다.', '무엇을 할지뿐 아니라, 어떻게 풀어갈지에 대한 자율성이 있는지 기준으로 답해주세요.', 'work-autonomy'),
  scale('EN08', 'J. 팀에서 일하는 감각', '의견이 진지하게 다뤄진 경험', '내 의견이 진지하게 받아들여진 경험이 최근에 있다.', '의견이 최종 결정에 반영되었는지보다, 충분히 듣고 검토되었다고 느꼈는지 답해주세요.', 'voice-taken-seriously'),
  scale('EN09', 'J. 팀에서 일하는 감각', '어려움을 털어놓을 동료', '우리 팀 안에 어려움을 솔직히 털어놓을 수 있는 동료가 있다.', '업무, 도메인, 기술, 일정 부담 등 어떤 어려움이든 의지할 수 있는 사람이 있는지 기준으로 답해주세요.', 'support-relationship'),
  scale('EN10', 'J. 팀에서 일하는 감각', '다음 분기 방향 명확성', '우리 팀이 다음 분기에 어디로 향하는지 이해하고 있다.', '세부 일정 전체가 아니라, 다음 분기에 무엇을 우선할지 큰 방향을 이해하는지 기준으로 답해주세요.', 'next-quarter-clarity'),

  chapter(
    'CHAPTER_WORK_SYSTEM',
    '2. 목표와 실행 흐름',
    '이제 목표, 고객 신호, 요구사항, 결정 방식이 실제 실행으로 이어지는 흐름을 봅니다.',
    '아래 문항은 누가 잘하고 못하는지를 묻지 않습니다. 일이 시작되고 결정되고 바뀌는 과정이 충분히 보이는지를 확인하기 위한 질문입니다.',
  ),
  scale('A01', 'A. 사업 목표와 제품 우선순위', 'AI 사업부 목표 이해', 'AI 사업부가 지금 가장 중요하게 보는 사업 목표를 이해하고 있다.', '개인 목표가 아니라 조직 차원의 우선 사업 목표를 기준으로 답해주세요.', 'alignment'),
  scale('A02', 'A. 사업 목표와 제품 우선순위', '제품 우선순위 기준', 'AI Agent, AI Viewer, AI Idea, AI Reader, AI Editor 중 무엇을 먼저 볼지 정하는 기준이 명확하다.', '어떤 제품이 더 중요하다고 생각하는지가 아니라, 우선순위를 정하는 기준을 이해할 수 있는지 답해주세요.', 'portfolio'),
  scale('A03', 'A. 사업 목표와 제품 우선순위', '내 업무와 목표 연결', '현재 내가 하는 일이 AI 사업부의 제품 목표와 어떻게 연결되는지 이해하고 있다.', '본인의 최근 업무가 어떤 제품 목표나 사업 목표에 기여하는지 설명할 수 있는지 기준으로 답해주세요.', 'alignment'),
  scale('A04', 'A. 사업 목표와 제품 우선순위', '제품 성공 기준', '제품별로 출시 후 무엇을 성공으로 볼지 기준이 대체로 정리되어 있다.', '이용, 신뢰, 고객 가치, 사업 성과 등 출시 후 확인할 기준이 공유되는지 봅니다.', 'outcome'),
  scale('A05', 'A. 사업 목표와 제품 우선순위', '우선순위 변경 공유', '제품 우선순위가 바뀔 때 그 이유와 판단 근거가 충분히 공유된다.', '최근 우선순위 변경을 경험했다면, 변경 배경과 영향 범위를 이해할 수 있었는지 기준으로 답해주세요.', 'prioritization'),

  scale('B01', 'B. 고객과 사용자 의견 반영', '기관 고객 요구 반영', '도서관/기관 고객의 요구와 제약이 제품 결정에 충분히 반영된다.', '구매자 관점의 요청, 도입 조건, 운영 제약이 제품 판단에 들어오는지 기준으로 답해주세요.', 'customer-signal', { allowNA: true }),
  scale('B02', 'B. 고객과 사용자 의견 반영', '실제 사용자 의견 전달', '실제 이용자인 학생, 대학원생, 연구자의 사용 행동과 불편이 팀에 충분히 전달된다.', '현장 피드백, 사용 데이터, 문의, 인터뷰 등 실제 사용자의 신호를 접할 수 있는지 봅니다.', 'user-signal', { allowNA: true }),
  scale('B03', 'B. 고객과 사용자 의견 반영', '관련 팀 의견 정리', '영업, 마케팅, 서비스, 콘텐츠 관련 조직에서 들어오는 의견이 정리되어 우선순위 결정에 사용된다.', '요청이 단순 전달되는 수준을 넘어, 제품 판단에 쓸 수 있는 형태로 정리되는지 기준으로 답해주세요.', 'stakeholder-loop', { allowNA: true }),
  scale('B04', 'B. 고객과 사용자 의견 반영', '서로 다른 의견을 판단하는 기준', '사용자 문의, 불만, 사용 데이터, 영업 현장의 이야기가 서로 다를 때 판단 기준이 있다.', '서로 다른 신호가 충돌할 때 어떤 신호를 더 중시할지 논의하거나 결정하는 방식이 있는지 봅니다.', 'signal-conflict', { allowNA: true }),
  scale('B05', 'B. 고객과 사용자 의견 반영', '사용자 문제 확인', '새 기능을 만들기 전에 어떤 사용자 문제를 해결하는지 충분히 확인한다.', '아이디어나 요청이 바로 구현으로 가지 않고, 해결하려는 문제가 확인되는지 기준으로 답해주세요.', 'discovery'),

  scale('C01', 'C. 사용자 문제 확인과 요구사항', '문제와 성공 기준 정의', '새 기능 또는 개선을 시작할 때 문제, 대상 사용자, 성공 기준이 명확히 정의된다.', '티켓, 문서, 회의록 등 어떤 형태든 시작 전에 핵심 조건이 남는지 기준으로 답해주세요.', 'requirement-quality'),
  scale('C02', 'C. 사용자 문제 확인과 요구사항', '필요한 역할의 조기 참여', 'PM/프롬프트/AI/백엔드/프론트엔드/디자인이 필요한 시점에 함께 제약과 가능성을 확인한다.', '모든 사람이 모든 회의에 참여해야 한다는 뜻은 아닙니다. 필요한 역할이 너무 늦지 않게 참여하는지 봅니다.', 'early-collaboration'),
  scale('C03', 'C. 사용자 문제 확인과 요구사항', '요구사항 변경 공유', '요구사항 변경이 발생하면 변경 이유, 영향 범위, 우선순위가 명확히 공유된다.', '변경 자체의 빈도가 아니라, 변경이 생겼을 때 팀이 같은 맥락을 이해할 수 있는지 답해주세요.', 'change-management'),
  scale('C04', 'C. 사용자 문제 확인과 요구사항', 'AI 기능의 한계 반영', '제품 요구사항은 AI 기능의 불확실성과 기술 제약을 고려해 작성된다.', 'AI 응답 품질, 지연, 실패 가능성, 데이터 제약 등 AI 기능 특성이 요구사항에 반영되는지 봅니다.', 'ai-product-spec'),
  scale('C05', 'C. 사용자 문제 확인과 요구사항', '완료 기준 구체성', '완료 기준에는 기능 구현뿐 아니라 품질, 사용성, 운영 가능성 기준이 포함된다.', '배포 가능 여부, 사용자 안내, 장애 대응, 로그 확인 같은 기준이 함께 고려되는지 답해주세요.', 'definition-of-done'),

  scale('D01', 'D. 결정 방식과 업무 집중', '최종 결정하는 사람 명확성', '제품/기능/기술 사안별로 최종 결정을 누가 하는지 대체로 명확하다.', '모든 결정이 한 사람에게 모여야 한다는 뜻은 아닙니다. 사안별로 누가 결정을 끝내는지 알 수 있는지 봅니다.', 'decision-rights'),
  scale('D02', 'D. 결정 방식과 업무 집중', '결정에 참여하는 범위', '결정에 필요한 사람은 참여하지만, 모든 사람이 모든 결정에 참여하지는 않는다.', '참여가 너무 적은 문제와 합의가 너무 무거운 문제 사이의 균형을 기준으로 답해주세요.', 'decision-efficiency'),
  scale('D03', 'D. 결정 방식과 업무 집중', '결정 내용과 이유 기록', '결정이 내려진 뒤에는 결정 내용과 이유가 필요한 사람에게 남는다.', '구두 합의만으로 사라지지 않고 나중에 확인할 수 있는 형태가 있는지 봅니다.', 'decision-memory'),
  scale('D04', 'D. 결정 방식과 업무 집중', '끝까지 챙기는 역할 명확성', '제품 또는 공통 작업별로 끝까지 챙기고 정리하는 역할이 명확하다.', '개인 이름을 묻는 문항이 아닙니다. 제품이나 작업별로 누가 끝까지 챙기고 결정 흐름을 정리하는지 기준으로 답해주세요.', 'ownership'),
  scale('D05', 'D. 결정 방식과 업무 집중', '결정 지연 해소', '결정이 늦어질 때 어디에서 막혔는지 확인하고 풀 수 있다.', '지연이 생겼을 때 원인과 다음 행동이 드러나는지 기준으로 답해주세요.', 'decision-latency'),
  scale('D06', 'D. 결정 방식과 업무 집중', '여러 일을 동시에 하는 문제 관리', '동시에 진행 중인 일이 너무 많아 중요한 일에 집중하기 어렵다는 문제가 관리되고 있다.', '업무량의 절대 크기보다 여러 일을 오가느라 집중이 깨지는 문제가 관리되는지 봅니다.', 'work-in-progress'),

  chapter(
    'CHAPTER_COLLAB_OPERATION',
    '3. 협업과 운영 방식',
    '이제 역할 간 협업, 제품별 운영 방식, 개발 환경, 지식 공유를 봅니다.',
    '앞쪽이 일이 시작되는 흐름이었다면, 여기서는 일이 실제로 굴러가는 동안 무엇이 도와주고 무엇이 막히는지를 확인합니다.',
  ),
  scale('E01', 'E. 역할 간 협업 방식', 'PM/프롬프트와 AI 개발 간 기대 결과', 'PM/프롬프트와 AI 엔지니어 사이에서 기대하는 결과물과 제약이 명확히 합의된다.', '프롬프트, 검색, 평가, 응답 품질 기대치가 서로 다르게 해석되지 않는지 봅니다.', 'pm-ai-interface', { roles: roleGroups.productAi }),
  scale('E02', 'E. 역할 간 협업 방식', 'AI와 백엔드 사이의 합의', 'AI 엔지니어와 백엔드 사이에서 데이터, API, 검색/AI 처리 흐름의 합의가 명확하다.', '입력/출력, 실패 처리, 데이터 흐름, 책임 범위가 필요한 만큼 정의되는지 기준으로 답해주세요.', 'ai-be-interface', { roles: roleGroups.aiWeb, allowNA: true }),
  scale('E03', 'E. 역할 간 협업 방식', '백엔드와 프론트엔드 구현 합의', '백엔드와 프론트엔드 사이에서 API, 상태, 에러, 로딩, 권한, 예외 케이스가 충분히 정의된다.', '화면 구현 중 뒤늦게 확인되는 요소가 반복되는지 떠올려 답해주세요.', 'web-interface', { roles: roleGroups.web }),
  scale('E04', 'E. 역할 간 협업 방식', '디자인과 사용 경험 조기 반영', '디자인과 사용 경험 관점이 기능 후반이 아니라 문제 정의와 설계 초기에 반영된다.', '서비스/디자인과 실제로 협업한 경험을 기준으로 답해주세요. 직접 겪지 않았다면 이 문항은 표시되지 않습니다.', 'ux-collaboration', { externalOptions: ['서비스/디자인'], allowNA: true }),
  scale('E05', 'E. 역할 간 협업 방식', '인프라/운영 조기 확인', '인프라/운영 관련 제약은 일정 후반이 아니라 충분히 이른 시점에 확인된다.', '개발운영/인프라와 실제로 협업한 경험을 기준으로 답해주세요. 배포, 성능, 비용, 보안, 모니터링 같은 제약을 떠올리면 됩니다.', 'infra-collaboration', { externalOptions: ['개발운영/인프라'], allowNA: true }),
  scale('E06', 'E. 역할 간 협업 방식', '구조와 일하는 방식부터 보기', '직군 간 이슈가 생겼을 때 책임 공방보다 구조와 일하는 방식의 문제를 먼저 본다.', '개인의 잘잘못보다 재발을 줄이는 구조를 논의하는지 기준으로 답해주세요.', 'blameless-collaboration'),

  scale('F01', 'F. 제품별 운영 방식 관리', '운영 제품과 실험 제품의 차이', '운영 중인 제품과 CBT(사전 테스트)/실험 단계 제품의 실행 방식 차이를 팀이 이해하고 있다.', '정식 운영 제품과 실험 제품에 같은 기준을 적용해야 한다는 뜻이 아닙니다. 차이가 인식되는지 봅니다.', 'product-maturity'),
  scale('F02', 'F. 제품별 운영 방식 관리', '소규모 전담 업무 공유', 'AI Editor처럼 소규모 전담으로 진행되는 업무도 필요한 수준으로 팀에 공유된다.', '모든 세부 진행을 공유해야 한다는 뜻은 아닙니다. 팀 정렬에 필요한 정보가 공유되는지 기준으로 답해주세요.', 'cbt-sharing', { allowNA: true }),
  scale('F03', 'F. 제품별 운영 방식 관리', '빠르게 해볼 일과 꼼꼼히 볼 일 구분', '제품별로 빠르게 실험해도 되는 영역과 더 엄격히 검토해야 하는 영역이 구분되어 있다.', '속도와 위험 관리 기준이 제품 또는 기능 성격에 따라 구분되는지 봅니다.', 'risk-tiering'),
  scale('F04', 'F. 제품별 운영 방식 관리', '정식 서비스로 넘길 기준', 'CBT(사전 테스트)/실험 단계 서비스가 정식 제품으로 넘어가기 위한 기준이 대체로 명확하다.', '이용, 품질, 고객 피드백, 운영 가능성 등 정식 서비스 판단 기준이 있는지 기준으로 답해주세요.', 'productization'),
  scale('F05', 'F. 제품별 운영 방식 관리', '제품 간 배운 점 공유', '각 제품에서 얻은 배운 점과 실패 사례가 다른 제품에도 재사용될 수 있게 공유된다.', '회고, 문서, 회의, 사례 공유 등 어떤 방식이든 배운 점이 제품 간 이동하는지 봅니다.', 'learning-transfer'),

  scale('G01', 'G. 개발과 운영 환경', '문제 확인에 필요한 기록 접근', '개발자가 필요한 로그, 모니터링, 재현 정보에 접근해 문제를 빠르게 파악할 수 있다.', '개발 또는 AI 구현 업무에서 장애나 품질 문제의 원인을 확인할 정보가 충분한지 답해주세요.', 'observability', { roles: roleGroups.engineering, allowNA: true }),
  scale('G02', 'G. 개발과 운영 환경', '배포 검증과 속도', '배포 과정은 필요한 검증을 포함하면서도 과도하게 느리지 않다.', '배포, 검수, 롤백, 확인 절차가 속도와 안정성 사이에서 균형을 이루는지 기준으로 답해주세요.', 'release-flow', { roles: roleGroups.engineering, allowNA: true }),
  scale('G03', 'G. 개발과 운영 환경', '변경 영향 범위', '공통 코드, 데이터 처리 흐름, 검색/AI 구성요소의 변경 영향 범위를 이해할 수 있다.', '기술 변경이 어떤 제품이나 기능에 영향을 줄지 개발 관점에서 추적 가능한지 답해주세요.', 'change-impact', { roles: roleGroups.engineering, allowNA: true }),
  scale('G04', 'G. 개발과 운영 환경', '나중에 손봐야 할 기술 문제와 사업 요구 균형', '나중에 손봐야 할 기술 문제와 단기 사업 요구 사이의 균형을 논의하고 결정할 수 있다.', '기술 문제를 항상 먼저 해결해야 한다는 뜻은 아닙니다. 당장 필요한 일과 나중에 문제가 될 수 있는 일 사이의 균형을 논의하고 결정하는지 봅니다.', 'tech-debt-balance'),
  scale('G05', 'G. 개발과 운영 환경', '장애/품질 대응 경로', '장애나 품질 문제가 발생했을 때 대응 역할과 소통 경로가 명확하다.', '개발 또는 AI 구현 과정에서 문제가 생겼을 때 누가 무엇을 확인하고 누구에게 알릴지 분명한지 답해주세요.', 'incident-response', { roles: roleGroups.engineering, allowNA: true }),

  scale('H01', 'H. 지식 공유와 새 구성원 적응', '신규 합류 자료', '신규 합류자가 AI 사업부의 제품 구조와 일하는 방식을 이해하는 데 필요한 자료가 충분하다.', '신규 구성원이 혼자 모든 것을 찾아야 하는지, 기본 맥락을 얻을 자료가 있는지 기준으로 답해주세요.', 'onboarding'),
  scale('H02', 'H. 지식 공유와 새 구성원 적응', '제품과 고객을 이해하는 배경지식 접근', '콘텐츠, 데이터 출처, 검색 범위, 고객 맥락 등 제품 판단에 필요한 배경지식에 접근할 수 있다.', 'AI 제품 판단에 필요한 배경지식이 특정 사람만 알고 있는 지식에 머물지 않는지 봅니다.', 'domain-knowledge'),
  scale('H03', 'H. 지식 공유와 새 구성원 적응', '결정과 배운 점의 기록', '중요한 결정, 시도한 일의 결과, 장애 사례는 나중에 찾아볼 수 있는 형태로 남는다.', '기록의 완벽함이 아니라, 반복해서 같은 맥락을 다시 설명해야 하는지 기준으로 답해주세요.', 'organizational-memory'),
  scale('H04', 'H. 지식 공유와 새 구성원 적응', '질문 경로', '질문이 있을 때 누구에게 물어봐야 하는지 대체로 명확하다.', '답을 바로 알 수 있는지가 아니라, 질문을 어디로 가져가야 하는지 알 수 있는지 봅니다.', 'knowledge-routing'),

  scale('I01', 'I. 일하는 속도와 학습 문화', '지속 가능한 속도', '현재 업무량과 속도는 품질을 크게 희생하지 않고 지속 가능하다.', '일시적으로 바쁜 상황보다, 현재 속도가 몇 달 이상 지속될 때의 품질과 피로도를 기준으로 답해주세요.', 'sustainability'),
  scale('I02', 'I. 일하는 속도와 학습 문화', '논의가 실행으로 이어지는 정도', '논의된 운영 문제는 작게라도 실제 실행으로 이어진다.', '회의나 회고에서 나온 개선 이야기가 작게라도 시도되는지 기준으로 답해주세요.', 'operational-follow-through'),
  scale('I03', 'I. 일하는 속도와 학습 문화', '배우는 방식의 문제 대응', '실패나 품질 문제가 발생했을 때 개인 탓보다 재발 방지와 학습에 집중한다.', '문제 발생 후 논의가 책임 추궁보다 원인과 예방에 가까운지 봅니다.', 'learning-culture'),
  scale('I04', 'I. 일하는 속도와 학습 문화', '워크샵에서 실제로 바꿀 수 있는지', '이번 워크샵에서 논의하면 실제로 바꿀 수 있는 운영 문제가 있다고 느낀다.', '모든 문제가 해결될 것이라는 기대가 아니라, 워크샵에서 구체적으로 바꿀 수 있는 영역이 있는지 답해주세요.', 'workshop-efficacy'),

  chapter(
    'CHAPTER_PRIORITY',
    '4. 워크샵에서 먼저 다룰 주제',
    '이제 지금까지의 응답을 바탕으로 무엇을 먼저 논의하면 좋을지 고릅니다.',
    '선택형 문항은 우선순위를 좁히기 위한 단계입니다. 완벽한 답보다 현재 가장 가깝게 느껴지는 항목을 선택해주세요.',
  ),
  q({
    id: 'CHOICE01',
    type: 'singleChoice',
    section: '객관식 문항',
    title: '현재 가장 크게 막히는 지점',
    question: '현재 AI 사업부의 일이 가장 많이 막히는 지점은 어디에 가깝습니까?',
    helpText: '개인 책임이 아니라 운영 흐름 관점에서 가장 가까운 항목을 고르세요.',
    options: [
      '제품 우선순위와 전략 정리',
      '고객/사용자 의견 수집과 해석',
      '요구사항 명확성',
      '결정 속도와 권한',
      '팀 내부 제품/개발 협업(PM/프롬프트/AI/백엔드/프론트엔드)',
      '타팀 협업(디자인, 인프라, 영업, 마케팅 등)',
      '제품별 운영 방식 관리',
      '개발/배포/운영 환경',
      '인력/시간 부족 또는 동시에 진행 중인 일 과다',
      '새 구성원 적응/문서화 부족',
      '기타',
    ],
  }),
  q({
    id: 'CHOICE01_OTHER',
    type: 'longText',
    section: '객관식 문항',
    condition: 'choice01Other',
    title: '기타 막히는 지점',
    question: '기타를 선택했다면, 현재 일이 가장 많이 막히는 지점을 적어주세요.',
    helpText: '선택지에 가까운 항목이 없을 때만 간단히 적어주세요. 문제를 겪는 사람보다 일이 막히는 흐름을 중심으로 써주세요.',
    minLength: 5,
  }),
  q({
    id: 'CHOICE02',
    type: 'singleChoice',
    section: '객관식 문항',
    title: '4주 안에 먼저 개선할 영역',
    question: '다음 4주 동안 가장 먼저 개선하면 효과가 클 영역은 무엇입니까?',
    helpText: '가장 이상적인 개선이 아니라, 실제로 4주 안에 시작하고 확인할 수 있는 영역을 고르세요.',
    options: [
      '제품별 우선순위와 끝까지 챙기는 역할 정리',
      '고객/사용자 의견이 제품 결정으로 이어지는 과정 정리',
      '요구사항 문서 양식/완료 기준 정리',
      '최종 결정하는 사람과 결정 방식 정리',
      '제품별 실행/공유/정식 서비스 기준 정리',
      '배포/운영/로그 체계 정리',
      '새 구성원 적응/문서화 정리',
      '회의와 동시에 진행 중인 일 줄이기',
      '외부 협업 요청 방식 정리',
    ],
  }),
  q({
    id: 'CHOICE03',
    type: 'singleChoice',
    section: '객관식 문항',
    title: '여러 제품 운영 상태',
    question: '현재 여러 제품을 함께 운영하는 방식에 가장 가까운 설명은 무엇입니까?',
    helpText: '가장 많이 체감하는 상태를 하나만 선택하세요.',
    options: [
      '제품별 우선순위와 책임 범위가 대체로 명확하다',
      '우선순위는 있으나 자주 흔들린다',
      '여러 제품이 동시에 진행되어 집중이 어렵다',
      '특정 제품에 과도하게 쏠려 있다',
      'CBT(사전 테스트)/실험 단계 제품과 운영 제품의 기준 차이가 모호하다',
      '제품 간 배운 점 공유가 부족하다',
    ],
  }),
  q({
    id: 'CHOICE04',
    type: 'multiChoice',
    section: '객관식 문항',
    title: '타팀 협업 개선 대상',
    question: '타팀 협업에서 가장 개선이 필요한 대상을 최대 2개 선택해주세요.',
    helpText: '특정 개인이 아니라 협업 흐름, 요청 방식, 정보 전달 관점에서 답해주세요.',
    options: [
      '개발운영/인프라',
      '서비스/디자인',
      '영업기획/콘텐츠영업',
      '마케팅',
      '서비스 운영/고객 문의',
      '콘텐츠운영',
      '외주/협력사',
      '특별히 없음',
    ],
    maxSelections: 2,
    exclusiveOptions: ['특별히 없음'],
  }),
  q({
    id: 'CHOICE05',
    type: 'singleChoice',
    section: '객관식 문항',
    title: '제품별 운영 방식의 가장 큰 위험',
    question: '제품별 운영 방식에서 가장 주의해야 할 점은 무엇입니까?',
    helpText: '운영 제품과 CBT(사전 테스트)/실험 제품을 모두 떠올려 가장 가까운 항목을 고르세요.',
    options: [
      '운영 제품과 CBT(사전 테스트)/실험 제품의 기준 차이 불명확',
      '소규모 전담 업무의 공유 부족',
      '빠른 구현 방식의 위험 관리 부족',
      '정식 서비스로 넘길 기준 불명확',
      '제품 간 배운 점 공유 부족',
      '특정 제품에 과도한 집중 또는 방치',
      '특별히 없음',
    ],
  }),
  q({
    id: 'CHOICE06',
    type: 'singleChoice',
    section: '객관식 문항',
    title: '워크샵 토론 주제 선호',
    question: '워크샵에서 가장 논의하고 싶은 주제는 무엇입니까?',
    helpText: '본인의 직군이 아니라, 이번 워크샵에서 실제 개선이 필요하다고 보는 주제를 선택해주세요.',
    options: [
      '제품/우선순위',
      '고객/시장/관련 팀 의견',
      'PM/프롬프트/요구사항',
      '개발/운영',
      'CBT(사전 테스트)/신규 실험',
      '기타',
    ],
  }),
  q({
    id: 'CHOICE06_OTHER',
    type: 'longText',
    section: '객관식 문항',
    condition: 'choice06Other',
    title: '기타 토론 주제',
    question: '기타를 선택했다면, 워크샵에서 논의하고 싶은 주제를 적어주세요.',
    helpText: '한두 문장으로 충분합니다. 논의하고 싶은 문제나 바꾸고 싶은 운영 방식을 적어주세요.',
    minLength: 5,
  }),

  chapter(
    'CHAPTER_ROLE_DETAIL',
    '5. 본인 역할과 경험에 가까운 추가 질문',
    '이제 앞에서 선택한 역할과 협업 경험에 맞는 질문만 이어집니다.',
    '모든 사람에게 같은 문항이 보이지 않을 수 있습니다. 본인이 실제로 겪은 업무 범위 안에서만 답하면 됩니다.',
  ),
  roleQuestion('제품/PM/프롬프트', 'PM01', '사용자 문제 중심 요구사항', '요구사항은 사용자 문제와 성공 기준을 기능 목록보다 먼저 다룬다.', '요구사항 문서나 논의에서 "무엇을 만들지"보다 "왜 필요한지"가 먼저 확인되는지 봅니다.', 'pm-requirement'),
  roleQuestion('제품/PM/프롬프트', 'PM02', '기술 제약 정보 접근', 'AI 모델, 검색, 데이터, 운영 제약을 고려해 기능 요구사항을 작성할 충분한 정보가 있다.', 'PM/프롬프트 관점에서 기술 제약을 이해하고 반영할 수 있는 정보가 충분한지 기준으로 답해주세요.', 'pm-ai-context'),
  roleQuestion('제품/PM/프롬프트', 'PM03', '요청을 우선순위로 바꾸는 기준', '영업/서비스/마케팅/콘텐츠 요청을 제품 우선순위로 바꾸는 기준이 명확하다.', '요청의 양이나 목소리 크기만으로 결정되지 않고, 판단 기준이 있는지 봅니다.', 'pm-prioritization'),
  roleQuestion('제품/PM/프롬프트', 'PM04', '변경 영향 검토', '요구사항 변경 시 엔지니어링, 디자인, 운영 영향이 필요한 수준으로 함께 검토된다.', '변경 결정 후 전달이 아니라, 변경 판단 과정에서 영향이 확인되는지 기준으로 답해주세요.', 'pm-change-impact'),

  roleQuestion('AI 엔지니어링', 'AI01', 'AI 변경 결과 공유', '모델, 프롬프트, 검색 방식을 바꿔 테스트한 결과가 제품/개발 결정에 이해 가능한 형태로 공유된다.', '예를 들어 무엇을 바꿨고, 어떤 점이 좋아졌거나 나빠졌으며, 제품에 적용할 때 주의할 점이 무엇인지 PM과 개발자가 이해할 수 있게 공유되는지 답해주세요.', 'ai-result-sharing'),
  roleQuestion('AI 엔지니어링', 'AI02', 'AI 변경 기록 관리', '실패 사례, 프롬프트/검색 변경 기록, 평가 결과가 필요한 수준으로 관리된다.', '세부 평가 체계의 완성도보다, 반복 학습과 원인 파악에 필요한 기록이 있는지 기준으로 답해주세요.', 'ai-learning-record'),
  roleQuestion('AI 엔지니어링', 'AI03', '품질 개선과 안정 운영 균형', 'AI 품질 개선과 서비스 안정 운영 사이의 우선순위가 명확하다.', '품질을 높이는 일, 비용과 속도, 장애 가능성 사이에서 무엇을 먼저 볼지 논의되고 결정되는지 봅니다.', 'ai-stability-balance'),
  roleQuestion('AI 엔지니어링', 'AI04', 'AI-백엔드/PM 책임 범위', 'AI 엔지니어링과 백엔드/PM 사이의 책임 범위와 넘겨주는 기준이 명확하다.', '모델/검색/데이터 처리 결과가 서비스 구현으로 넘어갈 때 필요한 기준이 있는지 답해주세요.', 'ai-handoff'),

  roleQuestion('웹 개발(프론트/백엔드)', 'WEB01', '구현 전 합의', 'API, 데이터 구조, 예외 케이스, 에러 메시지, 로딩 상태가 구현 전에 충분히 합의된다.', '구현 중 뒤늦게 결정되는 요소가 반복되는지 기준으로 답해주세요.', 'web-contract'),
  roleQuestion('웹 개발(프론트/백엔드)', 'WEB02', 'AI 기능 상태 처리', 'AI 기능의 지연, 실패, 재시도, 사용자 안내 기준이 명확하다.', 'AI 기능 특성 때문에 생기는 화면 상태와 사용자 안내 기준이 충분한지 봅니다.', 'web-ai-state'),
  roleQuestion('웹 개발(프론트/백엔드)', 'WEB03', '공통 개발 체계 지원', '공통 화면 부품, API 사용 방식, 배포 체계가 제품 개발 속도를 충분히 지원한다.', '공통화가 부족해서 반복 구현이 생기거나, 반대로 공통 체계가 일이 막히는 지점이 되는지 기준으로 답해주세요.', 'web-platform'),
  roleQuestion('웹 개발(프론트/백엔드)', 'WEB04', '빠른 구현 방식의 위험 검토', '빠른 구현 방식의 생산성 이점과 품질/운영 위험이 함께 검토된다.', '특정 방식의 좋고 나쁨이 아니라, 빠르게 만드는 방식의 장점과 위험이 모두 보이는지 답해주세요.', 'web-fast-build-risk'),

  q({
    id: 'EXT01',
    type: 'scale5na',
    section: '추가 문항: 타팀 협업',
    condition: 'external',
    title: '타팀 협업 요청의 정보 충분성',
    question: '타팀 협업 요청은 필요한 배경, 목적, 기한, 결정 사항을 포함해 전달된다.',
    helpText: '요청을 주고받을 때 상대가 판단할 수 있는 정보가 충분한지 봅니다.',
    tag: 'external-request',
  }),
  q({
    id: 'EXT02',
    type: 'scale5na',
    section: '추가 문항: 타팀 협업',
    condition: 'external',
    title: '타팀 협업 조기 확인',
    question: '다른 팀의 도움이 필요한 일은 일정이 많이 진행되기 전에 확인된다.',
    helpText:
      '예를 들어 디자인, 인프라, 영업/서비스/콘텐츠 협조가 필요한 일이 뒤늦게 발견되지 않고, 계획 초반에 확인되는지 답해주세요.',
    tag: 'external-early-signal',
  }),
  q({
    id: 'EXT03',
    type: 'scale5na',
    section: '추가 문항: 타팀 협업',
    condition: 'external',
    title: '타팀 의견 반영',
    question: '타팀 협업에서 생긴 의견이나 제약이 제품 우선순위와 요구사항에 반영된다.',
    helpText: '협업 결과가 단순 참고로 끝나는지, 실제 제품 판단에 연결되는지 봅니다.',
    tag: 'external-feedback',
  }),
  q({
    id: 'CBT01',
    type: 'scale5na',
    section: '추가 문항: CBT(사전 테스트)/신규 실험',
    condition: 'cbt',
    title: 'CBT(사전 테스트) 목표 단계 명확성',
    question: 'AI Editor 등 CBT(사전 테스트)/신규 실험의 현재 목표가 학습, 검증, 출시, 판매 준비 중 어디에 가까운지 명확하다.',
    helpText: '단계별 목적이 명확해야 필요한 공유와 검증 수준도 정할 수 있습니다.',
    tag: 'cbt-purpose',
  }),
  q({
    id: 'CBT02',
    type: 'scale5na',
    section: '추가 문항: CBT(사전 테스트)/신규 실험',
    condition: 'cbt',
    title: 'CBT(사전 테스트) 공유 기준',
    question: 'CBT(사전 테스트)/신규 실험에서 반드시 팀에 공유해야 하는 정보와 공유하지 않아도 되는 정보가 구분되어 있다.',
    helpText: '모든 정보를 공유해야 한다는 뜻은 아닙니다. 정렬에 필요한 정보의 기준이 있는지 봅니다.',
    tag: 'cbt-sharing-rule',
  }),
  q({
    id: 'CBT03',
    type: 'scale5na',
    section: '추가 문항: CBT(사전 테스트)/신규 실험',
    condition: 'cbt',
    title: '빠른 구현 방식의 위험',
    question: '빠른 구현 방식의 생산성 이점과 품질/운영 위험이 함께 검토된다.',
    helpText: '속도를 내는 방식이 유효한 조건과 나중에 갚아야 할 위험이 드러나는지 답해주세요.',
    tag: 'cbt-fast-build-risk',
  }),
  q({
    id: 'CBT04',
    type: 'scale5na',
    section: '추가 문항: CBT(사전 테스트)/신규 실험',
    condition: 'cbt',
    title: '정식 제품 후보 판단 기준',
    question: 'CBT(사전 테스트)/신규 실험을 정식 제품 후보로 판단하기 위한 기준이 있다.',
    helpText: '사용성, 고객 반응, 품질, 운영 가능성, 사업성 중 어떤 기준을 볼지 정리되어 있는지 봅니다.',
    tag: 'cbt-productization',
  }),

  chapter(
    'CHAPTER_RETROSPECTIVE',
    '6. 마지막 회고',
    '마지막으로 지난 상반기를 돌아보고, 워크샵에서 꼭 남겨야 할 이야기를 적습니다.',
    '서술형 응답은 원문 그대로 공유하지 않고 익명성이 드러나지 않게 요약합니다. 특정 개인 이름보다 상황, 흐름, 기준 중심으로 적어주세요.',
  ),
  q({
    id: 'TEXT01',
    type: 'longText',
    section: '마지막 회고',
    title: '유지할 점',
    question: '지난 상반기에 우리 팀이 잘했고, 앞으로도 유지하면 좋을 점은 무엇입니까?',
    helpText: '작은 습관, 협업 방식, 결정 방식, 제품 운영 방식 등 계속 가져가고 싶은 것을 적어주세요.',
    minLength: 10,
  }),
  q({
    id: 'TEXT02',
    type: 'longText',
    section: '마지막 회고',
    title: '개선이 필요한 점',
    question: '지난 상반기에 가장 답답했거나 개선이 필요했던 한 가지는 무엇입니까?',
    helpText: '특정 사람보다 정보 흐름, 결정 방식, 협업 구조, 도구, 기준, 일정 흐름 관점으로 적어주세요.',
    minLength: 10,
  }),
  q({
    id: 'TEXT03',
    type: 'longText',
    section: '마지막 회고',
    title: '하나만 바로 바꿀 수 있다면',
    question: '하나만 즉시 바꿀 수 있다면, 우리 팀의 무엇을 바꾸고 싶습니까? 그 이유는 무엇입니까?',
    helpText: '가장 시급하거나 가장 반복적으로 막히는 한 가지를 떠올려 적어주세요. 너무 큰 조직개편보다 실제 업무 흐름을 우선 봅니다.',
    minLength: 10,
  }),
  q({
    id: 'TEXT04',
    type: 'longText',
    section: '마지막 회고',
    title: '4주 동안 해볼 작은 실험',
    question: '다음 4주 동안 AI 사업부가 작게 실험해볼 만한 운영 개선 아이디어를 하나 제안해주세요.',
    helpText: '회의, 문서, 결정 방식, 공유 방식, 협업 방식처럼 작게 시작하고 효과를 확인할 수 있는 아이디어를 적어주세요.',
    minLength: 10,
  }),
  q({
    id: 'TEXT05',
    type: 'longText',
    section: '마지막 회고',
    title: '설문에서 빠진 중요한 내용',
    question: '위 문항으로 충분히 담기지 않은 중요한 위험이나 개선 주제가 있다면 적어주세요.',
    helpText: '응답하기 불편한 내용일수록 개인 식별 표현을 피하고, 운영 구조나 반복 패턴 중심으로 적어주세요.',
    required: false,
  }),
  q({
    id: 'NPS01',
    type: 'singleChoice',
    section: '마지막 회고',
    title: '팀 추천 의향',
    question: '현재 경험을 기준으로, 우리 팀에서 일하는 것을 가까운 동료에게 추천하겠습니까?',
    helpText: '0은 전혀 추천하지 않음, 10은 매우 추천함입니다. 작은 표본에서는 단독 결론이 아니라 다음 설문과 비교할 기준점으로만 봅니다.',
    options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    layout: 'scoreLine',
    tag: 'team-recommendation',
  }),
];

export const axisMap = [
  { axis: '팀 안전감과 몰입', tags: ['mistake-safety', 'candor', 'risk-safety', 'strength-use', 'meaningful-work', 'team-connection', 'mission-commitment', 'future-intent', 'fair-recognition', 'decision-fairness', 'work-autonomy', 'voice-taken-seriously', 'support-relationship', 'next-quarter-clarity', 'team-recommendation'] },
  { axis: '사업 목표와 제품 우선순위', tags: ['alignment', 'portfolio', 'outcome', 'prioritization'] },
  { axis: '고객과 사용자 의견 반영', tags: ['customer-signal', 'user-signal', 'stakeholder-loop', 'signal-conflict', 'discovery', 'external-feedback'] },
  { axis: '사용자 문제 확인과 요구사항', tags: ['requirement-quality', 'early-collaboration', 'change-management', 'ai-product-spec', 'definition-of-done', 'pm-requirement', 'pm-ai-context', 'pm-prioritization', 'pm-change-impact'] },
  { axis: '결정 방식과 업무 집중', tags: ['decision-rights', 'decision-efficiency', 'decision-memory', 'ownership', 'decision-latency', 'work-in-progress'] },
  { axis: '역할 간 협업', tags: ['pm-ai-interface', 'ai-be-interface', 'web-interface', 'ux-collaboration', 'infra-collaboration', 'blameless-collaboration', 'ai-handoff', 'web-contract', 'web-ai-state', 'web-platform', 'external-request', 'external-early-signal'] },
  { axis: '제품별 운영 방식', tags: ['product-maturity', 'cbt-sharing', 'risk-tiering', 'productization', 'learning-transfer', 'cbt-purpose', 'cbt-sharing-rule', 'cbt-fast-build-risk', 'cbt-productization'] },
  { axis: '개발과 운영 환경', tags: ['observability', 'release-flow', 'change-impact', 'tech-debt-balance', 'incident-response', 'ai-learning-record', 'ai-stability-balance', 'web-fast-build-risk'] },
  { axis: '지식 공유와 새 구성원 적응', tags: ['onboarding', 'domain-knowledge', 'organizational-memory', 'knowledge-routing'] },
  { axis: '일하는 속도와 학습 문화', tags: ['sustainability', 'operational-follow-through', 'learning-culture', 'workshop-efficacy'] },
];

export function hasExternalModule(responses) {
  const value = responses?.META_EXTERNAL;
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.some((item) => !externalExcludedOptions.includes(item));
}

export function hasAnyExternalOption(responses, options = []) {
  const value = responses?.META_EXTERNAL;
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.some((item) => options.includes(item));
}

export function hasCbtModule(responses) {
  return responses?.META_CBT === '예';
}

export function isQuestionVisible(question, responses = {}) {
  if (question.role) {
    return responses.META_ROLE === question.role;
  }
  if (Array.isArray(question.roles)) {
    return question.roles.includes(responses.META_ROLE);
  }
  if (Array.isArray(question.externalOptions)) {
    return hasAnyExternalOption(responses, question.externalOptions);
  }
  if (question.condition === 'external') {
    return hasExternalModule(responses);
  }
  if (question.condition === 'cbt') {
    return hasCbtModule(responses);
  }
  if (question.condition === 'choice06Other') {
    return responses.CHOICE06 === '기타';
  }
  if (question.condition === 'choice01Other') {
    return responses.CHOICE01 === '기타';
  }
  return true;
}

export function isAnswerableQuestion(question) {
  return question.type !== 'sectionIntro';
}

export function getVisibleQuestions(responses = {}) {
  return questions.filter((question) => isQuestionVisible(question, responses));
}

export function isAnswered(question, value) {
  if (!isAnswerableQuestion(question)) return true;
  if (!question.required) return true;
  if (question.type === 'multiChoice') return Array.isArray(value) && value.length > 0;
  if (question.type === 'longText') {
    const text = String(value || '').trim();
    return text.length >= (question.minLength || 1);
  }
  return value !== undefined && value !== null && value !== '';
}

export function getAnswerLabel(question, value) {
  if (question.type === 'scale5na') {
    return scaleOptions.find((option) => option.value === value)?.label || '';
  }
  if (Array.isArray(value)) return value.join(', ');
  return value ?? '';
}

export const answerableQuestions = questions.filter(isAnswerableQuestion);
export const totalQuestionCount = answerableQuestions.length;
export const baseVisibleQuestionCount = getVisibleQuestions({}).filter(isAnswerableQuestion).length;
