import assert from 'node:assert/strict';
import {
  QUESTION_VERSION,
  answerableQuestions,
  getVisibleQuestions,
  hasCbtModule,
  hasAnyExternalOption,
  hasExternalModule,
  isAnswerableQuestion,
  isAnswered,
  questions,
} from '../src/data/questions.js';
import {
  buildDashboardStats,
  filterCurrentSurveyData,
  getChoiceStats,
  getScaleStats,
  normalizeResponseValue,
} from '../src/utils/analytics.js';
import { requestWorkshopAnalysis } from '../src/utils/openaiAnalysis.js';

assert.equal(hasExternalModule({ META_EXTERNAL: ['특별히 없음'] }), false);
assert.equal(hasExternalModule({ META_EXTERNAL: ['서비스/디자인'] }), true);
assert.equal(hasAnyExternalOption({ META_EXTERNAL: ['서비스/디자인'] }, ['서비스/디자인']), true);
assert.equal(hasAnyExternalOption({ META_EXTERNAL: ['서비스/디자인'] }, ['개발운영/인프라']), false);
assert.equal(hasCbtModule({ META_CBT: '예' }), true);
assert.equal(hasCbtModule({ META_CBT: '아니오' }), false);
assert.equal(questions.some((question) => question.options?.includes('응답하지 않음')), false);
assert.equal(questions[0].type, 'sectionIntro');
assert.equal(isAnswered(questions[0], undefined), true);
assert.equal(answerableQuestions.some((question) => question.type === 'sectionIntro'), false);
assert.ok(getVisibleQuestions({}).filter((question) => question.type === 'sectionIntro').length >= 6);
assert.ok(getVisibleQuestions({}).filter(isAnswerableQuestion).some((question) => question.id === 'NPS01'));
assert.equal(questions.find((question) => question.id === 'META_WORKSTREAM').maxSelections, undefined);
assert.equal(questions.find((question) => question.id === 'A01').allowNA, undefined);
assert.equal(questions.find((question) => question.id === 'B01').allowNA, true);
assert.equal(normalizeResponseValue('CHOICE02', '의사결정자와 결정 방식 정리'), '최종 결정하는 사람과 결정 방식 정리');
assert.deepEqual(
  normalizeResponseValue('META_WORKSTREAM', ['AI Agent', '공통 검색/AI 플랫폼/인프라성 작업']),
  ['AI Agent', '공통 검색, AI 기반 작업, 인프라 관련 작업'],
);

const visible = getVisibleQuestions({
  META_ROLE: '웹 개발(프론트/백엔드)',
  META_EXTERNAL: ['서비스/디자인'],
  META_CBT: '예',
});
assert.ok(visible.some((question) => question.id === 'WEB01'));
assert.ok(visible.some((question) => question.id === 'EXT01'));
assert.ok(visible.some((question) => question.id === 'CBT01'));
assert.ok(visible.some((question) => question.id === 'E02'));
assert.ok(visible.some((question) => question.id === 'E03'));
assert.ok(visible.some((question) => question.id === 'E04'));
assert.ok(visible.some((question) => question.id === 'G01'));
assert.ok(!visible.some((question) => question.id === 'PM01'));
assert.ok(!visible.some((question) => question.id === 'AI01'));
assert.ok(!visible.some((question) => question.id === 'E05'));

const pmVisible = getVisibleQuestions({ META_ROLE: '제품/PM/프롬프트' });
assert.ok(pmVisible.some((question) => question.id === 'E01'));
assert.ok(pmVisible.some((question) => question.id === 'G04'));
assert.ok(!pmVisible.some((question) => question.id === 'G01'));

const otherVisible = getVisibleQuestions({ CHOICE06: '기타' });
assert.ok(otherVisible.some((question) => question.id === 'CHOICE06_OTHER'));
const notOtherVisible = getVisibleQuestions({ CHOICE06: '개발/운영' });
assert.ok(!notOtherVisible.some((question) => question.id === 'CHOICE06_OTHER'));
const bottleneckOtherVisible = getVisibleQuestions({ CHOICE01: '기타' });
assert.ok(bottleneckOtherVisible.some((question) => question.id === 'CHOICE01_OTHER'));
const bottleneckNotOtherVisible = getVisibleQuestions({ CHOICE01: '결정 속도와 권한' });
assert.ok(!bottleneckNotOtherVisible.some((question) => question.id === 'CHOICE01_OTHER'));

