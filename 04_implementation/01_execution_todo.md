# 개발 실행 TODO

- 최초 작성일자: 2026-05-12
- 업데이트일자: 2026-05-13
- 업데이트 내용: v1.5 결과 화면 무로그인 공개 조회, GitHub Pages Firebase mode, 전문가 검토형 AI 리포트 반영.
- 작성자: Codex
- 적용 대상: `workshop-2026-2Q-1` production-ready 개발

## 0. 판단 과정 요약

1. 4Q 앱을 그대로 쓰면 빠르지만, 4Q Firebase 프로젝트, 4분기 문구, 브라우저 OpenAI 호출이 남으면 실제 운영에서 실패한다.
2. 따라서 첫 번째 기준은 기능 추가가 아니라 4Q 산물 제거와 데이터/보안 경계 재설정이다.
3. Firebase/GitHub는 다른 세션과 충돌할 수 있으므로, 외부 상태 변경 전에는 현재 상태를 확인하고 이 경로의 작업물 기준으로만 변경한다.
4. UI는 모바일 설문 완주성이 핵심이므로 복잡한 데스크톱 대시보드보다 응답자 흐름, 자동 저장, 라우팅 정확성, 결과 화면의 해석 가능성을 우선한다.
5. OpenAI 분석은 브라우저에서 실행하지 않고, 결과 화면 버튼이 Firebase Cloud Function을 호출하고 함수가 OpenAI API와 Firebase Admin SDK를 사용하는 방식으로 구현한다.

## 1. 실행 TODO

### Phase 0. 기준 정리

- [x] `/goal` 생성
- [x] 4Q 레퍼런스 구조 확인
- [x] target 폴더 상태 확인
- [x] 4Q 앱 파일 복사
- [x] 4Q 전용 산출물과 브라우저 OpenAI 호출 파일 제거 시작
- [x] `rg`로 4Q stale 문자열 반복 검사
- [x] 문서 등록부에 구현 TODO 등록

### Phase 1. 설문 엔진

- [x] 최종 source of truth 기반 `src/data/questions.js` 재작성
- [x] 문항 ID 중복 검증 스크립트 작성
- [x] 역할 라우팅 구현
- [x] 외부 협업 조건부 라우팅 구현
- [x] CBT 조건부 라우팅 구현
- [x] `scale5na`, `singleChoice`, `multiChoice`, `longText` UI 구현
- [x] 필수/선택/최소 길이 검증 구현
- [x] 진행률을 현재 응답자 visible questions 기준으로 계산

### Phase 2. 데이터와 인증

- [x] Firebase config를 환경변수 기반으로 교체
- [x] Firebase 미설정 시 localStorage fallback 구현
- [x] Anonymous Auth respondent flow 구현
- [x] 결과 화면 무로그인 공개 조회 구현
- [x] `/surveys/2026-2Q-1/...` 네임스페이스 적용
- [x] Firebase RTDB rules 초안 작성

### Phase 3. 응답자 UI

- [x] 랜딩 페이지 2026 2Q-1 문맥으로 재작성
- [x] 개인 ID 입력 제거
- [x] 설문 안내/익명성/소요시간 문구 반영
- [x] 질문 도움말 표시
- [x] 저장 상태와 오류 상태 표시
- [x] 완료 페이지 재작성
- [x] 모바일 overflow/터치 영역 확인

### Phase 4. 결과와 분석

- [x] 결과 화면 재작성
- [x] 평균, 낮은 점수 비율, 높은 점수 비율, N/A 비율, 분산 계산
- [x] 축별 요약 구현
- [x] 객관식 분포 구현
- [x] 서술형 원문 결과 화면 표시
- [x] CSV/JSON export 구현
- [x] AI 분석 결과 표시 구현
- [x] 결과 화면 버튼 기반 AI 분석 생성 경로 구현
- [x] Firebase Cloud Function 분석 프록시 작성
- [x] Executive Summary로 시작하는 전문가 검토형 리포트 프롬프트 작성
- [x] 긴 AI 리포트를 읽기 쉬운 섹션/목록/표 형태로 표시

