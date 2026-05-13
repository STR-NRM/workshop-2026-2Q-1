export const SURVEY_ID = '2026-2Q-1';
export const QUESTION_VERSION = '2026-05-13-v1.2';

export const surveyInfo = {
  title: '2026 상반기 AI 사업부 운영체계 건강도 설문',
  shortTitle: 'AI 사업부 워크샵 사전 설문',
  description:
    '개인 평가가 아니라 워크샵에서 다룰 운영 병목과 4주 실행 실험을 찾기 위한 설문입니다.',
  target: '문치웅 팀장과 스쿼드 리드를 제외한 실무 팀원 14명',
  estimatedTime: '25~35분',
  organization: '누리미디어 AI 사업부',
};

export const scaleOptions = [
  { value: 1, label: '전혀 그렇지 않다' },
  { value: 2, label: '그렇지 않은 편이다' },
  { value: 3, label: '보통이다' },
  { value: 4, label: '그런 편이다' },
  { value: 5, label: '매우 그렇다' },
  { value: 'NA', label: '해당 없음 / 판단하기 어려움', isNeutral: true },
];

export const roleOptions = [
  '제품/PM/프롬프트',
  'AI 엔지니어링',
  '웹 엔지니어링(FE/BE)',
];

export const externalExcludedOptions = ['특별히 없음'];

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

const roleQuestion = (role, id, title, question, helpText, tag) =>
  q({
    id,
    type: 'scale5na',
    section: `역할별 문항: ${role}`,
    role,
    title,
    question,
    helpText,
    tag,
  });

