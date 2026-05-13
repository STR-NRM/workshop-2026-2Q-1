# 최종 개발 계획서

- 최초 작성일자: 2026-05-12
- 업데이트일자: 2026-05-13
- 업데이트 내용: v1.2 결과 화면 무로그인 공개 조회, GitHub Pages Firebase mode, 전문가 검토형 AI 리포트 요구 반영.
- 작성자: Codex
- 적용 대상: `workshop-2026-2Q-1` 앱 개발
- 기준 문서: `02_survey_design/07_final_question_bank_source_of_truth.md`

## 0. 판단 과정 요약

1. 먼저 2025 4Q 레퍼런스 앱의 구조를 확인했다. 레퍼런스는 React/Vite 단일 페이지 앱, Firebase Realtime Database, GitHub Pages 배포, 브라우저 OpenAI API 호출 구조였다.
2. 다음으로 현재 2026 2Q-1 설문 요구사항을 기준으로 재사용 가능한 것과 교체해야 할 것을 나눴다. UI 흐름, 차트, Firebase 저장 흐름은 재사용 가치가 있지만, 문항 데이터, 라우팅, 분석 프롬프트, 보안 구조는 크게 바꿔야 한다.
3. 비용과 보안을 함께 검토했다. Firebase Realtime Database는 Spark 플랜에서 100 동시 연결, 1GB 저장, 월 10GB 다운로드 범위가 제공되어 14명 워크샵 설문에는 충분하다. 반면 Cloud Functions는 Spark에서 사용할 수 없으므로, 서버 프록시 방식은 과금 플랜 전환이 필요할 수 있다.
4. OpenAI API는 `gpt-5.5`와 `reasoning.effort: "high"`를 사용할 수 있다. 다만 API 키를 Vite 프론트엔드 환경변수로 넣으면 빌드 결과물에 노출되므로 기본안에서 제외했다.
5. 최종안은 "프론트 앱은 설문/결과 표시를 담당하고, AI 분석 생성은 결과 화면 버튼이 Firebase Cloud Function을 호출해 실행한 뒤 결과를 Firebase에 저장하는 구조"로 정했다. 이 방식은 앱 안에서 즉시 분석을 실행할 수 있고, OpenAI 키를 브라우저 번들에 넣지 않는다.
6. Firebase Cloud Functions 배포에는 Blaze 전환이 필요할 수 있으므로, 비용이 발생하는 플랜 변경은 사용자 승인 후에만 진행한다.

## 1. 레퍼런스 앱 분석

### 1.1 레퍼런스 기술 스택

| 영역 | 레퍼런스 상태 |
|---|---|
| 프론트엔드 | React 19, Vite 7, React Router |
| 배포 | GitHub Pages workflow |
| 데이터 | Firebase Realtime Database |
| 차트 | Chart.js, react-chartjs-2 |
| AI 분석 | OpenAI SDK를 브라우저에서 직접 호출 |
| 설문 UI | 모바일 대응 1문항 1화면 |
| 문항 타입 | `scale`, `choice`, `text` |
| 결과 페이지 | 전체 응답 집계, 차트, 서술형 원문 페이지네이션 |
| AI 페이지 | 서술형 개별 분석, 전체 종합 분석 |

### 1.2 재사용할 부분

- React/Vite 앱 구조
- 1문항 1화면 설문 경험
- 자동 저장과 이어서 진행
- 완료 페이지
- 결과 집계 페이지의 기본 틀
- Chart.js 기반 시각화
- AI 분석 결과 표시 페이지
- GitHub Pages 배포 workflow의 기본 흐름

### 1.3 교체 또는 대수정할 부분

