import assert from 'node:assert/strict';
import {
  getVisibleQuestions,
  hasCbtModule,
  hasExternalModule,
  isAnswered,
  questions,
} from '../src/data/questions.js';
import {
  buildDashboardStats,
  getChoiceStats,
  getScaleStats,
} from '../src/utils/analytics.js';

assert.equal(hasExternalModule({ META_EXTERNAL: ['특별히 없음'] }), false);
assert.equal(hasExternalModule({ META_EXTERNAL: ['응답하지 않음'] }), false);
assert.equal(hasExternalModule({ META_EXTERNAL: ['서비스/디자인'] }), true);
assert.equal(hasCbtModule({ META_CBT: '예' }), true);
assert.equal(hasCbtModule({ META_CBT: '아니오' }), false);

const visible = getVisibleQuestions({
  META_ROLE: '웹 엔지니어링(FE/BE)',
  META_EXTERNAL: ['서비스/디자인'],
  META_CBT: '예',
});
assert.ok(visible.some((question) => question.id === 'WEB01'));
assert.ok(visible.some((question) => question.id === 'EXT01'));
assert.ok(visible.some((question) => question.id === 'CBT01'));
assert.ok(!visible.some((question) => question.id === 'PM01'));

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

console.log('Logic tests OK');
