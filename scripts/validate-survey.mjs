import {
  getVisibleQuestions,
  questions,
  roleOptions,
} from '../src/data/questions.js';

const errors = [];
const warnings = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

const ids = new Set();
questions.forEach((question) => {
  assert(question.id, 'Question without id');
  assert(!ids.has(question.id), `Duplicate question id: ${question.id}`);
  ids.add(question.id);
  assert(question.type, `${question.id} has no type`);
  assert(question.section, `${question.id} has no section`);
  assert(question.question, `${question.id} has no question text`);
  assert(question.helpText || question.id.startsWith('TEXT'), `${question.id} has no helpText`);

  if (['singleChoice', 'multiChoice'].includes(question.type)) {
    assert(Array.isArray(question.options) && question.options.length >= 2, `${question.id} has invalid options`);
  }
  if (question.role) {
    assert(roleOptions.includes(question.role), `${question.id} has invalid role condition: ${question.role}`);
  }
});

const base = getVisibleQuestions({}).map((question) => question.id);
const pm = getVisibleQuestions({ META_ROLE: '제품/PM/프롬프트' }).map((question) => question.id);
const ai = getVisibleQuestions({ META_ROLE: 'AI 엔지니어링' }).map((question) => question.id);
const web = getVisibleQuestions({ META_ROLE: '웹 개발(프론트/백엔드)' }).map((question) => question.id);
const external = getVisibleQuestions({
  META_ROLE: 'AI 엔지니어링',
  META_EXTERNAL: ['개발운영/인프라'],
}).map((question) => question.id);
const cbt = getVisibleQuestions({
  META_ROLE: 'AI 엔지니어링',
  META_CBT: '예',
}).map((question) => question.id);

assert(base.includes('META_ROLE'), 'Base visible questions must include META_ROLE');
assert(!base.includes('PM01'), 'Role questions must not be visible before role selection');
assert(pm.includes('PM01') && !pm.includes('AI01') && !pm.includes('WEB01'), 'PM routing failed');
assert(ai.includes('AI01') && !ai.includes('PM01') && !ai.includes('WEB01'), 'AI routing failed');
assert(web.includes('WEB01') && !web.includes('PM01') && !web.includes('AI01'), 'WEB routing failed');
assert(external.includes('EXT01'), 'External routing failed');
assert(cbt.includes('CBT01'), 'CBT routing failed');

if (questions.length !== 81) {
  warnings.push(`Expected 81 total questions from current source-of-truth implementation, got ${questions.length}`);
}

console.log('Survey validation summary');
console.log(`- total questions: ${questions.length}`);
console.log(`- base visible before routing: ${base.length}`);
console.log(`- PM visible: ${pm.length}`);
console.log(`- AI visible: ${ai.length}`);
console.log(`- WEB visible: ${web.length}`);
console.log(`- AI + external visible: ${external.length}`);
console.log(`- AI + CBT visible: ${cbt.length}`);

if (warnings.length) {
  console.log('\nWarnings');
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (errors.length) {
  console.error('\nValidation errors');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('\nOK');
