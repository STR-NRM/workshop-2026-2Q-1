# 최종 개발 계획서

- 최초 작성일자: 2026-05-13
- 업데이트일자: 2026-05-13
- 업데이트 내용: GitHub Pages 정적 배포, Firebase Realtime Database 저장, 런타임 OpenAI key 기반 AI 분석과 3종 리포트 구조로 최종 구조 재정리.
- 작성자: Codex

## 1. 판단 과정 요약

1. 지난해 4Q 레퍼런스를 다시 확인했다. 레퍼런스는 GitHub Pages 정적 배포와 브라우저 OpenAI 직접 호출을 사용해 Functions 없이 간단하게 분석을 실행했다.
2. 같은 방식을 그대로 쓰면 `VITE_OPENAI_API_KEY`가 빌드 산출물에 포함된다. repo가 public이고 Pages로 배포되면 브라우저에서 key가 노출될 수 있다.
3. Firebase Functions 프록시는 key 보호에는 맞지만 Spark 플랜에서 배포가 막힐 수 있고, 이번 요구의 핵심인 "복잡하지 않은 Pages 운영"과 맞지 않았다.
4. 따라서 최종 구조는 정적 앱 + Firebase RTDB + 런타임 OpenAI key 입력 방식으로 정했다. 응답자는 추가 설정 없이 설문을 제출하고, 진행자만 결과 화면에서 key를 입력해 필요한 AI 리포트를 생성한다.
5. AI 분석 결과는 종합, 비주관식, 주관식 문항별 리포트로 나누어 Firebase에 저장한다. key 자체는 소스, GitHub secret, Firebase 어디에도 저장하지 않는다.

## 2. 최종 구조

| 영역 | 최종 선택 | 이유 |
|---|---|---|
| 프론트엔드 | React 19 + Vite | 기존 레퍼런스와 가장 유사하고 GitHub Pages에 적합 |
| 배포 | GitHub Pages | 사용자 요청 기준. 정적 앱으로 운영 가능 |
| 데이터 저장 | Firebase Realtime Database | 설문 응답 수집에 충분하고 모바일/브라우저 접근이 단순 |
| 인증 | Firebase Anonymous Auth | 응답 저장 권한을 사용자 세션 단위로 제한 |
| 결과 조회 | 공개 조회 | 팀 워크샵 목적상 로그인 제거 요구 반영 |
| AI 분석 | 결과 페이지의 3개 AI 리포트 탭에서 OpenAI Responses API 직접 호출 | Functions/Blaze 없이 리포트별 분석 가능 |
| OpenAI key | 진행자 런타임 입력 | 번들/저장소/Firebase 노출 방지 |

## 3. 운영 흐름

1. 팀원이 GitHub Pages URL에 접속한다.
2. 앱이 Anonymous Auth 세션을 만들고 `/surveys/2026-2Q-1/respondents/{uid}`와 `/responses/{uid}`에 저장한다.
3. 결과 페이지는 Firebase에서 응답, 세션, 기존 AI 분석 결과를 읽는다.
4. 진행자가 결과 페이지의 `AI 종합`, `AI 비주관식`, `AI 주관식` 탭 중 필요한 화면에서 OpenAI API key를 입력하고 해당 리포트 생성 버튼을 누른다.
5. 브라우저가 해당 리포트에 필요한 익명 집계 payload를 OpenAI Responses API로 보내고, 받은 보고서를 `/surveys/2026-2Q-1/analysis/comprehensive/reports/...` 구조로 저장한다.
6. 이후 팀원은 같은 결과 페이지의 리포트별 탭에서 저장된 AI 리포트를 조회한다.

## 4. 보안과 한계

| 항목 | 판단 |
|---|---|
| Firebase web config | 클라이언트 앱에서 필요한 공개 설정값이다. Realtime Database rules로 쓰기 범위를 제한한다. |
| OpenAI key | 런타임 입력값이라 저장소와 배포 번들에는 포함되지 않는다. 단, 입력한 브라우저의 네트워크 요청에는 사용된다. |
| AI 분석 쓰기 권한 | Anonymous Auth가 있는 사용자만 저장 가능하다. 결과 페이지 접근자가 분석을 갱신할 수 있으므로 운영 중 갱신자는 내부적으로 정한다. |
| 결과 공개 | 로그인 제거 요구에 따라 공개 조회한다. 외부 공유가 우려되면 Pages URL 공유 범위를 통제해야 한다. |
| Functions 미사용 | Blaze 전환과 서버 운영 복잡도를 피한다. 대신 서버 측 key 은닉은 포기하고 런타임 입력으로 노출 범위를 줄인다. |

## 5. 검증 기준

- `npm run validate:survey`
- `npm run test:logic`
- `npm run lint`
- `npm run build`
- Firebase rules deploy
- 로컬 브라우저에서 설문 제출, 결과 조회, 저장된 응답 확인
- 결과 페이지에서 key 미입력 시 명확한 오류 표시
- OpenAI key가 source, `.env.example`, 빌드 워크플로, Git history diff에 포함되지 않는지 확인

## 6. 배포 전 체크

1. GitHub repo를 public으로 전환한다.
2. Pages를 GitHub Actions 배포로 활성화한다.
3. Actions secret `VITE_FIREBASE_API_KEY`가 유지되는지 확인한다.
4. Actions에서 Pages workflow를 실행한다.
5. 모바일에서 설문 저장이 Firebase에 들어오는지 확인한다.
6. 결과 페이지에서 응답 수와 완료 수가 맞는지 확인한다.
7. 워크샵 진행자가 종합, 비주관식, 주관식 문항별 AI 리포트를 각각 생성하고 결과가 Firebase에 저장되는지 확인한다.
