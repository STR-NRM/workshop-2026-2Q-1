# 누리미디어 AI 사업부 맞춤 딥리서치 리포트

- 최초 작성일자: 2026-05-12
- 업데이트일자: 2026-05-12
- 업데이트 내용: v1.1 AI 에디터 CBT 추가, 비AI 서비스 언급 범위 조정, AI/RAG 신뢰성 공통 축 제외 및 선택/분과 축 이동.

## 1. 결론 요약

이번 상반기 설문은 "스쿼드 전환 만족도"가 아니라 "학술 AI 제품 조직의 운영체계 건강도"를 측정해야 한다.

가장 중요한 이유는 다음과 같다.

1. AI 사업부는 단일 기능팀이 아니라 PM, 프롬프트, AI, BE, FE가 함께 제품을 만드는 다직군 제품조직이다.
2. 담당 제품은 AI Agent, AI Viewer, AI Idea, AI Reader, AI Editor로 나뉘며, 각 제품의 사용자 맥락, 성숙도, 전담 인력 구조가 다르다.
3. 비즈니스는 B2B2C라서 구매자, 실제 사용자, 콘텐츠 권리자, 내부 영업/마케팅/서비스 조직의 신호가 분리될 수 있다.
4. 학술용 RAG 서비스는 "빠른 출시"만으로 충분하지 않고, 근거성, 검색 품질, 저작권/콘텐츠 커버리지, hallucination 관리, 비용/지연시간 균형이 함께 중요하다.
5. 실무 스쿼드 15명은 소규모 팀의 속도와 대형 팀의 조정 비용이 동시에 나타날 수 있는 크기다.

따라서 설문은 다음 10개 질문에 답해야 한다.

1. 우리는 AI 사업부의 사업 목표와 제품 우선순위를 같은 방식으로 이해하고 있는가?
2. Agent, Viewer, Idea, Reader, Editor 사이의 자원 배분 기준이 명확한가?
3. 도서관 구매자와 실제 이용자의 피드백이 제품 의사결정으로 들어오는가?
4. PM, 프롬프트, AI, BE, FE, 디자인, 인프라의 책임 경계가 명확한가?
5. 기획에서 개발로 넘기는 미니 워터폴이 아니라 초기부터 함께 문제를 정의하는가?
6. 제품별 성숙도와 담당 구조 차이를 고려해 공통 운영 규칙과 제품별 자율성의 균형을 잡고 있는가?
7. 빠른 실험과 안정적 운영 사이의 trade-off를 명시적으로 결정하는가?
8. 신규/확대 인원이 빠르게 도메인 지식과 시스템 지식에 접근할 수 있는가?
9. 현재 스쿼드 크기에서 회의, 동기화, 컨텍스트 스위칭 비용이 관리되는가?
10. 워크샵 이후 실제로 바꿀 수 있는 4주 실험이 도출될 정도로 구체적인 병목을 찾을 수 있는가?

## 2. 기존 4Q 설문에서 유지할 것과 버릴 것

### 2.1 유지할 것

기존 설문에서 유지할 가치가 있는 요소는 다음이다.

- 심리적 안전감
- 역할과 책임 명확성
- 목표 정렬
- 직군 간 협업
- 의사결정 권한
- 회의/프로세스 효율성
- 지속 가능한 업무 강도
- 정성적 KPT 질문
- AI/웹 엔지니어 협업 및 기술 부채 질문

이 항목들은 Google re:Work, Atlassian Team Health Monitor, Spotify Squad Health Check, SPACE/DevEx 연구와 계속 맞닿아 있다.

### 2.2 그대로 가져오면 안 되는 것

다음 요소는 현재 맥락에 맞지 않거나 bias를 만들 수 있다.

