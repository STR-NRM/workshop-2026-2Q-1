# 글로벌 베스트 프랙티스 출처 매트릭스

- 최초 작성일자: 2026-05-11
- 업데이트일자: 2026-05-11
- 업데이트 내용: v1.0 신규 작성. 출처별 핵심 원칙, 이번 설문 반영 방식, 주의점을 표로 정리.
- 작성자: Codex
- 적용 대상: 2026년 2Q-1 상반기 워크샵 설문 기획

## 1. 출처 선정 기준

이번 리서치는 다음 기준으로 출처를 선별했다.

1. 글로벌 기업 또는 글로벌 연구/컨설팅 기관에서 공개한 자료.
2. 조직 설문 또는 팀 효과성 진단에 직접 연결되는 자료.
3. 제품/소프트웨어 개발 조직의 실제 운영에 적용 가능한 자료.
4. 2026년 현재 상황과 관련성이 있는 최신 자료를 우선하되, 검증된 고전 프레임워크도 포함.

## 2. 출처 매트릭스

| 번호 | 출처 | 핵심 원칙 | 이번 설문 반영 방식 | 주의점 |
|---|---|---|---|---|
| 01 | [Google re:Work - Project Aristotle](https://uploads.teachablecdn.com/attachments/scu2ImXuS0ixn0J8yfkg_Google_-_Aristotle_-_Most_Productive_Teams.pdf) | 심리적 안전감, 의존 가능성, 구조와 명확성, 의미, 영향력 | 심리적 안전감과 역할/목표 명확성 문항 포함 | Google 맥락을 그대로 복제하지 않고 현재 팀 상황에 맞게 재작성 |
| 02 | [Atlassian Team Health Monitor](https://www.atlassian.com/team-playbook/health-monitor) | 팀 응집력, 균형 잡힌 팀, 차이 장려, 공유 이해, 가치와 지표, 일하는 방식, 지원, 지속 개선 | 설문 진단 축의 기본 골격으로 반영 | 16인 팀에서는 전체 평균만 보지 말고 하위 그룹 토론 필요 |
| 03 | [Spotify Squad Health Check](https://engineering.atspotify.com/2014/9/squad-health-check-model) | 팀 스스로 개선점을 발견하는 건강 점검 | 결과를 개인 평가가 아닌 워크샵 대화 재료로 사용 | 점수 순위화 또는 관리 평가로 쓰면 취지 훼손 |
| 04 | [AWS - Amazon Two Pizza Teams](https://aws.amazon.com/jp/executive-insights/content/amazon-two-pizza-team/) | 단일 책임, 엔드투엔드 오너십, 명확한 미션, 고객 가치 지표 | 16인 단일 스쿼드의 책임 경계와 가치 흐름 진단 | "작은 팀"만 결론으로 삼지 말고 책임 구조와 가치 흐름을 먼저 진단 |
| 05 | [Netflix Culture Memo](https://jobs.netflix.com/culture?showAll=true) | Context not control, informed captain, highly aligned loosely coupled | 리더십, 맥락 제공, 최종 결정자 명확성 문항 반영 | 자유와 책임은 충분한 맥락과 코칭이 있을 때만 작동 |
| 06 | [Atlassian DACI](https://www.atlassian.com/blog/teamwork/daci-method-for-better-project-decisions) | Driver, Approver, Contributors, Informed로 의사결정 역할 명확화 | PM/스쿼드 리드/엔지니어링 간 결정권 문항 반영 | 모든 작은 결정에 적용하면 과도한 프로세스가 될 수 있음 |
| 07 | [GitLab Remote Onboarding](https://handbook.gitlab.com/handbook/company/culture/all-remote/onboarding/) | 조직/기술/사회적 온보딩, 문서 기반 self-service | 신규 구성원 통합, 문서 접근성, 초기 성공 경험 문항 반영 | 원격 조직 사례지만 빠른 확장 조직에도 원칙 적용 가능 |
| 08 | [GitLab Communication](https://handbook.gitlab.com/handbook/communication/) | 비동기 기본값, 투명한 기록, 오프라인 결론 기록 | 회의/문서/결정 기록의 품질 측정 | 모든 대화를 문서화하는 것이 아니라 중요한 결론과 맥락을 기록하는 것이 핵심 |
| 09 | [Microsoft Work Trend Index 2022](https://www.microsoft.com/en-us/worklab/work-trend-index/hybrid-work-is-just-work/) | 활동량보다 임팩트, 생산성 불신 해소, 우선순위 명확성 | 업무량/회의량이 아니라 영향력과 우선순위 명확성을 측정 | 하이브리드 연구지만 활동량 측정의 한계는 일반 적용 가능 |
| 10 | [Microsoft Work Trend Index 2026](https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization) | AI가 개인 역량을 확장하지만 조직 시스템이 따라가야 가치화 | AI 활용을 개인 숙련도보다 업무 설계/조직 학습 관점에서 측정 | AI 사용량만 묻는 문항은 피해야 함 |
| 11 | [DORA 2024](https://dora.dev/research/2024/dora-report/) | 사용자 중심성, 안정적 우선순위, 플랫폼 엔지니어링, 리더십, 인간 요소 | 개발 품질, 우선순위 안정성, 플랫폼/도구 지원 문항 반영 | DORA 지표만으로 조직 건강을 대체하지 않음 |
| 12 | [Google Keyword - DORA 2025](https://blog.google/innovation-and-ai/technology/developers-tools/dora-report-2025/) | AI는 거울과 증폭기. 조직이 조각나 있으면 약점도 증폭 | AI가 품질, 리뷰, 문서, 검증, 협업에 미치는 영향 문항 반영 | AI 도입 여부만으로 성숙도를 판단하면 안 됨 |
| 13 | [Microsoft Research - SPACE](https://www.microsoft.com/en-us/research/publication/the-space-of-developer-productivity-theres-more-to-it-than-you-think/) | 생산성은 만족/웰빙, 성과, 활동, 소통, 효율/흐름의 다차원 개념 | 개발 생산성을 단일 산출량 대신 복합 경험으로 측정 | 개인별 생산성 평가 도구로 쓰면 왜곡 가능 |
| 14 | [ACM Queue - DevEx](https://queue.acm.org/detail.cfm?id=3595878) | 피드백 루프, 인지부하, 흐름 상태가 개발자 경험의 핵심 | FE/BE/AI 개발 흐름, 리뷰/테스트/배포/문서 마찰 문항 반영 | 도구 문제와 인간/조직 문제를 함께 봐야 함 |
| 15 | [Gallup Q12](https://www.gallup.com/q12-employee-engagement-survey/) | 명확성, 자원, 인정, 성장, 팀워크, 몰입 | 자체 문항으로 기본 욕구와 성장/몰입을 측정 | Q12 문항 자체는 독점 성격이 있으므로 그대로 복제하지 않음 |
| 16 | [McKinsey - Agile operating model](https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/agility-to-action-operationalizing-a-value-driven-agile-blueprint) | 느슨하게 결합되고 강하게 정렬된 미션, 가치 흐름 중심 설계 | 스쿼드 내 의존성, 가치 흐름, 목표 정렬 문항 반영 | 컨설팅 프레임워크이므로 소규모 팀에는 과도한 구조화 주의 |
| 17 | [Team Topologies](https://teamtopologies.com/learn) | 가치 흐름, 인지부하, 명시적 상호작용 모드, 팀 경계 조정 | 16인 스쿼드의 병목, 하위 흐름, 팀 경계 변경 필요성 진단 | 당장 조직개편 결론을 내기보다 흐름과 인지부하를 먼저 측정 |

## 3. 이번 설문에 직접 반영한 설계 원칙

| 설계 원칙 | 근거 출처 | 설문 반영 |
|---|---|---|
| 높을수록 좋은 상태가 되도록 문항 방향 통일 | 설문 해석 품질 원칙, 기존 설문 개선점 | 모든 척도 문항을 긍정 방향으로 작성 |
| 심리적 안전감은 계속 포함하되 확장 조직 맥락으로 재작성 | Google re:Work, Atlassian, DevEx | 신규 구성원 질문 가능성, 직군 간 반대 의견 수용 문항 |
| 역할/책임/결정권은 별도 진단 축으로 강화 | Atlassian DACI, Netflix, Amazon | PM/리드/엔지니어링 결정권 문항 |
| 신규 구성원 온보딩을 독립 축으로 포함 | GitLab onboarding | 제품 맥락, 기술 환경, 문서, 사회적 연결 문항 |
| 개발 생산성은 활동량이 아니라 마찰과 흐름으로 측정 | SPACE, DevEx, DORA | 리뷰, 테스트, 배포, 인지부하, 집중 시간 문항 |
| AI 활용은 개인 사용량보다 업무 시스템 적합성으로 측정 | Microsoft WTI 2026, DORA 2025 | AI 품질 검증, 문서/요구사항/리뷰 활용 문항 |
| 결과는 평가가 아니라 워크샵 액션으로 연결 | Spotify Health Check, Atlassian Health Monitor | 서술형 질문과 4주 실험 문항 포함 |

## 4. 채택하지 않은 접근

| 접근 | 채택하지 않은 이유 |
|---|---|
| 기존 4Q 설문 문항 대부분 유지 | 현재 조직 과제가 전환 적응에서 확장 운영으로 바뀌었기 때문 |
| 직군별 상세 비교 | 16인 규모에서는 개인 식별 위험이 높기 때문 |
| 개인 생산성/성과 문항 | 방어적 응답과 왜곡을 만들 수 있고, 팀 시스템 진단 목적에 맞지 않음 |
| AI 사용량 중심 문항 | 사용량만으로 성과나 품질을 설명할 수 없기 때문 |
| 단일 만족도 점수 중심 | 워크샵 액션 도출에 필요한 원인 진단력이 낮기 때문 |

