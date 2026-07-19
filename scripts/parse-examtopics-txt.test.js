import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseExamTopicsTxt } from './parse-examtopics-txt.js';

const fixture = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '__fixtures__', 'examtopics-sample.txt'),
  'utf8'
);

test('parses question numbers and counts', () => {
  const qs = parseExamTopicsTxt(fixture);
  assert.equal(qs.length, 2);
  assert.equal(qs[0].number, 1);
  assert.equal(qs[1].number, 2);
});

test('parses options with letter + text', () => {
  const [q1] = parseExamTopicsTxt(fixture);
  assert.equal(q1.options.length, 4);
  assert.deepEqual(q1.options[0], { letter: 'A', text: 'Use CloudFront.' });
  assert.deepEqual(q1.options[3], { letter: 'D', text: 'Disable caching.' });
});

test('splits scenario and prompt at the question sentence', () => {
  const [q1] = parseExamTopicsTxt(fixture);
  assert.equal(q1.prompt, 'Which solution will meet these requirements?');
  assert.match(q1.scenario, /lower latency/);
});

test('detects multi-select from Choose two', () => {
  const [q1, q2] = parseExamTopicsTxt(fixture);
  assert.equal(q1.isMultiSelect, false);
  assert.equal(q2.isMultiSelect, true);
});

test('no answers in dump: needsManualAnswer, empty correctAnswers', () => {
  const [q1] = parseExamTopicsTxt(fixture);
  assert.deepEqual(q1.correctAnswers, []);
  assert.equal(q1.needsManualAnswer, true);
  assert.equal(q1.explanation, null);
});