# 2026년 상반기 워크샵 설문 리서치 문서 등록부

- 최초 작성일자: 2026-05-11
- 업데이트일자: 2026-05-12
- 업데이트 내용: v1.8 구현 완료 리포트 추가. Firebase 전용 프로젝트 및 배포 준비 상태 반영.
- 작성자: Codex
- 적용 대상: 2026년 2Q-1 상반기 워크샵 설문 기획

## 1. 작성 목적

이 등록부는 `workshop-2026-2Q-1` 폴더에 작성된 리서치 및 설문 설계 문서의 구조, 목적, 사용 순서를 관리하기 위한 문서다.

이번 작업의 핵심 목적은 기존 `workshop-2025-4Q-main` 설문을 단순 복제하지 않고, 2026년 상반기 현재의 16인 AI 사업부, 15인 실무 스쿼드, 그리고 팀장/스쿼드 리드를 제외한 14인 팀원 응답 대상을 독립적으로 진단할 수 있는 조직 설문 체계를 설계하는 것이다.

## 2. 현재 폴더 구조

```text
workshop-2026-2Q-1/
  00_admin/
    01_document_register.md
    02_decision_register.md
  01_research/
    01_global_best_practices_research_report.md
    02_source_matrix.md
    03_nurimedia_context_note.md
    04_contextual_deep_research_report.md
    05_external_version_review_report.md
  02_survey_design/
    01_recommended_survey_framework.md
    02_recommended_survey_questions.md
    03_nurimedia_survey_strategy_v2.md
    04_nurimedia_survey_question_bank_v2.md
    05_analysis_and_workshop_protocol_v2.md
    06_breakout_discussion_modules_v2.md
    07_final_question_bank_source_of_truth.md
    08_monthly_pulse_followup_pool.md
  03_delivery_notes/
    01_app_migration_considerations.md
    02_execution_roadmap.md
    03_final_development_plan.md
  04_implementation/
    01_execution_todo.md
    02_implementation_completion_report.md
```

## 3. 문서 목록

| 번호 | 경로 | 문서 목적 | 사용 시점 |
|---|---|---|---|
| 01 | `00_admin/02_decision_register.md` | 최종 설문 설계 결정과 근거 기록 | 최종 컨펌/변경 논의 시 |
| 02 | `01_research/01_global_best_practices_research_report.md` | 글로벌 대표 기업 및 연구 프레임워크 기반 조직 설문 리서치 종합 | 설문 방향성 결정 전 |
| 03 | `01_research/02_source_matrix.md` | 출처별 핵심 원칙과 이번 설문 반영 방식 정리 | 근거 확인 및 설문 리뷰 시 |
| 04 | `01_research/03_nurimedia_context_note.md` | 누리미디어 AI 사업부의 회사/서비스/조직/제품/비즈니스 맥락 정리 | 맞춤 설문 전제 확인 시 |
| 05 | `01_research/04_contextual_deep_research_report.md` | 글로벌 베스트프랙티스와 DBpia AI 사업부 맥락을 결합한 딥리서치 | 설문 축 최종 결정 전 |
| 06 | `01_research/05_external_version_review_report.md` | 다른 세션 버전의 장점, 한계, 참고할 점, 비반영 권장 사항 평가 | 최종 설계 보완점 결정 시 |
| 07 | `02_survey_design/01_recommended_survey_framework.md` | 1차 설문 프레임워크 기록 | 참고/이력 확인 시 |
| 08 | `02_survey_design/02_recommended_survey_questions.md` | 1차 문항 초안 기록 | 참고/이력 확인 시 |
| 09 | `02_survey_design/03_nurimedia_survey_strategy_v2.md` | 누리미디어 AI 사업부 맞춤 설문 전략 | 설문 목적/방향 설명 시 |
| 10 | `02_survey_design/04_nurimedia_survey_question_bank_v2.md` | v2 맞춤 문항 초안 기록 | 최종 문항과 비교 시 |
| 11 | `02_survey_design/05_analysis_and_workshop_protocol_v2.md` | 설문 결과 분석 방식과 워크샵 운영 프로토콜 | 설문 수집 후 워크샵 전 |
| 12 | `02_survey_design/06_breakout_discussion_modules_v2.md` | 개인 설문 이후 분과별 토론과 그룹 입력을 운영하기 위한 모듈 | 워크샵 설계 및 구현 시 |
| 13 | `02_survey_design/07_final_question_bank_source_of_truth.md` | 최종 구현 기준 설문 문항, 도움말, 라우팅, 제외 원칙 | 앱/폼 구현 시 |
| 14 | `02_survey_design/08_monthly_pulse_followup_pool.md` | 워크샵 이후 4주 실험 추적용 월간 펄스 문항 풀 | 워크샵 이후 |
| 15 | `03_delivery_notes/01_app_migration_considerations.md` | 기존 4Q 앱을 상반기용으로 이전할 때 필요한 기술/운영 고려사항 | 구현 착수 전 |
| 16 | `03_delivery_notes/02_execution_roadmap.md` | 문항 컨펌, 구현, 사전 검증, 워크샵, 후속 펄스 실행 순서 | 일정 계획 시 |
| 17 | `03_delivery_notes/03_final_development_plan.md` | 2026 2Q-1 앱 개발 옵션 비교, 최종 아키텍처, 데이터/AI/배포 계획 | 개발 착수 전 |
| 18 | `04_implementation/01_execution_todo.md` | 실제 개발 실행 TODO, stale 산물 제거 기준, 테스트/QA 완료 기준 | 개발 중 |
| 19 | `04_implementation/02_implementation_completion_report.md` | 실제 구현, Firebase 연결, QA, 남은 외부 연동 상태 정리 | 구현 검수/배포 전 |

