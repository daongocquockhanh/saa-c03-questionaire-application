// scripts/build-exam-tests.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeAnswers, chunkTests } from './build-exam-tests.js';

const questions = [
  { id: 1, number: 1, prompt: 'Q1?', options: [{ letter: 'A', text: 'a' }, { letter: 'B', text: 'b' }], correctAnswers: [], isMultiSelect: false, explanation: null, needsManualAnswer: true },
  { id: 2, number: 2, prompt: 'Q2?', options: [{ letter: 'A', text: 'a' }, { letter: 'B', text: 'b' }], correctAnswers: [], isMultiSelect: true, explanation: null, needsManualAnswer: true },
];
const answers = {
  '1': { answers: ['B'], rationale: 'Because B.' },
  '2': { answers: ['A', 'B'], rationale: 'Both.' },
};

test('mergeAnswers sets correctAnswers, explanation, aiAnswered', () => {
  const merged = mergeAnswers(questions, answers);
  assert.deepEqual(merged[0].correctAnswers, ['B']);
  assert.equal(merged[0].explanation, 'Because B.');
  assert.equal(merged[0].aiAnswered, true);
  assert.equal(merged[0].needsManualAnswer, undefined);
  assert.deepEqual(merged[1].correctAnswers, ['A', 'B']);
});

test('mergeAnswers throws on missing answer', () => {
  assert.throws(() => mergeAnswers(questions, { '1': answers['1'] }), /no answer for question 2/i);
});

test('chunkTests splits all ids exactly once, near-evenly', () => {
  const ids = Array.from({ length: 97 }, (_, i) => i + 1);
  const tests = chunkTests(ids, 2, 'aip-c01');
  assert.equal(tests.length, 2);
  assert.equal(tests[0].questionIds.length, 49);
  assert.equal(tests[1].questionIds.length, 48);
  const all = tests.flatMap(t => t.questionIds).sort((a, b) => a - b);
  assert.deepEqual(all, ids);
  assert.equal(tests[0].title, 'Practice Test 1');
});

test('chunkTests is deterministic per seed', () => {
  const ids = [1, 2, 3, 4, 5, 6];
  assert.deepEqual(chunkTests(ids, 2, 's'), chunkTests(ids, 2, 's'));
  assert.notDeepEqual(chunkTests(ids, 2, 's')[0].questionIds, chunkTests(ids, 2, 'other')[0].questionIds);
});
