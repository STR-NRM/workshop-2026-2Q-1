# 기존 4Q 앱 기반 상반기 워크샵 앱 이전 고려사항

- 최초 작성일자: 2026-05-11
- 업데이트일자: 2026-05-13
- 업데이트 내용: v1.4 GitHub Pages 정적 배포 기준 AI 분석 방식을 재판단. Firebase Functions 의존 제거.
- 작성자: Codex
- 적용 대상: 2026년 2Q-1 상반기 워크샵 설문 앱 구현

## 1. 핵심 결론

기존 4Q 앱은 설문 UI와 결과/AI 분석 흐름을 재사용할 수 있다. 그러나 콘텐츠, 데이터 경로, 배포 경로, 보안 구조는 반드시 분리해야 한다.

단순히 `questions.js` 문구만 바꾸는 방식은 위험하다. 기존 응답 데이터와 AI 분석 캐시가 섞이고, 4Q 설문 맥락이 프롬프트와 화면에 남을 가능성이 높기 때문이다.

상반기 앱의 최종 문항 구현 기준은 `02_survey_design/07_final_question_bank_source_of_truth.md`다. `02_recommended_survey_questions.md`와 `04_nurimedia_survey_question_bank_v2.md`는 초안/참고 문서로만 사용한다.

## 2. 재사용 가능한 부분

| 영역 | 재사용 가능성 | 설명 |
|---|---|---|
| React/Vite 구조 | 높음 | 정적 설문 앱 구조로 충분히 적합 |
| 라우팅 | 높음 | 랜딩, 설문, 완료, 결과, AI 분석 흐름 재사용 가능 |
| 설문 컴포넌트 | 높음 | Scale, Choice, Text 컴포넌트 재사용 가능 |
| 결과 차트 | 중간 | 척도/객관식/서술형 결과 시각화는 재사용 가능 |
| AI 분석 화면 | 중간 | 프롬프트와 저장 경로 변경 필요 |
| CSS 시스템 | 중간 | 심플한 흑백 UI 재사용 가능. 단, 상반기 브랜드/문구는 교체 필요 |

## 3. 반드시 변경해야 할 부분

### 3.1 프로젝트 경로와 배포 base

기존:

```js
base: '/workshop-2025-4Q/'
```

상반기용 예시:

```js
base: '/workshop-2026-2Q-1/'
```

변경 대상:

- `vite.config.js`
- GitHub Pages repository 또는 Pages path
- `package.json`의 `name`
- `index.html` title/meta description

### 3.2 Firebase 프로젝트 또는 데이터 네임스페이스

기존 앱은 `ws-4q-92ed5` Firebase Realtime Database에 고정되어 있다.

상반기 앱에서는 다음 중 하나를 선택해야 한다.

#### 권장안 A: 새 Firebase 프로젝트 사용

장점:

- 4Q 데이터와 완전 분리.
- 실수로 과거 응답/분석을 덮어쓸 위험이 낮음.

단점:

- 새 프로젝트 설정 필요.

#### 권장안 B: 같은 Firebase 프로젝트 안에서 설문 버전 경로 분리

예시:

```text
/surveys/2026-2Q-1/users/{userId}
/surveys/2026-2Q-1/responses/{userId}/{questionId}
/surveys/2026-2Q-1/analysis/{questionId}
/surveys/2026-2Q-1/comprehensiveAnalysis
```

장점:

- Firebase 프로젝트를 새로 만들지 않아도 됨.

단점:

- 코드 수정이 조금 더 필요.
- 보안 룰과 관리 실수 가능성 존재.

권장: 새 Firebase 프로젝트가 가장 안전하다. 시간이 부족하면 버전 경로 분리라도 반드시 해야 한다.

### 3.3 설문 콘텐츠

변경 대상:

- `src/data/questions.js`
- 최종 source of truth: `02_survey_design/07_final_question_bank_source_of_truth.md`
- `survey_questions.md`
- DOCX 원본 문서
- 랜딩 페이지 배지/설명
- 완료 페이지 안내 문구
- 직군/역할 선택 후 라우팅되는 문항
- 질문 아래 표시되는 짧은 설명문
- 분과별 토론 후 그룹 입력 문항

주의:

- 4Q, 3개월, 스쿼드 전환 초기, 기능 조직 대비 같은 표현은 제거하거나 현재 맥락에 맞게 바꿔야 한다.

### 3.4 AI 분석 프롬프트

변경 대상:

- `src/prompts/analysisPrompt.js`
- `src/prompts/comprehensiveAnalysisPrompt.js`

필수 변경:

- 설문 배경을 "기능 조직에서 스쿼드 체제 전환 3개월"에서 "AI 사업부 16명, 실무 스쿼드 15명, 최종 응답 대상 14명 팀원의 운영체계 건강도 진단"으로 변경.
- 분석 관점에 AI Agent, AI Viewer, AI Idea, AI Reader, AI Editor, 신규 구성원 통합, PM/FE/BE/AI 협업, 결정권, DevEx, 업무 지속 가능성을 포함.
- AI/RAG 품질은 공통 핵심 축이 아니라 필요 시 엔지니어링/운영 분과 선택 토픽으로 취급.
- 출력 형식에서 "스쿼드 4분기 회고" 제목 제거.

### 3.5 OpenAI API 보안과 Pages 배포

기존 앱은 브라우저에서 OpenAI API 키를 직접 사용한다.

문제:

- `VITE_OPENAI_API_KEY`는 빌드된 프론트엔드 번들에 노출된다.
- 워크샵 내부용이라도 링크가 외부에 공유되면 키 오남용 위험이 있다.

현실적 선택지:

1. 작년 방식처럼 `VITE_OPENAI_API_KEY`를 빌드에 넣으면 클릭 한 번으로 분석되지만, 공개 Pages에서는 key가 번들에 노출된다.
2. Firebase Functions 같은 서버 프록시는 key 보호에는 가장 좋지만, Spark 플랜에서 배포가 막혀 Blaze 전환이 필요할 수 있다.
3. 현재 상반기 앱은 결과 화면에서 진행자가 API key를 입력하고 브라우저가 OpenAI Responses API를 직접 호출한다. 생성된 보고서만 Firebase에 저장한다.

최종 판단: GitHub Pages 정적 배포와 단순 운영을 우선한다. 다만 key를 빌드 번들에 넣지 않기 위해 런타임 입력 방식을 사용한다. 설문 응답자는 별도 설정 없이 URL만 열면 되고, AI 분석을 생성하는 진행자만 API key를 입력한다.

## 4. 기존 앱에서 발견된 정리 대상

기존 앱 이해 과정에서 확인한 사항이다.

| 항목 | 상태 | 상반기 구현 전 판단 |
|---|---|---|
| `npm run build` | 성공 | 기본 앱 구조는 빌드 가능 |
| `npm run lint` | 실패 | 구현 전 수정 권장 |
| production dependency audit | critical/high 취약점 존재 | `npm audit fix` 또는 의존성 업데이트 검토 |
| 결과 페이지 접근 제한 | 없음 | 팀 공유용 공개 조회로 유지 |
| OpenAI 브라우저 호출 | 있음 | 키 노출 리스크 관리 필요 |
| Firebase 데이터 경로 | 4Q 전용 고정 | 반드시 분리 |
| README | Vite 기본 템플릿 | 상반기 앱용으로 작성 필요 |

## 5. 구현 순서 권장안

1. `workshop-2026-2Q-1`에 앱 소스 복제.
2. `package.json`, `vite.config.js`, `index.html`에서 프로젝트명/배포 경로 변경.
3. Firebase 새 프로젝트 또는 `/surveys/2026-2Q-1` 네임스페이스 적용.
4. `questions.js`를 새 문항으로 교체.
5. 직군별 라우팅과 질문 설명문 렌더링 추가.
6. 분과별 그룹 입력 플로우 추가.
7. AI 분석 프롬프트를 새 조직 상황에 맞게 교체.
8. 랜딩/완료/결과 페이지 문구 변경.
9. lint 오류 수정.
10. `npm run build` 확인.
11. 실제 Firebase 테스트 데이터 1-2건으로 저장/조회 확인.
12. 결과 페이지와 AI 분석 페이지는 팀 공유용 공개 조회로 운영.

## 6. 상반기 앱 구현 시 추가하면 좋은 개선

### 6.1 설문 버전 상수화

예시:

```js
export const SURVEY_ID = '2026-2Q-1';
```

Firebase 경로와 분석 캐시 경로에 모두 적용한다.

### 6.2 문항 타입 확장

현재 앱은 scale, choice, text를 지원한다. 이번 설문에는 다음 타입을 추가하면 좋다.

- `multiChoice`: 복수 선택형
- `roleChoice`: 역할에 따라 선택 문항 노출
- `scale5na`: 5점 척도 + 해당 없음/판단하기 어려움
- `breakoutText`: 분과별 그룹 입력
- `helpText`: 질문 하단 설명문 렌더링용 필드

이번 설문은 시간이 30분 이상 확보되어 있고 직군별 문항이 필요하므로 `roleChoice`, `helpText`, `scale5na`, 조건부 라우팅은 구현 우선순위가 높다.

라우팅 필수 조건:

- `META_ROLE`에 따라 역할별 문항 모듈 1개만 노출.
- `META_EXTERNAL` 선택값에 따라 외부 협업 모듈 노출.
- `META_CBT` 선택값에 따라 CBT/신규 실험 모듈 노출.
- N/A 응답은 평균에서 제외하고 N/A 비율은 별도 집계.

### 6.3 결과 해석 보조

결과 페이지에 다음을 추가하면 워크샵에 유용하다.

- 섹션별 평균
- 평균 낮은 문항 Top 5
- 분산 큰 문항 Top 5
- N/A 비율 높은 문항 Top 5
- 서술형 키워드 요약
- 4주 실험 후보 자동 추출

### 6.4 월간 펄스 모드

워크샵 이후 `02_survey_design/08_monthly_pulse_followup_pool.md`의 문항을 사용해 5문항 이하의 짧은 후속 설문을 운영할 수 있으면 좋다.

최소 구현:

- 같은 앱 안에 `mode: 'pulse'`를 두고 문항 풀 일부만 노출.
- 본 설문 데이터와 펄스 데이터를 다른 경로에 저장.
- 펄스 결과는 실험 유지/수정/중단 판단에만 사용.

## 7. 최종 권장

기존 앱은 UI와 기본 흐름을 재사용하되, 상반기 앱은 별도 제품처럼 다루는 것이 맞다.

최소 변경으로 구현하려면 다음 세 가지만은 반드시 지킨다.

1. Firebase 데이터 경로 분리.
2. `07_final_question_bank_source_of_truth.md` 기준으로 설문 문항과 AI 프롬프트 완전 교체.
3. 배포 base와 화면 메타 정보 변경.

이 세 가지를 하지 않으면 4Q 설문과 상반기 설문이 운영/데이터/분석 관점에서 섞일 수 있다.

가능하면 `03_delivery_notes/02_execution_roadmap.md`의 일정에 맞춰 사전 인지 검증과 테스트 응답 검증까지 마친 뒤 배포한다.