const textQuestion = questions.find((question) => question.id === 'TEXT01');
assert.equal(isAnswered(textQuestion, '짧음'), false);
assert.equal(isAnswered(textQuestion, '충분히 구체적인 응답입니다'), true);
const choiceQuestion = questions.find((question) => question.id === 'META_WORKSTREAM');
assert.equal(isAnswered(choiceQuestion, []), false);
assert.equal(isAnswered(choiceQuestion, ['AI Agent']), true);

const scale = getScaleStats([1, 2, 4, 5, 'NA']);
assert.equal(scale.numericCount, 4);
assert.equal(scale.naCount, 1);
assert.equal(scale.average, 3);
assert.equal(scale.lowCount, 2);
assert.equal(scale.highCount, 2);

const choices = getChoiceStats([['AI Agent', 'AI Viewer'], ['AI Agent'], 'AI Editor']);
assert.equal(choices['AI Agent'], 2);
assert.equal(choices['AI Viewer'], 1);
assert.equal(choices['AI Editor'], 1);

const currentOnly = filterCurrentSurveyData(
  {
    currentUser: { A01: { value: 4, questionVersion: QUESTION_VERSION } },
    oldUser: { A01: { value: 1, questionVersion: '2026-05-13-v1.3' } },
  },
  {
    currentUser: { completed: true, questionVersion: QUESTION_VERSION },
    oldUser: { completed: true, questionVersion: '2026-05-13-v1.3' },
  },
);
assert.deepEqual(Object.keys(currentOnly.responses), ['currentUser']);
assert.deepEqual(Object.keys(currentOnly.respondents), ['currentUser']);

const dashboard = buildDashboardStats(
  {
    user1: {
      A01: { value: 5 },
      A02: { value: 2 },
      META_ROLE: { value: 'AI 엔지니어링' },
      CHOICE01: { value: '기타' },
      CHOICE01_OTHER: { value: '선택지로는 설명하기 어려운 데이터 확인 흐름이 막힙니다.' },
      TEXT01: { value: '유지할 운영 방식 예시입니다.' },
    },
    user2: {
      A01: { value: 3 },
      A02: { value: 'NA' },
      META_ROLE: { value: '웹 엔지니어링(FE/BE)' },
      CHOICE01: { value: '의사결정 속도와 권한' },
      TEXT01: { value: '다른 유지 사례입니다.' },
    },
  },
  {
    user1: { completed: true },
    user2: { completed: false },
  },
);

assert.equal(dashboard.respondentCount, 2);
assert.equal(dashboard.completedCount, 1);
assert.ok(dashboard.questionStats.find((stat) => stat.question.id === 'A01').scale.average === 4);
assert.equal(dashboard.questionStats.find((stat) => stat.question.id === 'CHOICE01').choice['결정 속도와 권한'], 1);
assert.equal(dashboard.questionStats.find((stat) => stat.question.id === 'CHOICE01').choice['기타'], 1);
assert.ok(dashboard.questionStats.find((stat) => stat.question.id === 'CHOICE01_OTHER').textValues[0].includes('데이터 확인 흐름'));

const aiPayload = {
  survey: { id: '2026-2Q-1', questionVersion: 'test' },
  sample: { respondentCount: 1, completedCount: 1 },
  questionStats: [],
};

await assert.rejects(
  () => requestWorkshopAnalysis({ apiKey: '', payload: aiPayload }),
  /리포트 생성용 키/,
);

const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  assert.equal(url, 'https://api.openai.com/v1/responses');
  assert.match(options.headers.Authorization, /^Bearer sk-test$/);
  const body = JSON.parse(options.body);
  assert.equal(body.model, 'gpt-5.5');
  assert.equal(body.reasoning.effort, 'high');
  assert.match(body.input, /# Executive Summary/);
  assert.match(body.input, /한 문장 결론/);
  assert.match(body.input, /그래서 무엇을 해야 하나/);
  assert.match(body.input, /한문장 정리/);
  assert.match(body.input, /한문장 제안/);
  assert.match(body.input, /10단어 이내/);
  assert.match(body.input, /종합 리포트/);
  assert.match(body.input, /수치표를 반복하기보다 의미와 제안을 중심/);
  return {
    ok: true,
    json: async () => ({ output_text: '# Executive Summary\n- 테스트 리포트' }),
  };
};

const analysis = await requestWorkshopAnalysis({ apiKey: 'sk-test', payload: aiPayload });
assert.equal(analysis.result, '# Executive Summary\n- 테스트 리포트');
assert.equal(analysis.title, '종합 리포트');
assert.equal(analysis.analysisType, 'comprehensive');
assert.equal(analysis.inputSummary.surveyId, '2026-2Q-1');
assert.equal(analysis.generatedBy.mode, 'browser');

