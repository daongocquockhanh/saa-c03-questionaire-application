import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt, parseDomainResponse, mergeClassifications } from './classify.js';

test('buildPrompt embeds question text and options', () => {
  const q = {
    number: 1,
    scenario: 'S3 bucket needs encryption.',
    prompt: 'Which is best?',
    options: [{ letter: 'A', text: 'KMS' }, { letter: 'B', text: 'plaintext' }],
  };
  const p = buildPrompt(q);
  assert.match(p, /S3 bucket needs encryption/);
  assert.match(p, /A\. KMS/);
  assert.match(p, /B\. plaintext/);
  assert.match(p, /Secure/);
});

test('parseDomainResponse extracts a 1-4 digit from common shapes', () => {
  assert.equal(parseDomainResponse('1'), 1);
  assert.equal(parseDomainResponse('Domain: 3'), 3);
  assert.equal(parseDomainResponse('The answer is 2.'), 2);
  assert.equal(parseDomainResponse('4'), 4);
});

test('parseDomainResponse returns null for unparseable input', () => {
  assert.equal(parseDomainResponse('I do not know'), null);
  assert.equal(parseDomainResponse('5'), null);
  assert.equal(parseDomainResponse(''), null);
});

test('mergeClassifications keeps existing domain when present in cache', () => {
  const questions = [{ id: 1 }, { id: 2 }];
  const cache = { 1: 3 };
  const merged = mergeClassifications(questions, cache);
  assert.equal(merged[0].domain, 3);
  assert.equal(merged[1].domain, undefined);
});
