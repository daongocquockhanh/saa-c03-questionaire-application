import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partitionTests, seededShuffle, TOTAL_TESTS, TEST_SIZE, DOMAIN_QUOTA } from './build-tests.js';

function fakeQuestions(perDomain) {
  const out = [];
  let id = 1;
  for (const [domain, n] of Object.entries(perDomain)) {
    for (let i = 0; i < n; i++) out.push({ id: id++, domain: Number(domain) });
  }
  return out;
}

test('seededShuffle is deterministic for same seed', () => {
  const a = seededShuffle([1, 2, 3, 4, 5], 'seed-a');
  const b = seededShuffle([1, 2, 3, 4, 5], 'seed-a');
  const c = seededShuffle([1, 2, 3, 4, 5], 'seed-b');
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
});

test('partitionTests creates exactly 50 tests', () => {
  const qs = fakeQuestions({ 1: 262, 2: 271, 3: 221, 4: 143 });
  const tests = partitionTests(qs);
  assert.equal(tests.length, 50);
});

test('every test has exactly 65 questions', () => {
  const qs = fakeQuestions({ 1: 262, 2: 271, 3: 221, 4: 143 });
  const tests = partitionTests(qs);
  for (const t of tests) {
    assert.equal(t.questionIds.length, 65, `Test ${t.id} size`);
  }
});

test('every test has no duplicate questions within itself', () => {
  const qs = fakeQuestions({ 1: 262, 2: 271, 3: 221, 4: 143 });
  const tests = partitionTests(qs);
  for (const t of tests) {
    assert.equal(new Set(t.questionIds).size, t.questionIds.length, `Test ${t.id} duplicates`);
  }
});

test('every test matches the 20/17/16/12 domain quota exactly', () => {
  const qs = fakeQuestions({ 1: 262, 2: 271, 3: 221, 4: 143 });
  const tests = partitionTests(qs);
  const byId = new Map(qs.map(q => [q.id, q]));
  for (const t of tests) {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const id of t.questionIds) counts[byId.get(id).domain]++;
    assert.equal(counts[1], DOMAIN_QUOTA[1], `Test ${t.id} D1`);
    assert.equal(counts[2], DOMAIN_QUOTA[2], `Test ${t.id} D2`);
    assert.equal(counts[3], DOMAIN_QUOTA[3], `Test ${t.id} D3`);
    assert.equal(counts[4], DOMAIN_QUOTA[4], `Test ${t.id} D4`);
  }
});

test('partitionTests is deterministic across calls', () => {
  const qs = fakeQuestions({ 1: 262, 2: 271, 3: 221, 4: 143 });
  const a = partitionTests(qs);
  const b = partitionTests(qs);
  for (let i = 0; i < a.length; i++) {
    assert.deepEqual(a[i].questionIds, b[i].questionIds, `Test ${a[i].id} differs across calls`);
  }
});

test('different tests draw different (but overlapping) questions', () => {
  const qs = fakeQuestions({ 1: 262, 2: 271, 3: 221, 4: 143 });
  const tests = partitionTests(qs);
  // Tests 1 and 2 should not be identical
  assert.notDeepEqual(tests[0].questionIds, tests[1].questionIds);
});