| 영역 | 이유 | 처리 |
|---|---|---|
| 문항 데이터 | 2025 4Q 맥락이 전부 다름 | 최종 source of truth 기준으로 전면 교체 |
| 문항 타입 | `scale5na`, `multiChoice`, 조건부 라우팅 필요 | 설문 엔진 확장 |
| 응답 대상 | 4Q는 약 10명, 이번은 팀원 14명 | 랜딩/분석/프롬프트 교체 |
| Firebase 경로 | 4Q 데이터와 섞이면 안 됨 | `/surveys/2026-2Q-1/...` 네임스페이스 |
| Firebase 보안 | 기존은 앱에서 전체 응답을 읽는 구조 | 응답 write는 익명 인증, 결과 read는 팀 공유용 공개 |
| OpenAI 호출 | 브라우저 직접 호출은 API 키 노출 | Firebase Cloud Functions 프록시 |
| AI 프롬프트 | 4Q 스쿼드 전환 회고 프롬프트 | 2026 2Q-1 조직 운영 진단 프롬프트로 전면 교체 |
| 결과 해석 | 평균 중심 | 평균, 분산, N/A 비율, 낮은 점수 비율, 주관식 테마 |

## 2. 구현 옵션 비교

### 2.1 앱 구축 방식

| 옵션 | 설명 | 장점 | 단점 | 판단 |
|---|---|---|---|---|
| A. 4Q 앱 복사 후 전면 리팩터 | 기존 앱을 새 repo로 복사하고 핵심 구조를 개선 | 빠름, 검증된 흐름 재사용 | 오래된 맥락 제거를 꼼꼼히 해야 함 | 채택 |
| B. 완전 신규 구현 | Vite/React를 새로 만들고 필요한 기능만 구현 | 구조가 깔끔함 | 시간이 더 걸리고 기존 Firebase/결과 흐름 재구현 필요 | 비채택 |
| C. Google Form/Typeform | 별도 앱 없이 폼 도구 사용 | 빠름 | 라우팅, 결과, AI 분석, 워크샵 후속 흐름이 약함 | 비채택 |

결정: A를 선택한다. 단순 복사가 아니라 "레퍼런스 UI 흐름 재사용 + 설문 엔진/데이터/분석 구조 재설계"로 진행한다.

### 2.2 데이터 저장소

| 옵션 | 설명 | 장점 | 단점 | 판단 |
|---|---|---|---|---|
| A. Firebase Realtime Database | 레퍼런스와 동일한 DB | 레퍼런스 재사용, 14명 규모에 충분, Spark 무료 범위 내 가능 | 쿼리/분석은 Firestore보다 단순 | 채택 |
| B. Firestore | 문서 기반 DB | 보안 규칙과 쿼리가 명확함 | 레퍼런스 코드 재사용성이 낮음 | 보류 |
| C. 로컬 JSON/CSV | 서버 없이 파일로 수집 | 보안 단순 | 실시간 저장/이어하기 불가 | 비채택 |
| D. Supabase/Postgres | RLS와 SQL 분석 강함 | 확장성 좋음 | 기존 맥락과 다르고 설정 증가 | 비채택 |

결정: Firebase Realtime Database를 사용한다. 가능하면 새 Firebase 프로젝트를 만들고, 프로젝트 생성이나 Realtime Database 활성화 과정에서 유료 전환이 요구되면 사용자 승인을 먼저 받는다.

참고: Firebase 공식 가격표 기준 Spark 플랜은 결제 수단 없이 시작 가능하며, Realtime Database는 Spark에서 100 동시 연결, 1GB 저장, 월 10GB 다운로드를 제공한다. 이번 설문 규모에는 충분하다.

### 2.3 OpenAI 분석 구조

