import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseSections } from './parse-sections.js';

const fixture = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '__fixtures__', 'sections-sample.txt'),
  'utf8'
);

test('reads section numbers and titles from the SECTION headings', () => {
  const { sections } = parseSections(fixture);
  assert.equal(sections['2'], 'Generative AI Fundamentals & Bedrock');
  assert.equal(sections['9'], 'Security, Identity & Compliance');
});

test('maps each question number to its section list', () => {
  const { questions } = parseSections(fixture);
  assert.deepEqual(questions['1'], [9]);
  assert.deepEqual(questions['4'], [2]);
});

test('keeps both sections when a question spans two', () => {
  const { questions } = parseSections(fixture);
  assert.deepEqual(questions['29'], [5, 8]);
  assert.deepEqual(questions['102'], [2, 6]);
});

test('reads the quick reference table, not the per-section question lists', () => {
  const { questions } = parseSections(fixture);
  // Q1 is listed under SECTION 9's prose block; the table is the authority.
  assert.deepEqual(Object.keys(questions).sort((a, b) => a - b), ['1', '4', '5', '29', '102']);
});
