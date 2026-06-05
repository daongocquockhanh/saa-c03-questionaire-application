import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrongPool, normalizeFlagList, toggleInList } from '../public/review.js';

test('wrongPool returns ids with verdict wrong or partial, sorted', () => {
  const stats = {
    5: { verdict: 'correct', given: ['A'] },
    2: { verdict: 'wrong', given: ['B'] },
    9: { verdict: 'partial', given: ['A'] },
    7: { verdict: 'correct', given: ['C'] },
  };
  assert.deepEqual(wrongPool(stats), [2, 9]);
});

test('wrongPool is empty when all correct', () => {
  assert.deepEqual(wrongPool({ 1: { verdict: 'correct', given: [] } }), []);
});

test('wrongPool handles empty / missing entries', () => {
  assert.deepEqual(wrongPool({}), []);
  assert.deepEqual(wrongPool(undefined), []);
  assert.deepEqual(wrongPool({ 3: null, 4: { verdict: 'wrong', given: [] } }), [4]);
});

test('normalizeFlagList dedupes and sorts numerically', () => {
  assert.deepEqual(normalizeFlagList([9, 2, 2, 30, 9]), [2, 9, 30]);
});

test('normalizeFlagList handles undefined', () => {
  assert.deepEqual(normalizeFlagList(undefined), []);
});

test('toggleInList adds an absent id', () => {
  assert.deepEqual(toggleInList([1, 2], 3), [1, 2, 3]);
});

test('toggleInList removes a present id', () => {
  assert.deepEqual(toggleInList([1, 2, 3], 2), [1, 3]);
});

test('toggleInList does not mutate the input', () => {
  const orig = [1, 2];
  toggleInList(orig, 3);
  assert.deepEqual(orig, [1, 2]);
});