| 기존 전제 | 문제 | v2 변경 방향 |
|---|---|---|
| 기능조직에서 스쿼드로 전환 3개월 | 현재는 2025년 9월 출범 후 확장 단계 | 전환 회고가 아니라 확장 운영체계 진단 |
| 약 10명 규모 | 현재 실무 스쿼드는 15명 | 팀 크기 증가에 따른 동기화/오너십/WIP 진단 |
| 스쿼드 만족도 중심 | 만족도는 결과이지 원인 진단이 아님 | 제품/의사결정/협업 인터페이스별 병목 진단 |
| 일반적 AI 팀 문항 | DBpia AI의 학술/콘텐츠/B2B2C 맥락 부족 | 고객 피드백, 제품 포트폴리오, 협업 인터페이스, 제품별 성숙도 반영 |
| 은유형 서술 질문 다수 | 재미는 있으나 실행 액션과 연결이 약할 수 있음 | 4주 실험, 의사결정 규칙, 제품 신뢰 리스크 중심 |
| 일부 문항의 강한 표현 | 응답을 방어적으로 만들 수 있음 | 중립적 문장과 관찰 가능한 행동 중심 |

## 3. 글로벌 근거를 현재 맥락에 맞게 재해석

### 3.1 Google re:Work / Project Aristotle

핵심 원칙은 심리적 안전감, 신뢰성, 구조와 명확성, 의미, 영향이다.

누리미디어 AI 사업부에 대한 해석:

- 심리적 안전감은 "말하기 편한 분위기"만이 아니라 AI 답변 품질, 검색 실패, hallucination, 일정 리스크를 조기에 공유할 수 있는지를 의미한다.
- 구조와 명확성은 R&R뿐 아니라 Agent/Viewer/Reader/Idea별 제품 오너십, 공통 플랫폼 오너십, 인프라 의존성 처리 방식까지 포함해야 한다.
- 영향은 단순히 "우리가 중요한 일을 한다"가 아니라 실제 도서관 구매/연장, 이용자 사용, 답변 신뢰, 연구 생산성 개선으로 연결되어야 한다.

### 3.2 Atlassian Team Health Monitor / DACI

Atlassian의 팀 건강 점검은 팀 속성별로 빨강/노랑/초록을 보고, 큰 팀은 하위 그룹으로 나눠 먼저 논의하라고 제안한다. DACI는 Driver, Approver, Contributors, Informed를 구분해 의사결정 정체를 줄인다.

누리미디어 AI 사업부에 대한 해석:

- 15명 전체가 모든 의사결정에 참여하면 속도가 느려질 가능성이 높다.
- Agent, Viewer, Reader, Idea, 공통 검색/RAG/플랫폼 같은 워크스트림별 Driver가 필요할 수 있다.
- PM, AI, BE, FE, 디자인, 인프라가 모두 Contributor일 수는 있지만, 사안별 Approver가 불명확하면 합의 비용이 커진다.

### 3.3 Spotify Squad Health Check

Spotify 모델의 핵심은 평가가 아니라 팀이 자기 상태를 스스로 보고 대화하도록 돕는 것이다. "fun", "speed", "easy to release", "mission", "support", "learning" 등이 있다.

누리미디어 AI 사업부에 대한 해석:

- "fun"은 그대로 묻기보다 지속 가능한 몰입, 실험의 학습감, 제품 임팩트 인식으로 바꾸는 것이 더 적합하다.
- "easy to release"는 AI 서비스에서는 배포 용이성뿐 아니라 모델/프롬프트/검색 변경의 검증 용이성까지 포함해야 한다.
- "mission"은 회사 AI 전략과 B2B2C 수익 구조까지 연결되어야 한다. DBpia/KRpia/Citeasy는 사업 맥락상 중요하지만, 설문 문항에서는 AI 서비스 범위가 흐려지지 않도록 과도하게 넣지 않는다.

### 3.4 Amazon/AWS Two-Pizza Team / Working Backwards

Amazon의 two-pizza team 원칙은 작은 팀, 고객 중심, end-to-end ownership, 빠른 의사결정과 연결된다. Working Backwards는 고객 문제에서 시작해 제품을 정의하는 방식이다.

누리미디어 AI 사업부에 대한 해석:

- 실무 스쿼드 15명은 two-pizza team의 작은 팀 원칙보다 큰 편이므로, 전체 스쿼드 안에 제품/플랫폼 워크스트림 단위가 필요할 수 있다.
- B2B2C에서는 "고객"이 하나가 아니다. 도서관 구매자, 실제 학생/연구자, 내부 영업/서비스, 콘텐츠 제공자 관점이 다를 수 있다.
- 설문은 "고객 중심인가"를 추상적으로 묻지 말고, 어떤 고객 신호가 제품 우선순위에 반영되는지 물어야 한다.