export const questions = [
  q({
    id: 'META_ROLE',
    type: 'singleChoice',
    section: '기본 정보',
    title: '주된 역할군',
    question: '현재 본인이 주로 수행하는 역할에 가장 가까운 것을 선택해주세요.',
    helpText:
      '결과 공개 시 세부 직군별 평균은 사용하지 않습니다. 이 문항은 라우팅과 전체 해석 보조 목적으로만 사용합니다.',
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
      '직접 담당, 부분 지원, 검토, 협업 요청 대응까지 포함해 실제로 시간을 쓴 항목을 선택해주세요. 이 문항은 제품별 책임 범위와 우선순위 병목을 해석하기 위한 보조 정보입니다.',
    options: [
      'AI Agent',
      'AI Viewer',
      'AI Idea',
      'AI Reader',
      'AI Editor',
      '공통 검색/AI 플랫폼/인프라성 작업',
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
      '신규 합류자 개인을 식별하려는 목적이 아니라, 온보딩과 조직 기억의 상태를 해석하기 위한 문항입니다.',
    options: ['3개월 미만', '3~6개월', '6개월 이상'],
  }),
  q({
    id: 'META_EXTERNAL',
    type: 'multiChoice',
    section: '기본 정보',
    title: '최근 6주 외부 협업 접점',
    question: '최근 6주 동안 업무상 자주 협업했거나 요청을 주고받은 외부 접점을 선택해주세요.',
    helpText:
      '여기서 외부는 AI 사업부 실무 스쿼드 밖의 협업 접점을 뜻합니다. 특정 개인 평가가 아니라 협업 흐름을 보기 위한 문항입니다.',
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
    title: 'CBT/신규 실험 관여 여부',
    question: '최근 6주 동안 AI Editor 등 CBT 또는 신규 실험 업무에 직접 관여했습니까?',
    helpText: 'CBT/신규 실험의 운영 기준을 별도로 보기 위한 문항입니다.',
    options: ['예', '아니오'],
  }),

  scale('A01', 'A. 사업 목표와 제품 포트폴리오 정렬', 'AI 사업부 목표 이해', 'AI 사업부의 가장 중요한 사업 목표가 무엇인지 명확히 이해하고 있다.', '개인 목표가 아니라 조직 차원의 우선 사업 목표를 기준으로 답해주세요.', 'alignment'),
  scale('A02', 'A. 사업 목표와 제품 포트폴리오 정렬', '제품 우선순위 기준', 'AI Agent, AI Viewer, AI Idea, AI Reader, AI Editor 사이의 우선순위 기준이 명확하다.', '어떤 제품이 더 중요하다고 생각하는지가 아니라, 우선순위를 정하는 기준을 이해할 수 있는지 답해주세요.', 'portfolio'),
  scale('A03', 'A. 사업 목표와 제품 포트폴리오 정렬', '내 업무와 목표 연결', '현재 내가 하는 일이 AI 사업부의 제품 목표와 어떻게 연결되는지 이해하고 있다.', '본인의 최근 업무가 어떤 제품 목표나 사업 목표에 기여하는지 설명할 수 있는지 기준으로 답해주세요.', 'alignment'),
  scale('A04', 'A. 사업 목표와 제품 포트폴리오 정렬', '제품 성공 기준', '제품별 성공 기준이 단순 출시 여부가 아니라 이용, 신뢰, 고객 가치, 사업성과 관점에서 정의되어 있다.', '모든 지표가 완벽히 있어야 한다는 뜻은 아닙니다. 출시 후 무엇을 성공으로 볼지 대체로 공유되는지 봅니다.', 'outcome'),
  scale('A05', 'A. 사업 목표와 제품 포트폴리오 정렬', '우선순위 변경 공유', '제품 우선순위가 바뀔 때 그 이유와 판단 근거가 충분히 공유된다.', '최근 우선순위 변경을 경험했다면, 변경 배경과 영향 범위를 이해할 수 있었는지 기준으로 답해주세요.', 'prioritization'),

  scale('B01', 'B. 고객, 사용자, 내부 이해관계자 피드백 루프', '기관 고객 요구 반영', '도서관/기관 고객의 요구와 제약이 제품 의사결정에 충분히 반영된다.', '구매자 관점의 요청, 계약/도입 조건, 운영 제약이 제품 판단에 들어오는지 기준으로 답해주세요.', 'customer-signal', { allowNA: true }),
  scale('B02', 'B. 고객, 사용자, 내부 이해관계자 피드백 루프', '실제 사용자 신호 전달', '실제 이용자인 학생, 대학원생, 연구자의 사용 행동과 불편이 팀에 충분히 전달된다.', '현장 피드백, 사용 데이터, 문의, 인터뷰 등 실제 사용자의 신호를 접할 수 있는지 봅니다.', 'user-signal', { allowNA: true }),
  scale('B03', 'B. 고객, 사용자, 내부 이해관계자 피드백 루프', '내부 피드백 정리', '영업, 마케팅, 서비스, 콘텐츠 관련 조직에서 들어오는 피드백이 정리되어 우선순위 결정에 사용된다.', '요청이 단순 전달되는 수준을 넘어, 제품 판단에 쓸 수 있는 형태로 정리되는지 기준으로 답해주세요.', 'stakeholder-loop', { allowNA: true }),
  scale('B04', 'B. 고객, 사용자, 내부 이해관계자 피드백 루프', '충돌 신호 판단 기준', '사용자 문의, 불만, 사용 데이터, 영업 현장의 이야기가 서로 다를 때 판단 기준이 있다.', '서로 다른 신호가 충돌할 때 어떤 신호를 더 중시할지 논의하거나 결정하는 방식이 있는지 봅니다.', 'signal-conflict', { allowNA: true }),
  scale('B05', 'B. 고객, 사용자, 내부 이해관계자 피드백 루프', '사용자 문제 확인', '새 기능을 만들기 전에 어떤 사용자 문제를 해결하는지 충분히 확인한다.', '아이디어나 요청이 바로 구현으로 가지 않고, 해결하려는 문제가 확인되는지 기준으로 답해주세요.', 'discovery'),

  scale('C01', 'C. 제품 발견과 요구사항 품질', '문제와 성공 기준 정의', '새 기능 또는 개선을 시작할 때 문제, 대상 사용자, 성공 기준이 명확히 정의된다.', '티켓, 문서, 회의록 등 어떤 형태든 시작 전에 핵심 조건이 남는지 기준으로 답해주세요.', 'requirement-quality'),
  scale('C02', 'C. 제품 발견과 요구사항 품질', '필요 역할 조기 참여', 'PM/프롬프트/AI/BE/FE/디자인이 필요한 시점에 함께 제약과 가능성을 확인한다.', '모든 사람이 모든 회의에 참여해야 한다는 뜻은 아닙니다. 필요한 역할이 너무 늦지 않게 참여하는지 봅니다.', 'early-collaboration'),
  scale('C03', 'C. 제품 발견과 요구사항 품질', '요구사항 변경 공유', '요구사항 변경이 발생하면 변경 이유, 영향 범위, 우선순위가 명확히 공유된다.', '변경 자체의 빈도가 아니라, 변경이 생겼을 때 팀이 같은 맥락을 이해할 수 있는지 답해주세요.', 'change-management'),
  scale('C04', 'C. 제품 발견과 요구사항 품질', 'AI 제약 반영', '제품 요구사항은 AI 기능의 불확실성과 기술 제약을 고려해 작성된다.', 'AI 응답 품질, 지연, 실패 가능성, 데이터 제약 등 AI 기능 특성이 요구사항에 반영되는지 봅니다.', 'ai-product-spec'),
  scale('C05', 'C. 제품 발견과 요구사항 품질', '완료 기준 품질', '완료 기준에는 기능 구현뿐 아니라 품질, 사용성, 운영 가능성 기준이 포함된다.', '배포 가능 여부, 사용자 안내, 장애 대응, 로그 확인 같은 기준이 함께 고려되는지 답해주세요.', 'definition-of-done'),

  scale('D01', 'D. 의사결정, 책임 범위, 동시에 진행 중인 일', '최종 의사결정자 명확성', '제품/기능/기술 사안별 최종 의사결정자가 누구인지 대체로 명확하다.', '모든 결정이 한 사람에게 모여야 한다는 뜻은 아닙니다. 사안별로 누가 결정을 끝내는지 알 수 있는지 봅니다.', 'decision-rights'),
  scale('D02', 'D. 의사결정, 책임 범위, 동시에 진행 중인 일', '결정 참여 균형', '의사결정에 필요한 사람은 충분히 참여하지만, 모든 사람이 모든 결정에 참여하지는 않는다.', '참여 부족과 합의 과부하 사이의 균형을 기준으로 답해주세요.', 'decision-efficiency'),
  scale('D03', 'D. 의사결정, 책임 범위, 동시에 진행 중인 일', '결정 기록', '결정이 내려진 뒤에는 결정 내용과 이유가 필요한 사람에게 남는다.', '구두 합의만으로 사라지지 않고 나중에 확인할 수 있는 형태가 있는지 봅니다.', 'decision-memory'),
  scale('D04', 'D. 의사결정, 책임 범위, 동시에 진행 중인 일', '책임 역할 명확성', '제품 또는 공통 플랫폼 작업별로 책임지고 끝까지 보는 역할이 명확하다.', '개인 이름을 묻는 문항이 아닙니다. 제품이나 작업별로 누가 끝까지 챙기고 결정 흐름을 정리하는지 기준으로 답해주세요.', 'ownership'),
  scale('D05', 'D. 의사결정, 책임 범위, 동시에 진행 중인 일', '결정 지연 해소', '의사결정이 지연될 때 어디에서 막혔는지 확인하고 풀 수 있다.', '지연이 생겼을 때 원인과 다음 행동이 드러나는지 기준으로 답해주세요.', 'decision-latency'),
  scale('D06', 'D. 의사결정, 책임 범위, 동시에 진행 중인 일', '동시에 진행 중인 일 관리', '동시에 진행 중인 일이 너무 많아 중요한 일에 집중하기 어렵다는 문제가 관리되고 있다.', '업무량의 절대 크기보다 여러 일을 오가느라 집중이 깨지는 문제가 관리되는지 봅니다.', 'work-in-progress'),

  scale('E01', 'E. 다직군 협업 인터페이스', 'PM/프롬프트-AI 기대치', 'PM/프롬프트와 AI 엔지니어 사이에서 기대하는 결과물과 제약이 명확히 합의된다.', '프롬프트, 검색, 평가, 응답 품질 기대치가 서로 다르게 해석되지 않는지 봅니다.', 'pm-ai-interface'),
  scale('E02', 'E. 다직군 협업 인터페이스', 'AI-BE 계약', 'AI 엔지니어와 BE 사이에서 데이터, API, 검색/AI 처리 흐름의 계약이 명확하다.', '입력/출력, 실패 처리, 데이터 흐름, 책임 경계가 필요한 만큼 정의되는지 기준으로 답해주세요.', 'ai-be-interface'),
  scale('E03', 'E. 다직군 협업 인터페이스', 'BE-FE 구현 계약', 'BE와 FE 사이에서 API, 상태, 에러, 로딩, 권한, 예외 케이스가 충분히 정의된다.', '화면 구현 중 뒤늦게 확인되는 요소가 반복되는지 떠올려 답해주세요.', 'web-interface'),
  scale('E04', 'E. 다직군 협업 인터페이스', '디자인/UX 조기 반영', '디자인/UX 관점이 기능 후반이 아니라 문제 정의와 설계 초기에 반영된다.', '디자인 산출물 자체보다 사용자 경험 관점이 너무 늦게 들어오지 않는지 봅니다.', 'ux-collaboration', { allowNA: true }),
  scale('E05', 'E. 다직군 협업 인터페이스', '인프라/운영 조기 확인', '인프라/운영 관련 제약은 일정 후반이 아니라 충분히 이른 시점에 확인된다.', '배포, 성능, 비용, 보안, 모니터링 같은 제약이 늦게 드러나는지 기준으로 답해주세요.', 'infra-collaboration', { allowNA: true }),
  scale('E06', 'E. 다직군 협업 인터페이스', '시스템 중심 문제 해결', '직군 간 이슈가 생겼을 때 책임 공방보다 인터페이스와 시스템 문제를 먼저 본다.', '개인의 잘잘못보다 재발을 줄이는 구조를 논의하는지 기준으로 답해주세요.', 'blameless-collaboration'),

  scale('F01', 'F. 제품별 실행 방식과 성숙도 관리', '운영/실험 방식 차이', '운영 중인 제품과 CBT/실험 단계 제품의 실행 방식 차이를 팀이 이해하고 있다.', '정식 운영 제품과 실험 제품에 같은 기준을 적용해야 한다는 뜻이 아닙니다. 차이가 인식되는지 봅니다.', 'product-maturity'),
  scale('F02', 'F. 제품별 실행 방식과 성숙도 관리', '소규모 전담 공유', 'AI Editor처럼 소규모 전담으로 진행되는 업무도 필요한 수준으로 팀에 공유된다.', '모든 세부 진행을 공유해야 한다는 뜻은 아닙니다. 팀 정렬에 필요한 정보가 공유되는지 기준으로 답해주세요.', 'cbt-sharing', { allowNA: true }),
  scale('F03', 'F. 제품별 실행 방식과 성숙도 관리', '실험/엄격 검토 구분', '제품별로 빠르게 실험해도 되는 영역과 더 엄격히 검토해야 하는 영역이 구분되어 있다.', '속도와 리스크 관리 기준이 제품 또는 기능 성격에 따라 구분되는지 봅니다.', 'risk-tiering'),
  scale('F04', 'F. 제품별 실행 방식과 성숙도 관리', '제품화 기준', 'CBT/실험 단계 서비스가 정식 제품으로 넘어가기 위한 기준이 대체로 명확하다.', '이용, 품질, 고객 피드백, 운영 가능성 등 제품화 판단 기준이 있는지 기준으로 답해주세요.', 'productization'),
  scale('F05', 'F. 제품별 실행 방식과 성숙도 관리', '제품 간 학습 공유', '각 제품에서 얻은 학습과 실패 사례가 다른 제품에도 재사용될 수 있게 공유된다.', '회고, 문서, 회의, 사례 공유 등 어떤 방식이든 학습이 제품 간 이동하는지 봅니다.', 'learning-transfer'),

  scale('G01', 'G. 개발/운영 경험', '로그/모니터링 접근성', '개발자가 필요한 로그, 모니터링, 재현 정보에 접근해 문제를 빠르게 파악할 수 있다.', '장애나 품질 이슈가 있을 때 원인 파악에 필요한 정보 접근성이 충분한지 답해주세요.', 'observability', { allowNA: true }),
  scale('G02', 'G. 개발/운영 경험', '배포 검증과 속도', '배포 또는 릴리즈 과정은 필요한 검증을 포함하면서도 과도하게 느리지 않다.', '속도만 보지 말고, 검증과 실행 속도의 균형을 기준으로 답해주세요.', 'release-flow', { allowNA: true }),
  scale('G03', 'G. 개발/운영 경험', '변경 영향 범위', '공통 코드, 데이터 파이프라인, 검색/AI 구성요소의 변경 영향 범위를 이해할 수 있다.', '변경 시 어떤 제품이나 기능에 영향을 줄지 추적 가능한지 기준으로 답해주세요.', 'change-impact', { allowNA: true }),
  scale('G04', 'G. 개발/운영 경험', '기술 부채와 사업 요구 균형', '기술 부채와 단기 사업 요구 사이의 균형을 논의하고 결정할 수 있다.', '기술 부채를 항상 줄여야 한다는 뜻이 아닙니다. 당장 필요한 일과 나중에 문제가 될 수 있는 일 사이의 균형을 논의하고 결정하는지 봅니다.', 'tech-debt-balance'),
  scale('G05', 'G. 개발/운영 경험', '장애/품질 대응 경로', '장애나 품질 문제가 발생했을 때 대응 역할과 커뮤니케이션 경로가 명확하다.', '문제가 생긴 뒤 누가 무엇을 확인하고 누구에게 알릴지 대체로 분명한지 답해주세요.', 'incident-response', { allowNA: true }),

  scale('H01', 'H. 지식, 온보딩, 조직 기억', '신규 합류 자료', '신규 합류자가 AI 사업부의 제품 구조와 일하는 방식을 이해하는 데 필요한 자료가 충분하다.', '신규 구성원이 혼자 모든 것을 찾아야 하는지, 기본 맥락을 얻을 자료가 있는지 기준으로 답해주세요.', 'onboarding'),
  scale('H02', 'H. 지식, 온보딩, 조직 기억', '도메인 지식 접근', '콘텐츠, 데이터 출처, 검색 커버리지, 고객 맥락 등 제품 판단에 필요한 도메인 지식에 접근할 수 있다.', 'AI 제품 판단에 필요한 배경지식이 특정 사람의 암묵지에만 머물지 않는지 봅니다.', 'domain-knowledge'),
  scale('H03', 'H. 지식, 온보딩, 조직 기억', '조직 기억', '중요한 결정, 시도한 일의 결과, 장애 사례는 나중에 찾아볼 수 있는 형태로 남는다.', '기록의 완벽함이 아니라, 반복해서 같은 맥락을 다시 설명해야 하는지 기준으로 답해주세요.', 'organizational-memory'),
  scale('H04', 'H. 지식, 온보딩, 조직 기억', '질문 경로', '질문이 있을 때 누구에게 물어봐야 하는지 대체로 명확하다.', '답을 바로 알 수 있는지가 아니라, 질문을 어디로 가져가야 하는지 알 수 있는지 봅니다.', 'knowledge-routing'),

  scale('I01', 'I. 지속가능성, 심리적 안전감, 학습', '지속 가능한 속도', '현재 업무량과 속도는 품질을 크게 희생하지 않고 지속 가능하다.', '일시적으로 바쁜 상황보다, 현재 속도가 몇 달 이상 지속될 때의 품질과 피로도를 기준으로 답해주세요.', 'sustainability'),
  scale('I02', 'I. 지속가능성, 심리적 안전감, 학습', '불편한 이야기 가능성', '일정, 품질, 기술 리스크에 대해 불편한 이야기를 해도 불이익이나 무시를 걱정하지 않는다.', '실제로 우려를 제기할 수 있는 분위기와 반응을 기준으로 답해주세요.', 'psychological-safety'),
  scale('I03', 'I. 지속가능성, 심리적 안전감, 학습', '학습 중심 대응', '실패나 품질 이슈가 발생했을 때 개인 탓보다 재발 방지와 학습에 집중한다.', '문제 발생 후 논의가 책임 추궁보다 원인과 예방에 가까운지 봅니다.', 'learning-culture'),
  scale('I04', 'I. 지속가능성, 심리적 안전감, 학습', '워크샵 실효성', '이번 워크샵에서 논의하면 실제로 바꿀 수 있는 운영 문제가 있다고 느낀다.', '모든 문제가 해결될 것이라는 기대가 아니라, 워크샵에서 구체적으로 바꿀 수 있는 영역이 있는지 답해주세요.', 'workshop-efficacy'),

  q({
    id: 'CHOICE01',
    type: 'singleChoice',
    section: '객관식 문항',
    title: '현재 가장 큰 병목',
    question: '현재 AI 사업부의 실행을 가장 많이 막는 병목은 어디에 가깝습니까?',
    helpText: '개인 책임이 아니라 운영 흐름 관점에서 가장 가까운 항목을 고르세요.',
    options: [
      '제품 우선순위/전략 정렬',
      '고객/사용자 피드백 수집과 해석',
      '요구사항 명확성',
      '의사결정 속도와 권한',
      '팀 내부 제품/개발 협업(PM/프롬프트/AI/BE/FE)',
      '타팀 협업(디자인, 인프라, 영업, 마케팅 등)',
      '제품별 실행 방식과 성숙도 관리',
      '개발/배포/운영 환경',
      '인력/시간/동시에 진행 중인 일 과다',
      '온보딩/문서화 부족',
      '기타',
    ],
  }),
  q({
    id: 'CHOICE02',
    type: 'singleChoice',
    section: '객관식 문항',
    title: '4주 안에 먼저 개선할 영역',
    question: '다음 4주 동안 가장 먼저 개선하면 효과가 클 영역은 무엇입니까?',
    helpText: '가장 이상적인 개선이 아니라, 실제로 4주 안에 시작하고 확인할 수 있는 영역을 고르세요.',
    options: [
      '제품별 우선순위와 책임 역할 정리',
      '고객/사용자 의견이 제품 결정으로 이어지는 흐름 정리',
      '요구사항 문서 양식/완료 기준 정리',
      '의사결정자와 결정 방식 정리',
      '제품별 실행/공유/제품화 기준 정리',
      '배포/운영/로그 체계 정리',
      '온보딩/문서화 정리',
      '회의와 동시에 진행 중인 일 줄이기',
      '외부 협업 요청 방식 정리',
    ],
  }),
  q({
    id: 'CHOICE03',
    type: 'singleChoice',
    section: '객관식 문항',
    title: '제품 포트폴리오 운영 상태',
    question: '현재 제품 포트폴리오 운영 방식에 가장 가까운 설명은 무엇입니까?',
    helpText: '가장 많이 체감하는 상태를 하나만 선택하세요.',
    options: [
      '제품별 우선순위와 책임 범위가 대체로 명확하다',
      '우선순위는 있으나 자주 흔들린다',
      '여러 제품이 동시에 진행되어 집중이 어렵다',
      '특정 제품에 과도하게 쏠려 있다',
      'CBT/실험 단계 제품과 운영 제품의 기준 차이가 모호하다',
      '제품 간 학습 공유가 부족하다',
    ],
  }),
  q({
    id: 'CHOICE04',
    type: 'multiChoice',
    section: '객관식 문항',
    title: '외부 협업 개선 접점',
    question: '외부 협업에서 가장 개선이 필요한 접점을 최대 2개 선택해주세요.',
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
    title: '제품별 실행 방식 리스크',
    question: '제품별 실행 방식 측면에서 가장 큰 리스크는 무엇입니까?',
    helpText: '운영 제품과 CBT/실험 제품을 모두 떠올려 가장 가까운 항목을 고르세요.',
    options: [
      '운영 제품과 CBT/실험 제품의 기준 차이 불명확',
      '소규모 전담 업무의 공유 부족',
      '빠른 구현 방식의 리스크 관리 부족',
      '제품화 기준 불명확',
      '제품 간 학습 공유 부족',
      '특정 제품에 과도한 집중 또는 방치',
      '특별히 없음',
    ],
  }),
  q({
    id: 'CHOICE06',
    type: 'singleChoice',
    section: '객관식 문항',
    title: '워크샵 분과 선호',
    question: '워크샵에서 가장 논의하고 싶은 분과 주제는 무엇입니까?',
    helpText: '본인의 직군이 아니라, 이번 워크샵에서 실제 개선이 필요하다고 보는 주제를 선택해주세요.',
    options: [
      '제품/우선순위',
      '고객/시장/내부 피드백',
      'PM/프롬프트/요구사항',
      '엔지니어링/운영',
      'CBT/신규 실험',
    ],
  }),

  q({
    id: 'TEXT01',
    type: 'longText',
    section: '서술형 문항',
    title: '유지할 운영 방식',
    question: '현재 AI 사업부가 계속 유지해야 할 가장 좋은 운영 방식은 무엇입니까?',
    helpText: '구체적인 사례가 있으면 쓰되, 개인 이름 없이 운영 방식 중심으로 적어주세요.',
    minLength: 10,
  }),
  q({
    id: 'TEXT02',
    type: 'longText',
    section: '서술형 문항',
    title: '가장 큰 병목',
    question: '현재 내 업무를 가장 많이 막는 병목 한 가지를 구체적으로 적어주세요.',
    helpText: '특정 사람의 문제보다 정보 흐름, 결정 방식, 협업 구조, 도구, 기준, 일정 흐름 관점으로 적어주세요.',
    minLength: 10,
  }),
  q({
    id: 'TEXT03',
    type: 'longText',
    section: '서술형 문항',
    title: '제품별 책임 범위 모호성',
    question:
      'Agent, Viewer, Idea, Reader, Editor 또는 공통 플랫폼 중 우선순위, 책임 범위, 운영 기준이 가장 모호하다고 느끼는 영역이 있다면 무엇이며, 왜 그렇습니까?',
    helpText:
      '특정 제품을 비판하기보다, 무엇을 기준으로 결정하고 누가 끝까지 챙기는지 모호한 지점을 적어주세요.',
    minLength: 10,
  }),
  q({
    id: 'TEXT04',
    type: 'longText',
    section: '서술형 문항',
    title: '운영 제품과 CBT/실험 제품 기준',
    question: '운영 제품과 CBT/실험 단계 제품을 구분해 관리하기 위해 가장 먼저 정리해야 할 기준은 무엇이라고 생각합니까?',
    helpText: '공유 주기, 검증 수준, 제품화 기준, 리스크 체크 등 필요한 기준을 떠올려 답해주세요.',
    minLength: 10,
  }),
  q({
    id: 'TEXT05',
    type: 'longText',
    section: '서술형 문항',
    title: '4주 운영 실험 제안',
    question: '다음 4주 동안 AI 사업부가 시도해볼 수 있는 작고 구체적인 운영 실험을 하나 제안해주세요.',
    helpText: '조직개편보다 작게 시작할 수 있는 회의, 문서, 의사결정, 협업 방식 변경을 우선 적어주세요.',
    minLength: 10,
  }),
  q({
    id: 'TEXT06',
    type: 'longText',
    section: '서술형 문항',
    title: '설문에서 빠진 중요한 신호',
    question: '위 문항으로 충분히 담기지 않은 중요한 리스크나 개선 주제가 있다면 적어주세요.',
    helpText: '응답하기 불편한 내용일수록 개인 식별 표현을 피하고, 운영 구조나 반복 패턴 중심으로 적어주세요.',
    required: false,
  }),

  roleQuestion('제품/PM/프롬프트', 'PM01', '사용자 문제 중심 요구사항', '요구사항은 사용자 문제와 성공 기준을 기능 목록보다 먼저 다룬다.', '요구사항 문서나 논의에서 "무엇을 만들지"보다 "왜 필요한지"가 먼저 확인되는지 봅니다.', 'pm-requirement'),
  roleQuestion('제품/PM/프롬프트', 'PM02', '기술 제약 정보 접근', 'AI 모델, 검색, 데이터, 운영 제약을 고려해 기능 요구사항을 작성할 충분한 정보가 있다.', 'PM/프롬프트 관점에서 기술 제약을 이해하고 반영할 수 있는 정보 접근성을 기준으로 답해주세요.', 'pm-ai-context'),
  roleQuestion('제품/PM/프롬프트', 'PM03', '요청을 우선순위로 바꾸는 기준', '영업/서비스/마케팅/콘텐츠 요청을 제품 우선순위로 바꾸는 기준이 명확하다.', '요청의 양이나 강도만으로 결정되지 않고, 판단 기준이 있는지 봅니다.', 'pm-prioritization'),
  roleQuestion('제품/PM/프롬프트', 'PM04', '변경 영향 검토', '요구사항 변경 시 엔지니어링, 디자인, 운영 영향이 필요한 수준으로 함께 검토된다.', '변경 결정 후 전달이 아니라, 변경 판단 과정에서 영향이 확인되는지 기준으로 답해주세요.', 'pm-change-impact'),

  roleQuestion('AI 엔지니어링', 'AI01', 'AI 변경 결과 공유', '모델, 프롬프트, 검색 방식 변경을 테스트한 결과가 제품/개발 의사결정에 이해 가능한 형태로 공유된다.', '예를 들어 무엇을 바꿨고, 어떤 점이 좋아졌거나 나빠졌으며, 제품에 적용할 때 주의할 점이 무엇인지 PM과 개발자가 이해할 수 있게 공유되는지 답해주세요.', 'ai-result-sharing'),
  roleQuestion('AI 엔지니어링', 'AI02', 'AI 변경 이력 관리', '실패 사례, 프롬프트/검색 변경 이력, 평가 결과가 필요한 수준으로 관리된다.', '세부 평가 체계의 완성도보다, 반복 학습과 원인 파악에 필요한 기록이 있는지 기준으로 답해주세요.', 'ai-learning-record'),
  roleQuestion('AI 엔지니어링', 'AI03', '품질 개선과 안정 운영 균형', 'AI 품질 개선과 서비스 안정 운영 사이의 우선순위가 명확하다.', '품질을 높이는 일, 비용과 속도, 장애 가능성 사이에서 무엇을 먼저 볼지 논의되고 결정되는지 봅니다.', 'ai-stability-balance'),
  roleQuestion('AI 엔지니어링', 'AI04', 'AI-BE/PM 책임 경계', 'AI 엔지니어링과 BE/PM 사이의 책임 경계와 인수인계 기준이 명확하다.', '모델/검색/데이터 처리 결과가 서비스 구현으로 넘어갈 때 필요한 기준이 있는지 답해주세요.', 'ai-handoff'),

  roleQuestion('웹 엔지니어링(FE/BE)', 'WEB01', '구현 전 합의', 'API, 데이터 구조, 예외 케이스, 에러 메시지, 로딩 상태가 구현 전에 충분히 합의된다.', '구현 중 뒤늦게 결정되는 요소가 반복되는지 기준으로 답해주세요.', 'web-contract'),
  roleQuestion('웹 엔지니어링(FE/BE)', 'WEB02', 'AI 기능 상태 처리', 'AI 기능의 비동기 처리, 지연, 실패, 재시도, 사용자 안내 기준이 명확하다.', 'AI 기능 특성 때문에 생기는 UX/상태 처리 기준이 충분한지 봅니다.', 'web-ai-state'),
  roleQuestion('웹 엔지니어링(FE/BE)', 'WEB03', '공통 체계 지원', '공통 컴포넌트, API 패턴, 배포 체계가 제품 개발 속도를 충분히 지원한다.', '공통화가 부족해서 반복 구현이 생기거나, 반대로 공통 체계가 병목이 되는지 기준으로 답해주세요.', 'web-platform'),
  roleQuestion('웹 엔지니어링(FE/BE)', 'WEB04', '빠른 구현 방식 리스크 검토', '빠른 구현 방식의 생산성 이점과 품질/운영 리스크가 함께 검토된다.', '특정 방식의 좋고 나쁨이 아니라, 빠르게 만드는 방식의 장점과 위험이 모두 보이는지 답해주세요.', 'web-fast-build-risk'),

  q({
    id: 'EXT01',
    type: 'scale5na',
    section: '조건부 문항: 외부 협업',
    condition: 'external',
    title: '외부 협업 요청 품질',
    question: '외부 협업 요청은 필요한 배경, 목적, 기한, 결정 사항을 포함해 전달된다.',
    helpText: '요청을 주고받을 때 상대가 판단할 수 있는 정보가 충분한지 봅니다.',
    tag: 'external-request',
  }),
  q({
    id: 'EXT02',
    type: 'scale5na',
    section: '조건부 문항: 외부 협업',
    condition: 'external',
    title: '외부 협업 조기 확인',
    question: '다른 팀의 도움이 필요한 일은 일정이 많이 진행되기 전에 확인된다.',
    helpText:
      '예를 들어 디자인, 인프라, 영업/서비스/콘텐츠 협조가 필요한 일이 뒤늦게 발견되지 않고, 계획 초반에 확인되는지 답해주세요.',
    tag: 'external-early-signal',
  }),
  q({
    id: 'EXT03',
    type: 'scale5na',
    section: '조건부 문항: 외부 협업',
    condition: 'external',
    title: '외부 피드백 반영',
    question: '외부 협업에서 생긴 피드백이나 제약이 제품 우선순위와 요구사항에 반영된다.',
    helpText: '협업 결과가 단순 참고로 끝나는지, 실제 제품 판단에 연결되는지 봅니다.',
    tag: 'external-feedback',
  }),
  q({
    id: 'CBT01',
    type: 'scale5na',
    section: '조건부 문항: CBT/신규 실험',
    condition: 'cbt',
    title: 'CBT 목표 단계 명확성',
    question: 'AI Editor 등 CBT/신규 실험의 현재 목표가 학습, 검증, 출시, 판매 준비 중 어디에 가까운지 명확하다.',
    helpText: '단계별 목적이 명확해야 필요한 공유와 검증 수준도 정할 수 있습니다.',
    tag: 'cbt-purpose',
  }),
  q({
    id: 'CBT02',
    type: 'scale5na',
    section: '조건부 문항: CBT/신규 실험',
    condition: 'cbt',
    title: 'CBT 공유 기준',
    question: 'CBT/신규 실험에서 반드시 팀에 공유해야 하는 정보와 공유하지 않아도 되는 정보가 구분되어 있다.',
    helpText: '모든 정보를 공유해야 한다는 뜻은 아닙니다. 정렬에 필요한 정보의 기준이 있는지 봅니다.',
    tag: 'cbt-sharing-rule',
  }),
  q({
    id: 'CBT03',
    type: 'scale5na',
    section: '조건부 문항: CBT/신규 실험',
    condition: 'cbt',
    title: '빠른 구현 방식 리스크',
    question: '빠른 구현 방식의 생산성 이점과 품질/운영 리스크가 함께 검토된다.',
    helpText: '속도를 내는 방식이 유효한 조건과 나중에 갚아야 할 리스크가 드러나는지 답해주세요.',
    tag: 'cbt-fast-build-risk',
  }),
  q({
    id: 'CBT04',
    type: 'scale5na',
    section: '조건부 문항: CBT/신규 실험',
    condition: 'cbt',
    title: '정식 제품 후보 판단 기준',
    question: 'CBT/신규 실험을 정식 제품 후보로 판단하기 위한 기준이 있다.',
    helpText: '사용성, 고객 반응, 품질, 운영 가능성, 사업성 중 어떤 기준을 볼지 정리되어 있는지 봅니다.',
    tag: 'cbt-productization',
  }),
];

export const axisMap = [
  { axis: '사업/제품 정렬', tags: ['alignment', 'portfolio', 'outcome', 'prioritization'] },
  { axis: '고객/사용자/내부 피드백', tags: ['customer-signal', 'user-signal', 'stakeholder-loop', 'signal-conflict', 'discovery', 'external-feedback'] },
  { axis: '제품 발견/요구사항', tags: ['requirement-quality', 'early-collaboration', 'change-management', 'ai-product-spec', 'definition-of-done', 'pm-requirement', 'pm-ai-context', 'pm-prioritization', 'pm-change-impact'] },
  { axis: '의사결정/책임 범위/동시에 진행 중인 일', tags: ['decision-rights', 'decision-efficiency', 'decision-memory', 'ownership', 'decision-latency', 'work-in-progress'] },
  { axis: '다직군 협업', tags: ['pm-ai-interface', 'ai-be-interface', 'web-interface', 'ux-collaboration', 'infra-collaboration', 'blameless-collaboration', 'ai-handoff', 'web-contract', 'web-ai-state', 'web-platform', 'external-request', 'external-early-signal'] },
  { axis: '제품별 실행 방식/성숙도', tags: ['product-maturity', 'cbt-sharing', 'risk-tiering', 'productization', 'learning-transfer', 'cbt-purpose', 'cbt-sharing-rule', 'cbt-fast-build-risk', 'cbt-productization'] },
  { axis: '개발/운영 경험', tags: ['observability', 'release-flow', 'change-impact', 'tech-debt-balance', 'incident-response', 'ai-learning-record', 'ai-stability-balance', 'web-fast-build-risk'] },
  { axis: '지식/온보딩/조직 기억', tags: ['onboarding', 'domain-knowledge', 'organizational-memory', 'knowledge-routing'] },
  { axis: '지속가능성/심리적 안전/학습', tags: ['sustainability', 'psychological-safety', 'learning-culture', 'workshop-efficacy'] },
];

export function hasExternalModule(responses) {
  const value = responses?.META_EXTERNAL;
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.some((item) => !externalExcludedOptions.includes(item));
}

export function hasCbtModule(responses) {
  return responses?.META_CBT === '예';
}

export function isQuestionVisible(question, responses = {}) {
  if (question.role) {
    return responses.META_ROLE === question.role;
  }
  if (question.condition === 'external') {
    return hasExternalModule(responses);
  }
  if (question.condition === 'cbt') {
    return hasCbtModule(responses);
  }
  return true;
}

export function getVisibleQuestions(responses = {}) {
  return questions.filter((question) => isQuestionVisible(question, responses));
}

export function isAnswered(question, value) {
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

export const totalQuestionCount = questions.length;
export const baseVisibleQuestionCount = getVisibleQuestions({}).length;
