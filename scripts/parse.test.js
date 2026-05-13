import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseQuestions } from './parse.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sample = readFileSync(join(__dirname, '__fixtures__/sample.txt'), 'utf8');

test('parses all five sample questions', () => {
  const qs = parseQuestions(sample);
  assert.equal(qs.length, 5);
});

test('Q1: single-answer with 4 options and explanation', () => {
  const q = parseQuestions(sample)[0];
  assert.equal(q.number, 1);
  assert.equal(q.options.length, 4);
  assert.deepEqual(q.correctAnswers, ['C']);
  assert.equal(q.isMultiSelect, false);
  assert.match(q.explanation, /explanation text/);
  assert.deepEqual(q.references, ['https://docs.aws.amazon.com/example']);
});

test('Q1: multi-line option text is joined', () => {
  const q = parseQuestions(sample)[0];
  assert.match(q.options[1].text, /wraps to a second line/);
});

test('Q2: multi-select (Choose two.) with 5 options', () => {
  const q = parseQuestions(sample)[1];
  assert.equal(q.isMultiSelect, true);
  assert.deepEqual(q.correctAnswers, ['B', 'D']);
  assert.equal(q.options.length, 5);
});

test('Q3: missing answer flagged needsManualAnswer', () => {
  const q = parseQuestions(sample)[2];
  assert.deepEqual(q.correctAnswers, []);
  assert.equal(q.needsManualAnswer, true);
});

test('Q4: page footer stripped, form-feed prefix tolerated', () => {
  const q = parseQuestions(sample)[3];
  assert.equal(q.number, 4);
  assert.doesNotMatch(q.scenario, /passleader/i);
  assert.doesNotMatch(q.scenario, /Get Latest/i);
  assert.deepEqual(q.correctAnswers, ['A']);
});

test('Q5: 5-option question', () => {
  const q = parseQuestions(sample)[4];
  assert.equal(q.options.length, 5);
  assert.equal(q.options[4].letter, 'E');
  assert.deepEqual(q.correctAnswers, ['E']);
});

test('every question has scenario and prompt populated', () => {
  for (const q of parseQuestions(sample)) {
    assert.ok(q.scenario && q.scenario.length > 0, `Q${q.number} missing scenario`);
    assert.ok(q.prompt && q.prompt.length > 0, `Q${q.number} missing prompt`);
  }
});