globalThis.fetch = async (url, options) => {
  assert.equal(url, 'https://api.openai.com/v1/responses');
  const body = JSON.parse(options.body);
  assert.match(body.input, /한 장의 편지/);
  assert.match(body.input, /스쿼드 여러분께/);
  assert.match(body.input, /650~900자/);
  assert.match(body.input, /따뜻하고 배려 깊고 정중한 상담자/);
  assert.match(body.input, /이 글은 분석 리포트가 아니라/);
  assert.match(body.input, /비유는 쓰면 좋습니다/);
  assert.match(body.input, /숫자, 응답 수, 평균, 확신 수준, 문항 ID/);
  assert.match(body.input, /마음의 흐름이 우선/);
  assert.match(body.input, /오직 편지만 담습니다/);
  assert.doesNotMatch(body.input, /외부 전문가들이 함께 검토한 수준의 보고서/);
  assert.doesNotMatch(body.input, /응답 수가 적으면 응답자 수의 한계/);
  assert.doesNotMatch(body.input, /확신 수준은 높음\/중간\/낮음/);
  assert.doesNotMatch(body.input, /~하느라 마음이 많이 쓰였을 것 같습니다/);
  assert.match(body.input, /바로 "# 한 장의 편지"로 시작/);
  assert.doesNotMatch(body.input, /직무별 메시지는 반드시 blockquote/);
  assert.doesNotMatch(body.input, /PM\/제품 담당 분들께/);
  assert.doesNotMatch(body.input, /반드시 "# Executive Summary"로 시작하세요/);
  return {
    ok: true,
    json: async () => ({ output_text: '# Executive Summary\n**한 문장 결론:** "편지 샘플입니다."\n편지 본문입니다.' }),
  };
};

const letterAnalysis = await requestWorkshopAnalysis({ apiKey: 'sk-test', payload: aiPayload, analysisType: 'letter' });
assert.equal(letterAnalysis.result, '# 한 장의 편지\n\n편지 본문입니다.');
assert.equal(letterAnalysis.title, '한 장의 편지');
assert.equal(letterAnalysis.analysisType, 'letter');

globalThis.fetch = async (url, options) => {
  assert.equal(url, 'https://api.openai.com/v1/responses');
  const body = JSON.parse(options.body);
  assert.match(body.input, /직무별 메시지/);
  assert.match(body.input, /PM\/제품 담당 분들께/);
  assert.match(body.input, /프롬프트 엔지니어 분들께/);
  assert.match(body.input, /AI 엔지니어링 분들께/);
  assert.match(body.input, /프론트엔드 분들께/);
  assert.match(body.input, /백엔드 분들께/);
  assert.match(body.input, /blockquot/i);
  assert.match(body.input, /고정 문구처럼 반복하지 마세요/);
  assert.match(body.input, /역할별 상황에 맞게 자연스럽게 변주/);
  assert.match(body.input, /응답 수, 평균, 확신 수준, 표본/);
  assert.match(body.input, /데이터 묶음을 설명하는 말도 쓰지 마세요/);
  assert.match(body.input, /직무별 분석표가 아니라/);
  assert.doesNotMatch(body.input, /제품\/PM\/프롬프트 응답에서 보이는 흐름/);
  assert.doesNotMatch(body.input, /응답 수가 적으면 응답자 수의 한계/);
  assert.doesNotMatch(body.input, /확신 수준은 높음\/중간\/낮음/);
  assert.doesNotMatch(body.input, /첫 두 문장은 반드시 응답 기반 공감/);
  assert.doesNotMatch(body.input, /한 장의 편지만 담습니다/);
  assert.doesNotMatch(body.input, /반드시 "# Executive Summary"로 시작하세요/);
  return {
    ok: true,
    json: async () => ({ output_text: '# Executive Summary\n**한 문장 결론:** "직무별 메시지 샘플입니다."\n> **PM/제품 담당 분들께:** 메시지입니다.' }),
  };
};

const roleMessagesAnalysis = await requestWorkshopAnalysis({ apiKey: 'sk-test', payload: aiPayload, analysisType: 'roleMessages' });
assert.equal(roleMessagesAnalysis.result, '# 직무별 메시지\n\n> **PM/제품 담당 분들께:** 메시지입니다.');
assert.equal(roleMessagesAnalysis.title, '직무별 메시지');
assert.equal(roleMessagesAnalysis.analysisType, 'roleMessages');
globalThis.fetch = originalFetch;

console.log('Logic tests OK');