### Phase 5. 검증 루프

- [x] `npm install`
- [x] `npm run validate:survey`
- [x] `npm run test:logic`
- [x] `npm run lint`
- [x] `npm run build`
- [x] 로컬 dev server 실행
- [x] Playwright 또는 Browser로 모바일 설문 완주 테스트
- [x] 결과 화면 테스트
- [x] stale 문자열/secret 패턴 검사
- [x] 발견 이슈 수정 후 테스트 반복

### Phase 6. 외부 연동

- [x] Firebase CLI 또는 console 상태 확인
- [x] Firebase 프로젝트/RTDB/Auth 설정 가능 여부 확인
- [x] 전용 Firebase 프로젝트 생성: `workshop-2026-2q-1`
- [x] 전용 RTDB 생성: `workshop-2026-2q-1-default-rtdb`
- [x] Anonymous Auth 활성화
- [x] RTDB rules 배포
- [x] GitHub Pages workflow에 Firebase 빌드 환경값 반영
- [x] 현재 private repo plan의 Pages 미지원 상태 확인
- [x] 유료 전환 요구 시 중단 후 사용자 확인
- [x] GitHub 인증 상태 확인
- [x] 로컬 작업 브랜치 생성
- [x] GitHub push 진행

## 3. 현재 외부 연동 상태

- Firebase CLI: `npx firebase-tools` 사용 가능.
- Firebase CLI 로그인: 완료.
- Firebase project: `workshop-2026-2q-1` 생성 완료.
- Firebase RTDB: `asia-southeast1` 리전의 `workshop-2026-2q-1-default-rtdb` 생성 완료.
- Firebase Auth: Anonymous provider 활성화 완료.
- Firebase rules: `firebase/database.rules.json` 배포 완료.
- Firebase local config: `.env.local`에만 저장했고 git에는 포함하지 않음.
- GitHub Pages build: workflow에 공개 가능한 Firebase web config를 넣어 Pages 배포본이 `Firebase mode`로 빌드되도록 수정.
- GitHub Pages enablement: API 활성화 시도 결과 현재 private repo plan에서 Pages 미지원. 자동 push 트리거는 실패를 반복하지 않도록 제거하고 수동 실행으로 제한.
- GitHub CLI: 로그인 완료. `repo`, `workflow` 권한 확인.
- GitHub push/merge: `main`과 `codex/build-workshop-2026-2q-1`에 push 완료. 원격 기본 브랜치는 `main`.
- Firebase Functions deploy: 프로젝트가 Blaze 플랜이 아니어서 Cloud Build API 활성화가 막혔고, 사용자 승인 없는 유료 전환은 진행하지 않음.
- 로컬 QA: `VITE_USE_LOCAL_STORE=true`로 설문 완주와 결과 화면 확인 완료.
- Firebase QA: Node SDK 익명 로그인 성공, Chrome에서 실제 Firebase mode 설문 시작 및 RTDB respondent write 확인 후 테스트 respondent 삭제 완료.
- Browser plugin QA 참고: Codex 인앱 브라우저에서는 Firebase Auth 네트워크 오류가 발생했으나, 동일 설정이 Node SDK와 사용자의 Chrome에서는 정상 동작했다.

## 2. 완료 기준

- 4Q Firebase 키, 4Q 문구, 4Q 프롬프트, 브라우저 OpenAI 호출이 app code에 남아 있지 않다.
- 결과 화면 버튼 외의 별도 AI 분석 실행 경로가 사용자 플로우와 문서에 남아 있지 않다.
- 설문 문항과 라우팅이 `07_final_question_bank_source_of_truth.md`와 일치한다.
- Firebase 없이도 localStorage fallback으로 로컬 QA가 가능하다.
- Firebase 설정 후에는 모든 팀원이 별도 설정 없이 응답하고 결과를 볼 수 있다.
- API key와 Firebase service account가 repo에 포함되지 않는다.
- lint/build/logic/browser QA를 통과한다.