## 3.1 문서 우선순위

실제 구현과 운영에서는 다음 우선순위를 따른다.

1. 최종 문항 구현: `02_survey_design/07_final_question_bank_source_of_truth.md`
2. 결정 근거 확인: `00_admin/02_decision_register.md`
3. 워크샵 운영: `02_survey_design/05_analysis_and_workshop_protocol_v2.md`, `02_survey_design/06_breakout_discussion_modules_v2.md`
4. 후속 추적: `02_survey_design/08_monthly_pulse_followup_pool.md`
5. 앱 개발 기준: `03_delivery_notes/03_final_development_plan.md`
6. 구현 결과 검수: `04_implementation/02_implementation_completion_report.md`
7. 개발 실행 관리: `04_implementation/01_execution_todo.md`
8. 앱 구현 일정: `03_delivery_notes/02_execution_roadmap.md`
9. 이전 초안과 리서치: 참고/이력용

## 4. 주요 전제 및 확인 필요 사항

### 4.1 팀 규모 전제

초기 설명에서는 현재 스쿼드가 16인으로 확장되었다고 되어 있었고, 역할 합계는 15인이었다. 2026-05-12 추가 배경 기준으로는 AI 사업부 전체가 16명이고, 문치웅 팀장을 제외한 실무 스쿼드가 15명으로 해석하는 것이 가장 논리적이다.

| 역할 | 인원 |
|---|---:|
| 프롬프트엔지니어 겸 PM | 1 |
| PM | 3 |
| 스쿼드 리드 | 1 |
| 프론트엔드 | 3 |
| AI 엔지니어 | 4 |
| 백엔드 | 3 |
| 합계 | 15 |

따라서 보고서의 조직 전제는 "AI 사업부 16명, 실무 스쿼드 15명"을 기준으로 한다. 다만 최종 설문 응답 대상은 팀장과 스쿼드 리드를 제외한 실무 팀원 14명이다. 팀장과 스쿼드 리드 관점은 필요 시 사전 인터뷰, 셀프 체크, 진행자 메모로 분리한다.

### 4.1.1 2026-05-12 추가 맥락

- 회사: 누리미디어
- 주요 서비스: DBpia, KRpia, DBpia AI, KRpia AI, Citeasy
- AI 사업부 출범: 2025년 9월
- 주요 AI 제품: AI Agent, AI Viewer, AI Idea, AI Reader
- 추가 CBT 서비스: AI Editor
- 비즈니스 구조: B2B2C, 대학교 도서관 중심 매출
- 핵심 협업 접점: 개발운영/인프라, 서비스/디자인, 영업기획, 마케팅, 콘텐츠영업, 콘텐츠운영, 외주 협력사

### 4.2 기존 설문과의 관계

기존 2025 4Q 설문은 "스쿼드 체제 전환 3개월 회고"에 초점이 있었다. 이번 설문은 전환 초기 회고가 아니라 "확장된 제품 개발 조직의 운영 건강도, 역할/의사결정, 협업 흐름, 개발 경험, 신규 구성원 통합"을 진단해야 한다.

## 5. 문서 운영 규칙

1. 모든 문서는 파일명 앞에 두 자리 번호를 붙인다.
2. 문서 상단에는 최초 작성일자, 업데이트일자, 업데이트 내용을 반드시 둔다.
3. 설문 문항을 변경하면 `02_survey_design/07_final_question_bank_source_of_truth.md`와 `00_admin/02_decision_register.md`를 먼저 갱신한다.
4. 외부 출처를 새로 추가하면 `02_source_matrix.md`에 근거와 반영 방식을 추가한다.
5. 기존 4Q 앱을 복제해 구현할 경우 데이터베이스와 배포 경로는 반드시 분리한다.
6. 이전 초안 문서는 삭제하지 않고 이력으로 보존하되, 구현 기준으로 사용하지 않는다.
