import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partitionTests, seededShuffle } from './build-tests.js';

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

test('partitionTests creates 14 tests, 897 questions used exactly once', () => {
  const qs = fakeQuestions({ 1: 270, 2: 233, 3: 215, 4: 179 });
  const tests = partitionTests(qs);
  assert.equal(tests.length, 14);
  const allIds = tests.flatMap(t => t.questionIds);
  assert.equal(allIds.length, 897);
  assert.equal(new Set(allIds).size, 897);
});

test('first 13 tests have 65 questions each', () => {
  const qs = fakeQuestions({ 1: 270, 2: 233, 3: 215, 4: 179 });
  const tests = partitionTests(qs);
  for (let i = 0; i < 13; i++) {
    assert.equal(tests[i].questionIds.length, 65, `Test ${i + 1} size`);
  }
});

test('test 14 contains the remainder (897 - 13*65 = 52)', () => {
  const qs = fakeQuestions({ 1: 270, 2: 233, 3: 215, 4: 179 });
  const tests = partitionTests(qs);
  assert.equal(tests[13].questionIds.length, 52);
});

test('domain composition of full tests is close to 20/17/16/12 (±2)', () => {
  const qs = fakeQuestions({ 1: 270, 2: 233, 3: 215, 4: 179 });
  const tests = partitionTests(qs);
  const byId = new Map(qs.map(q => [q.id, q]));
  for (let i = 0; i < 13; i++) {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const id of tests[i].questionIds) counts[byId.get(id).domain]++;
    assert.ok(Math.abs(counts[1] - 20) <= 2, `Test ${i + 1} D1=${counts[1]}`);
    assert.ok(Math.abs(counts[2] - 17) <= 2, `Test ${i + 1} D2=${counts[2]}`);
    assert.ok(Math.abs(counts[3] - 16) <= 2, `Test ${i + 1} D3=${counts[3]}`);
    assert.ok(Math.abs(counts[4] - 12) <= 2, `Test ${i + 1} D4=${counts[4]}`);
  }
});