| 옵션 | 설명 | 장점 | 단점 | 판단 |
|---|---|---|---|---|
| A. 브라우저에서 OpenAI 직접 호출 | 레퍼런스 방식 | 구현 가장 빠름 | API 키가 번들에 노출됨 | 기본안에서 제외 |
| B. Firebase Cloud Functions 프록시 | 앱에서 함수 호출, 함수가 OpenAI 호출 | 키 보호, 앱 안에서 분석 버튼 가능 | Blaze 전환 필요 가능성, 설정 증가 | 채택 |
| C. 수동 서버외 분석 실행 | 운영자 환경에서 OpenAI 호출 후 Firebase에 결과 저장 | 키 노출 없음, Cloud Functions 불필요, 비용 통제 쉬움 | 앱에서 즉시 분석 버튼을 누르는 경험은 약함 | 폐기 |
| D. GitHub Actions 수동 분석 | Actions secret으로 분석 실행 | 키 노출 없음, 실행 기록 남음 | workflow 설정 증가 | 2차 옵션 |

결정: B를 기본안으로 한다. 결과 화면의 "AI 분석 생성/갱신" 버튼이 Firebase Cloud Function을 호출하고, 함수가 `gpt-5.5` high reasoning으로 전문가 검토형 보고서를 생성해 Firebase에 저장한다. 브라우저 번들에는 OpenAI 키를 넣지 않는다.

### 2.4 배포

| 옵션 | 설명 | 장점 | 단점 | 판단 |
|---|---|---|---|---|
| A. GitHub Pages | 레퍼런스와 동일 | repo workflow 재사용, 정적 앱에 적합 | private repo Pages 가능 여부는 조직 설정에 따라 다름 | 1순위 |
| B. Firebase Hosting | Firebase 프로젝트와 묶어서 운영 | 정적 앱 배포에 적합, Spark 무료 범위 있음 | 별도 hosting setup 필요 | fallback |
| C. Vercel/Netlify | 설정 쉬움 | 빠른 배포 | 새 외부 서비스 추가 | 비채택 |

결정: GitHub Pages를 1순위로 한다. private repo Pages가 조직 설정 때문에 막히면 Firebase Hosting으로 전환한다. 둘 다 유료 결제 요구가 나오면 진행 전 사용자에게 확인한다.

### 2.5 인증과 결과 접근

| 옵션 | 설명 | 장점 | 단점 | 판단 |
|---|---|---|---|---|
| A. 응답 write만 익명 인증, 결과 read는 공개 | 팀원이 URL만 열면 설문과 결과를 모두 볼 수 있음 | 운영 마찰이 가장 낮음 | 결과 URL 공유 범위를 관리해야 함 | 채택 |
| B. 응답자는 익명 인증, 결과는 Google 로그인 | 결과 접근 통제 가능 | 팝업/리다이렉트 로그인 실패 가능, 참여 마찰 증가 | 폐기 |
| C. 모든 응답자 Google 로그인 | 응답자 관리 쉬움 | 익명성 저하, 참여 부담 증가 | 비채택 |
| D. 정적 비밀번호 | 구현 쉬움 | JS 번들에서 우회 가능 | 보조 장치로만 사용 |

결정: 응답자는 Firebase Anonymous Auth로 자동 로그인한다. 결과 화면은 팀 공유용으로 별도 로그인 없이 조회한다. 응답 화면은 개인 식별 목적의 ID 입력을 없애고, 익명 세션과 localStorage 기반 이어하기를 사용한다.

## 3. 최종 아키텍처

```text
사용자 브라우저
  ├─ React/Vite 설문 앱
  ├─ Firebase Anonymous Auth
  └─ Firebase Realtime Database write

결과 조회 브라우저
  ├─ 결과 집계 화면
  ├─ Firebase Realtime Database read
  └─ AI 분석 생성 버튼

Firebase Cloud Functions
  ├─ 익명 집계 payload 검증
  ├─ OpenAI Responses API 호출
  └─ Firebase에 AI 분석 결과 저장

GitHub
  ├─ private repo: STR-NRM/workshop-2026-2Q-1
  └─ GitHub Pages 또는 Firebase Hosting 배포
```

## 4. 데이터 모델

기본 네임스페이스:

```text
/surveys/2026-2Q-1
```

권장 구조:

```text
/surveys/2026-2Q-1/config
  surveyVersion
  questionVersion
  active

/surveys/2026-2Q-1/respondents/{uid}
  startedAt
  lastUpdatedAt
  completed
  completedAt
  currentQuestionId
  visibleQuestionIds

/surveys/2026-2Q-1/responses/{uid}/{questionId}
  value
  type
  answeredAt

/surveys/2026-2Q-1/analysis/comprehensive
  result
  model
  reasoningEffort
  analyzedAt
  questionVersion

/surveys/2026-2Q-1/analysis/textThemes
  result
  model
  analyzedAt

/surveys/2026-2Q-1/pulse/{pulseId}
  config
  responses
  analysis

```

## 5. 핵심 기능 범위

### 5.1 응답자 기능

- 모바일 우선 랜딩 화면
- 개인 ID 입력 제거
- 익명 세션 생성
- 설문 목적, 익명성, 예상 시간 안내
- 1문항 1화면 진행
- 자동 저장
- 이어서 진행
- `scale5na` 지원: 1~5점 + 해당 없음/판단 어려움
- `singleChoice`
- `multiChoice`
- `longText`
- 역할 기반 라우팅
- 외부 협업/CBT 조건부 라우팅
- 질문 하단 도움말 표시
- 제출 전 누락 문항 확인
- 완료 화면

### 5.2 결과 기능

- 응답 수, 완료율, 평균 소요 시간
- 문항별 응답 수
- 축별 평균, 1~2점 비율, 4~5점 비율, N/A 비율
- 분산 큰 문항 Top 5
- 낮은 평균 문항 Top 5
- N/A 높은 문항 Top 5
- 객관식 선택 분포
- 서술형 원문 확인
- 서술형은 개인 식별 위험 안내와 함께 확인
- CSV/JSON export
- AI 분석 결과 조회

### 5.3 AI 분석 기능

기본 분석 방식:

1. 결과 화면에서 "AI 분석 생성/갱신" 클릭.
2. 브라우저가 개인 식별자를 제외한 집계 payload를 Firebase Cloud Function으로 전송.
3. 함수가 OpenAI Responses API 호출.
4. 모델은 `gpt-5.5`, reasoning effort는 `high`.
5. 결과를 Firebase `/analysis/comprehensive`에 저장.
6. 앱의 결과 화면에서 분석 리포트를 즉시 조회.

분석 결과 구조:

- 한 줄 요약
- 강점 3개
- 주요 병목 5개
- 분산이 큰 문항 해석
- N/A 비율이 높은 문항 해석
- 주관식 테마 요약
- 워크샵 분과별 토론 질문
- 4주 실험 후보 3~5개
- 해석 한계와 추가 확인 필요 사항

주의:

- 서술형 원문을 그대로 길게 인용하지 않는다.
- 특정 개인/직군을 문제 원인으로 단정하지 않는다.
- 낮은 점수를 리더십 실패나 특정 직군 문제로 바로 해석하지 않는다.

### 5.4 워크샵 보조 기능

추가하면 좋은 기능:

- 분과별 토론 입력 화면
- 제품별 책임 역할표 입력 화면
- 4주 실험 후보 저장
- 실험별 책임 역할/성공 기준/리뷰 날짜 저장
- 월간 펄스 모드

1차 개발에서는 설문과 결과/AI 분석을 먼저 완성한다. 분과별 입력과 월간 펄스는 같은 데이터 구조 안에 확장 가능하게 설계하고, 일정이 충분하면 1차에 포함한다.

## 6. Firebase 설정 계획

### 6.1 프로젝트

권장 프로젝트명:

```text
workshop-2026-2q-1
```

설정:

- Firebase Web App 생성
- Realtime Database 생성
- Firebase Authentication 활성화
- Anonymous provider 활성화
- 결과 read는 공개하고, 응답 write는 Anonymous Auth로 제한
- Analytics는 선택 사항. 필요 없으면 끈다.

### 6.2 보안 규칙 초안

정확한 규칙은 실제 프로젝트 UID 확인 후 작성한다.