### 3.5 Netflix Culture / Informed Captain

Netflix는 context not control, informed captain, 책임 있는 자유를 강조한다.

누리미디어 AI 사업부에 대한 해석:

- 바텀업/스타트업식 실행이 목표라면, 통제보다 맥락 공유가 중요하다.
- 하지만 AI 서비스에서 품질/법무/콘텐츠/비용 리스크가 크므로 모든 결정을 자율에 맡길 수는 없다.
- 설문은 자율성 자체보다 "충분한 맥락을 가진 사람이 명확히 결정하는가"를 물어야 한다.

### 3.6 GitLab Handbook / DRI / Async Communication

GitLab은 DRI, 문서화, 비동기 커뮤니케이션, 온보딩 체계를 강하게 운영한다.

누리미디어 AI 사업부에 대한 해석:

- 신입/신규 합류자가 늘어난 상태에서 암묵지 의존은 속도 저하와 품질 편차를 만든다.
- 도메인 지식이 복잡하다. DBpia 계약 자료, OpenAlex, 외부링크, 의미 검색 커버리지, RAG 정책, 학술 이용자 맥락은 문서화되어야 한다.
- 설문은 "정보 공유가 잘 되는가"보다 "필요한 결정을 이해할 수 있는 기록이 남는가"를 물어야 한다.

### 3.7 Microsoft Work Trend Index 2026

Microsoft는 AI 도입 이후 조직도가 아니라 work chart, 즉 일이 실제로 흐르는 방식이 중요해졌다고 본다. AI 활용은 개인 생산성 도구가 아니라 조직 운영 방식의 재설계와 연결된다.

누리미디어 AI 사업부에 대한 해석:

- AI 사업부는 AI를 만드는 조직이면서 AI를 써서 일할 수도 있는 조직이다.
- 설문은 "AI를 얼마나 많이 쓰는가"보다, 요구사항 정리, QA, 데이터 분석, 고객 피드백 요약, 문서화, 테스트 생성 등 업무 흐름이 실제로 좋아졌는지를 물어야 한다.
- AI 활용이 개인별로 흩어져 있다면 팀 자산으로 축적되지 않을 수 있다.

### 3.8 DORA 2024/2025 및 SPACE/DevEx

DORA와 DevEx 연구는 개발자 생산성을 단일 산출량으로 보지 않는다. 피드백 루프, 인지부하, flow, 도구, 안정적 우선순위, 사용자 중심성이 중요하다. 2025년 DORA의 AI 관련 연구 흐름은 AI 도구가 조직의 기존 강점/약점을 증폭할 수 있음을 시사한다.

누리미디어 AI 사업부에 대한 해석:

- AI 엔지니어, BE, FE가 많아진 현재에는 개발자 경험을 따로 측정해야 한다.
- 평가 대상은 "개발자가 열심히 하는가"가 아니라 요구사항 명확성, 로컬/테스트/배포/로그/관측 가능성, 의존성 대기, 컨텍스트 스위칭이다.
- AI 품질은 사용자 불만이 들어온 뒤 확인하는 방식보다 사전/상시 평가 체계가 필요하다.

### 3.9 NIST AI Risk Management Framework

NIST AI RMF는 AI 시스템을 valid and reliable, safe, secure and resilient, accountable and transparent, explainable and interpretable, privacy-enhanced, fair with harmful bias managed 같은 특성으로 본다.

누리미디어 AI 사업부에 대한 해석:

- 학술 AI 서비스에서는 정확성, 근거성, 설명 가능성, 개인정보/업로드 문서 처리, 저작권/콘텐츠 권리, 편향 관리가 모두 중요하다.
- 워크샵 설문은 법무 체크리스트가 아니라 "우리 팀이 이런 리스크를 제품 의사결정에 넣고 있는가"를 진단해야 한다.

### 3.10 Google People + AI Guidebook / PAIR

Google PAIR는 AI 제품에서 사용자 니즈, 멘탈 모델, 설명, 피드백, 실패 경험 설계를 강조한다.

누리미디어 AI 사업부에 대한 해석:

- 사용자는 AI가 어떤 자료를 보고 답했는지, 무엇을 모르는지, 왜 특정 논문을 추천했는지 이해해야 한다.
- PM/디자인/AI/FE/BE가 함께 실패 케이스와 사용자 기대를 정의하지 않으면 기능은 만들어져도 신뢰는 낮을 수 있다.
- 설문은 "UX가 좋은가"보다 "AI의 한계와 근거를 사용자가 이해하도록 설계하고 있는가"를 물어야 한다.

### 3.11 Team Topologies

Team Topologies는 stream-aligned team, platform team, enabling team, complicated-subsystem team을 구분하고, 팀의 cognitive load를 관리해야 한다고 본다.

누리미디어 AI 사업부에 대한 해석:

- AI 사업부 안에는 제품별 흐름과 공통 기술 기반이 함께 있다.
- Agent/Viewer/Reader/Idea는 stream-aligned 성격이고, 검색/RAG/eval/infra/observability는 platform 또는 complicated-subsystem 성격이 강하다.
- 모든 구성원이 모든 제품과 모든 기술 기반을 동시에 이해해야 한다면 cognitive load가 과도해진다.

## 4. 현재 조사해야 할 핵심 가설

### H1. 제품 포트폴리오 가설

Agent, Viewer, Idea, Reader, Editor가 동시에 움직이면서 우선순위와 WIP가 불명확해질 수 있다. 특히 AI Editor는 CBT 단계이고 소규모 전담 방식이므로, 정식 운영 제품과 같은 방식으로만 비교하면 해석이 왜곡될 수 있다.

조사 문항 필요:

- 제품별 우선순위 기준
- 자원 배분 납득도
- 제품 간 컨텍스트 스위칭
- 제품 성과지표 이해도

### H2. B2B2C 피드백 루프 가설

구매자와 실제 이용자가 달라 제품 의사결정에 들어오는 고객 신호가 왜곡되거나 늦어질 수 있다.

조사 문항 필요:

- 도서관/영업/서비스 피드백 반영 속도
- 학생/연구자 사용 데이터 접근성
- 불만/문의/세일즈 신호의 제품화 방식
- 내부 이해관계자와의 우선순위 합의

### H3. 제품 성숙도와 실행 방식 가설

운영 중인 제품과 CBT/실험 단계 제품은 필요한 속도, 검증 수준, 문서화 수준, 협업 구조가 다를 수 있다. 이 차이가 명확하지 않으면 일부 제품은 과도하게 무겁게 운영되고, 일부 제품은 충분한 공유 없이 진행될 수 있다.

조사 문항 필요:

- 운영 제품과 CBT 제품의 의사결정 기준 차이
- 소규모 전담 워크스트림의 공유 수준
- 신규 실험을 정식 제품화할 때 필요한 조건
- FE 바이브코딩처럼 빠른 구현 방식의 장점/리스크 공유
- 제품별 자율성과 전체 정렬의 균형

### H4. 다직군 인터페이스 가설

PM, 프롬프트, AI, BE, FE, 디자인, 인프라가 모두 필요한 제품 특성상 인터페이스 정의가 약하면 mini-waterfall 또는 재작업이 늘어날 수 있다.

조사 문항 필요:

- 기획 초기 기술/디자인 참여
- API/데이터/UX 계약 명확성
- 변경사항 공유 방식
- 완료 기준 정의
- 장애/품질 이슈 핸드오프

### H5. 스쿼드 크기 가설

실무 15명은 한 팀으로 정렬되기에는 충분히 작지만, 모든 것을 함께 결정하기에는 큰 편이다.

조사 문항 필요:

- 워크스트림별 DRI
- 회의 효율성
- 결정 대기 시간
- 전체 sync와 소규모 실행 단위의 균형
- 인지부하와 컨텍스트 스위칭

### H6. 온보딩/도메인 지식 가설

신규 PM, FE, BE가 늘어난 만큼 DBpia/KRpia/콘텐츠/AI 검색/RAG 도메인 지식 접근성이 실행 속도를 좌우한다.

조사 문항 필요:

- 필요한 도메인 지식 문서 접근성
- 시스템 구조 이해도
- 신규 합류자의 독립 실행까지 걸리는 시간
- 질문을 던질 수 있는 채널과 담당자

