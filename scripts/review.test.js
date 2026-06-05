import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFlagList, toggleInList, subtractIds } from '../public/review.js';

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

test('subtractIds removes the given ids, preserving order', () => {
  assert.deepEqual(subtractIds([1, 2, 3, 4], [2, 4]), [1, 3]);
});

test('subtractIds with empty remove returns the same ids', () => {
  assert.deepEqual(subtractIds([1, 2, 3], []), [1, 2, 3]);
});

test('subtractIds can remove everything', () => {
  assert.deepEqual(subtractIds([1, 2, 3], [1, 2, 3]), []);
});

test('subtractIds handles undefined inputs', () => {
  assert.deepEqual(subtractIds(undefined, [1]), []);
  assert.deepEqual(subtractIds([1, 2], undefined), [1, 2]);
});
