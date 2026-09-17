import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseExamTopicsTxt, parseExamTopicsDir } from './parse-examtopics-txt.js';

const fixturePath = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__', 'examtopics-sample.txt');
const fixture = readFileSync(fixturePath, 'utf8');

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

test('parseExamTopicsDir ignores -ans decoy files and parses the rest', () => {
  const dir = mkdtempSync(join(tmpdir(), 'et-'));
  writeFileSync(join(dir, '1-2.txt'), fixture);
  writeFileSync(join(dir, '1-2-ans.txt'), 'this is not a question dump, just junk\nQuestion #99\n garbage');

  const questions = parseExamTopicsDir(dir);

  assert.equal(questions.length, 2);
  assert.deepEqual(questions.map(q => q.number), [1, 2]);
});

test('parseExamTopicsDir throws on duplicate question numbers, naming them', () => {
  const dir = mkdtempSync(join(tmpdir(), 'et-'));
  writeFileSync(join(dir, '1-2.txt'), fixture);
  writeFileSync(
    join(dir, '3-4.txt'),
    [
      'Question #1',
      '',
      'A different company runs a duplicate scenario.',
      'Which duplicate solution will meet these requirements?',
      '',
      ' A.',
      '',
      ' Use a duplicate service.',
      '',
      ' B.',
      '',
      ' Use another duplicate service.',
      '',
    ].join('\n')
  );

  assert.throws(() => parseExamTopicsDir(dir), /Duplicate question numbers:.*1/);
});

// --- Condensed dump format (98-117, 128-136): "QUESTION N" headings, ---
// hard-wrapped scenarios, hanging-indent options, paywall noise lines.

const condensedPath = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__', 'examtopics-condensed-sample.txt');
const condensed = readFileSync(condensedPath, 'utf8');

test('parses "QUESTION N" headings from the condensed format', () => {
  const qs = parseExamTopicsTxt(condensed);
  assert.equal(qs.length, 5);
  assert.deepEqual(qs.map(q => q.number), [98, 99, 100, 101, 102]);
});

test('joins hanging-indent option continuation lines into one option', () => {
  const [q98] = parseExamTopicsTxt(condensed);
  assert.equal(q98.options.length, 4);
  assert.equal(
    q98.options[0].text,
    'Lambda functions send inquiries to multiple Bedrock configurations, store responses in S3, and use QuickSight for visualization.'
  );
});

test('strips Post ID, separator, and paywall answer-hint lines', () => {
  const [q98] = parseExamTopicsTxt(condensed);
  const all = q98.scenario + ' ' + q98.prompt + ' ' + q98.options.map(o => o.text).join(' ');
  assert.doesNotMatch(all, /Post ID/);
  assert.doesNotMatch(all, /Most upvoted/);
  assert.doesNotMatch(all, /^---$/m);
  assert.doesNotMatch(all, /ExamTopics Discussion Pages/);
});

test('unwraps hard-wrapped scenario lines into flowing text', () => {
  const [q98] = parseExamTopicsTxt(condensed);
  assert.doesNotMatch(q98.scenario, /\n/);
  assert.match(q98.scenario, /Amazon Bedrock to generate personalized responses\./);
});

test('falls back to the final sentence as the prompt when no question mark exists', () => {
  const [q98] = parseExamTopicsTxt(condensed);
  assert.equal(q98.prompt, 'They need a QA process to evaluate prompt effectiveness.');
  assert.doesNotMatch(q98.scenario, /They need a QA process/);
});

test('still prefers a question-mark sentence as the prompt when present', () => {
  const [, q99] = parseExamTopicsTxt(condensed);
  assert.equal(q99.prompt, 'Which combination of steps will meet these requirements?');
});

test('condensed five-option questions keep all five options', () => {
  const [, q99] = parseExamTopicsTxt(condensed);
  assert.deepEqual(q99.options.map(o => o.letter), ['A', 'B', 'C', 'D', 'E']);
});

test('parseExamTopicsDir only reads N-M.txt dump files, ignoring other txt', () => {
  const dir = mkdtempSync(join(tmpdir(), 'et-'));
  writeFileSync(join(dir, '1-2.txt'), fixture);
  writeFileSync(join(dir, '98-99.txt'), condensed);
  writeFileSync(join(dir, 'sections.txt'), 'Q1 -> §8   Q2 -> §9\nQuestion #500 not a dump\n');

  const questions = parseExamTopicsDir(dir);

  assert.deepEqual(questions.map(q => q.number), [1, 2, 98, 99, 100, 101, 102]);
});

test('parseExamTopicsDir does not bleed one file header into the previous file last option', () => {
  const dir = mkdtempSync(join(tmpdir(), 'et-'));
  writeFileSync(join(dir, '1-2.txt'), fixture);
  writeFileSync(join(dir, '98-99.txt'), condensed);

  const questions = parseExamTopicsDir(dir);
  const q2 = questions.find(q => q.number === 2);

  const lastOption = q2.options[q2.options.length - 1].text;
  assert.doesNotMatch(lastOption, /AIP-C01/);
  assert.doesNotMatch(lastOption, /ExamTopics Discussion Pages/);
});

test('keeps a final sentence that ends in a closing quote, and uses it as the prompt', () => {
  const q100 = parseExamTopicsTxt(condensed).find(q => q.number === 100);
  assert.equal(
    q100.prompt,
    'The company needs to resolve permissions issues and "manage collections at scale by automatically assigning access permissions."'
  );
  assert.match(q100.scenario, /403 Forbidden/);
});

test('stops at the trailing NOTE footer instead of appending it to the last option', () => {
  const q101 = parseExamTopicsTxt(condensed).find(q => q.number === 101);
  const lastOption = q101.options[q101.options.length - 1].text;
  assert.doesNotMatch(lastOption, /NOTE:/);
  assert.doesNotMatch(lastOption, /answer choices/);
  assert.equal(lastOption, 'Use Step Functions to orchestrate the approval workflow.');
});

test('a single-sentence condensed body becomes the scenario, not a bolded prompt', () => {
  const q101 = parseExamTopicsTxt(condensed).find(q => q.number === 101);
  assert.match(q101.scenario, /^A logistics company needs to build/);
  assert.match(q101.scenario, /minimal operational overhead\.$/);
  assert.equal(q101.prompt, '');
});

test('splits off a question sentence that sits inside the scenario paragraph', () => {
  const q102 = parseExamTopicsTxt(condensed).find(q => q.number === 102);
  assert.equal(q102.prompt, 'Which solution will resolve this issue?');
  assert.match(q102.scenario, /^A company is implementing a 2-week initiative/);
  assert.match(q102.scenario, /AccessDenied exception\.$/);
});