### H7. 스타트업식 실행과 전사 통합 가설

AI 사업부는 바텀업/빠른 실행을 목표로 하지만, 전사 조직의 영업, 마케팅, 서비스, 콘텐츠, 인프라와 연결되어야 한다.

조사 문항 필요:

- 빠른 실험을 막는 전사 의존성
- 필요한 지원을 받는 속도
- 외부 팀과의 우선순위 충돌
- 책임과 권한의 불일치

## 5. 설문 설계 결론

### 5.1 v2 설문이 측정해야 할 9개 축

1. 사업 목표와 AI 제품 포트폴리오 정렬
2. 고객/사용자/내부 이해관계자 피드백 루프
3. 제품 발견과 요구사항 품질
4. 의사결정 권한과 워크스트림 오너십
5. 다직군 협업 인터페이스
6. 제품별 실행 방식과 성숙도 관리
7. 개발자 경험과 운영 안정성
8. 온보딩, 문서화, 도메인 지식 접근성
9. 지속가능성, 심리적 안전감, 학습

AI/RAG 신뢰성 및 평가 체계는 공통 필수 축에서 제외한다. 이유는 조직 워크샵 전체 응답자에게는 기술적이고 특정 직군 중심으로 느껴질 수 있으며, 현재 사용자가 불필요하다고 판단한 범위이기 때문이다. 다만 AI 품질이나 RAG 기준이 실제로 중요해질 수 있으므로, 선택 모듈 또는 분과 토론 주제로만 남긴다.

### 5.2 v2 설문에서 줄여야 할 것

- 전환 3개월 회고 질문
- "스쿼드 체제 만족도" 같은 넓은 감정 질문의 비중
- 은유형 질문
- 개인/직군을 방어적으로 만들 수 있는 질문
- 응답자 수가 적은 직군별 비교

### 5.3 v2 설문에서 늘려야 할 것

- 제품별 우선순위와 WIP
- 고객 신호의 흐름
- 의사결정 DRI
- FE/BE/AI/PM/디자인/인프라 인터페이스
- 제품별 실행 방식과 성숙도 차이
- 신규 합류자 온보딩과 암묵지 해소
- 워크샵에서 바로 실험으로 바꿀 수 있는 구체적 병목

## 6. 참고 출처

- Google re:Work / Project Aristotle: https://uploads.teachablecdn.com/attachments/scu2ImXuS0ixn0J8yfkg_Google_-_Aristotle_-_Most_Productive_Teams.pdf
- Atlassian Team Health Monitor: https://www.atlassian.com/team-playbook/health-monitor
- Atlassian DACI: https://www.atlassian.com/blog/teamwork/daci-method-for-better-project-decisions
- Spotify Squad Health Check: https://engineering.atspotify.com/2014/9/squad-health-check-model
- AWS Two-Pizza Teams: https://aws.amazon.com/jp/executive-insights/content/amazon-two-pizza-team/
- Netflix Culture Memo: https://jobs.netflix.com/culture?showAll=true
- GitLab Communication Handbook: https://handbook.gitlab.com/handbook/communication/
- GitLab Onboarding Handbook: https://handbook.gitlab.com/handbook/company/culture/all-remote/onboarding/
- Microsoft Work Trend Index 2026: https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization
- DORA 2024 Report: https://dora.dev/research/2024/dora-report/
- DORA 2025 survey/question resources: https://dora.dev/research/2025/questions/
- SPACE developer productivity paper: https://www.microsoft.com/en-us/research/publication/the-space-of-developer-productivity-theres-more-to-it-than-you-think/
- DevEx paper: https://queue.acm.org/detail.cfm?id=3595878
- NIST AI Risk Management Framework: https://www.nist.gov/itl/ai-risk-management-framework
- Google People + AI Guidebook: https://pair.withgoogle.com/guidebook/
- Team Topologies: https://teamtopologies.com/learn
- DBpia AI 공식 페이지: https://dbpia.ai/
- DBpia AI Viewer 소개: https://www.dbpia.co.kr/intro/ai-viewer
- DBpia AI 상품 소개: https://www.dbpia.co.kr/intro/ai-product
