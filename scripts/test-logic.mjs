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
      CHOICE01: { value: '요구사항 명확성' },
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
  assert.match(body.input, /편지/);
  assert.match(body.input, /직무별로 건네는 말/);
  assert.match(body.input, /한 장으로 읽는 현재 이야기/);
  assert.doesNotMatch(body.input, /Executive Summary 이후 모든 큰 섹션은 반드시 첫 부분에/);
  return {
    ok: true,
    json: async () => ({ output_text: '# Executive Summary\n**한 문장 결론:** "편지 샘플입니다."' }),
  };
};

const letterAnalysis = await requestWorkshopAnalysis({ apiKey: 'sk-test', payload: aiPayload, analysisType: 'letter' });
assert.equal(letterAnalysis.title, '편지');
assert.equal(letterAnalysis.analysisType, 'letter');
globalThis.fetch = originalFetch;

console.log('Logic tests OK');