```json
{
  "rules": {
    "surveys": {
      "2026-2Q-1": {
        "respondents": {
          ".read": true,
          "$uid": {
            ".write": "auth != null && auth.uid === $uid"
          }
        },
        "responses": {
          ".read": true,
          "$uid": {
            ".write": "auth != null && auth.uid === $uid"
          }
        },
        "analysis": {
          ".read": true,
          ".write": false
        }
      }
    }
  }
}
```

AI 분석 함수는 Firebase Admin SDK를 사용하므로 위 클라이언트 규칙과 별도로 서버 권한으로 저장한다. OpenAI 키는 Firebase Functions secret에만 저장하고 절대 commit하지 않는다.

## 7. OpenAI 설정 계획

사용 모델:

```text
gpt-5.5
```

reasoning:

```json
{ "effort": "high" }
```

운영 원칙:

- API 키는 코드, 문서, GitHub repo, Firebase DB에 저장하지 않는다.
- 로컬 `.env.local` 또는 GitHub/Firebase secret에만 둔다.
- 기본안에서는 브라우저 번들에 OpenAI 키를 포함하지 않는다.
- 분석 실행 후 비용과 토큰 사용량을 로그에 남긴다.
- 키가 이미 대화에 노출되었으므로, 최종 배포 이후에는 키 교체를 권장한다.

근거: OpenAI 공식 문서 기준 `gpt-5.5`는 Responses API를 지원하고, `reasoning.effort`는 `none`, `low`, `medium`, `high`, `xhigh`를 지원한다.

## 8. 구현 단계

### Phase 0. 준비

- GitHub repo clone 또는 새 작업 폴더 초기화
- 4Q 앱 파일 복사
- `.env.example` 갱신
- `.gitignore`에 `.env*`, service account JSON, Firebase debug 파일 확인
- `package.json` 이름 변경
- Vite base 경로 변경

### Phase 1. 설문 엔진

- 최종 source of truth를 JS 데이터로 변환
- 문항 타입 확장
- 도움말 렌더링
- 역할 라우팅 구현
- 조건부 라우팅 구현
- 진행률 계산을 "전체 문항"이 아니라 "현재 응답자에게 보이는 문항" 기준으로 변경
- N/A 응답 저장/분석 처리
- multiChoice 저장 처리

### Phase 2. Firebase/Auth

- 새 Firebase 프로젝트 생성
- Realtime Database 설정
- Auth providers 설정
- Firebase config 환경변수화
- `/surveys/2026-2Q-1` 네임스페이스 적용
- 보안 규칙 적용
- 익명 응답자 flow 구현
- 결과 화면 무로그인 조회 구현

### Phase 3. UI/UX

- 모바일 중심 UI 유지
- 랜딩 문구 전면 교체
- 진행 화면 단순화
- 버튼/선택지 터치 영역 개선
- `해당 없음/판단하기 어려움`을 눈에 잘 띄게 배치
- 서술형 입력 안내 개선
- 완료 화면에서 워크샵 활용 방식 안내

### Phase 4. 결과

- 결과 화면 개편
- 축별 집계
- 낮은 평균/높은 분산/N/A 높은 문항 표시
- 객관식 분포
- 서술형 원문 보호
- export 기능
- AI 분석 결과 조회

### Phase 5. AI 분석

- Firebase Cloud Function 작성
- OpenAI Responses API 설정
- Executive Summary로 시작하는 분석 프롬프트 작성
- 결과 저장
- 결과 화면에서 리포트 표시
- 에러/재실행 처리

### Phase 6. 워크샵 보조 기능

- 제품별 책임 역할표 입력 또는 진행자 메모 기능
- 분과별 토론 입력
- 4주 실험 후보 저장
- 월간 펄스 문항 모드

### Phase 7. 검증/배포

- `npm run lint`
- `npm run build`
- 로컬 브라우저 테스트
- 모바일 viewport 테스트
- Firebase write/read 테스트
- 결과 화면 공개 조회 테스트
- AI 분석 dry run
- GitHub Pages 배포
- 필요 시 Firebase Hosting fallback

## 9. GitHub 운영 계획

대상 repo:

```text
https://github.com/STR-NRM/workshop-2026-2Q-1
```

운영 원칙:

- personal access token은 명령 환경에만 사용하고 파일에 쓰지 않는다.
- 기본 브랜치에 바로 밀기보다 작업 브랜치를 만들고 PR을 생성한다.
- 사용자가 "알아서 머지"를 허용했으므로, 빌드/검증 성공 후 PR을 merge한다.
- GitHub Actions secret에는 필요한 경우 `VITE_FIREBASE_*` 값만 넣는다.
- OpenAI 키는 GitHub Actions secret에 넣지 않는다. AI 분석은 Firebase Functions secret을 사용하는 서버 함수에서만 실행한다.

권장 브랜치:

```text
codex/build-workshop-2026-2q-1
```

## 10. 돈이 나올 수 있는 지점

진행 전 사용자 확인이 필요한 경우:

- Firebase가 프로젝트 생성, Realtime Database, Auth 설정 중 Blaze 업그레이드를 요구하는 경우
- Firebase Cloud Functions 배포를 위해 Blaze 업그레이드가 필요한 경우
- Firebase App Hosting을 쓰기로 변경하는 경우
- 유료 도메인 또는 유료 GitHub Pages 조건이 필요한 경우
- OpenAI API 분석을 대량/반복 실행해야 하는 경우

진행 가능하다고 보는 무료 범위:

- Firebase Spark의 Realtime Database 소규모 사용
- Firebase Authentication 기본 사용
- GitHub Pages가 조직 설정상 private repo에서 허용되는 경우
- 로컬 개발 서버에서 설문/결과 UI 검증

## 11. 리스크와 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| OpenAI 키 노출 | 비용/보안 리스크 | 브라우저 호출 금지, Firebase Functions secret 사용 |
| Firebase 규칙 오류 | 응답 저장 실패 또는 결과 조회 실패 | 공개 read와 익명 write를 각각 테스트 |
| 라우팅 오류 | 문항 누락/과다 노출 | source of truth 기반 테스트 케이스 작성 |
| 문항 수 과다 | 응답 피로 | 진행률 표시, 도움말 간결화, N/A 허용 |
| private repo Pages 제한 | 배포 지연 | Firebase Hosting fallback |
| AI 분석 과잉해석 | 잘못된 워크샵 방향 | 프롬프트에 중립성/한계/개인평가 금지 명시 |

## 12. 완료 기준

개발 완료로 보려면 다음을 모두 만족해야 한다.

1. 설문 문항이 `07_final_question_bank_source_of_truth.md`와 일치한다.
2. 응답자는 모바일에서 끝까지 제출할 수 있다.
3. 새로고침 후 이어서 진행할 수 있다.
4. 역할별/조건부 라우팅이 정확하다.
5. Firebase에 4Q와 분리된 경로로 저장된다.
6. 팀원은 별도 로그인 없이 전체 결과를 볼 수 있다.
7. 결과 화면에서 평균, 분산, N/A 비율, 객관식 분포를 볼 수 있다.
8. 결과 화면 버튼 기반 AI 분석 함수가 `gpt-5.5` high reasoning으로 실행되고, Executive Summary로 시작하는 전문가 검토형 보고서를 저장한다.
9. API 키와 Firebase service account가 repo에 포함되지 않는다.
10. `npm run lint`, `npm run build`가 통과한다.
11. GitHub Pages 또는 Firebase Hosting 배포가 완료된다.

## 13. 외부 근거

- OpenAI GPT-5.5 모델 문서: https://developers.openai.com/api/docs/models/gpt-5.5
- OpenAI reasoning guide: https://developers.openai.com/api/docs/guides/reasoning
- Firebase pricing: https://firebase.google.com/pricing
