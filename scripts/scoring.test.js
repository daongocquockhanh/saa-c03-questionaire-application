import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreQuestion, verdict } from '../public/scoring.js';

// Single-answer questions: unchanged all-or-nothing.
test('single-answer: correct pick scores 1', () => {
  assert.equal(scoreQuestion(['A'], ['A']), 1);
});

test('single-answer: wrong pick scores 0', () => {
  assert.equal(scoreQuestion(['A'], ['B']), 0);
});

// Multi-answer: partial credit (the new behavior).
test('multi-answer: all correct scores 1', () => {
  assert.equal(scoreQuestion(['A', 'B'], ['A', 'B']), 1);
});

test('multi-answer: one of two correct (missed one) scores 0.5', () => {
  assert.equal(scoreQuestion(['A', 'B'], ['A']), 0.5);
});

test('multi-answer: one correct + one wrong scores 0.5 (wrong not penalized)', () => {
  assert.equal(scoreQuestion(['A', 'B'], ['A', 'C']), 0.5);
});

test('multi-answer: one of three correct scores 1/3', () => {
  assert.equal(scoreQuestion(['A', 'B', 'C'], ['B']), 1 / 3);
});

test('multi-answer: none correct scores 0', () => {
  assert.equal(scoreQuestion(['A', 'B'], ['C', 'D']), 0);
});

// Edge cases.
test('empty given scores 0', () => {
  assert.equal(scoreQuestion(['A', 'B'], []), 0);
});

test('order does not matter', () => {
  assert.equal(scoreQuestion(['B', 'A'], ['A', 'B']), 1);
});

test('duplicate picks do not inflate score', () => {
  assert.equal(scoreQuestion(['A', 'B'], ['A', 'A']), 0.5);
});

// verdict() classifies a question for display.
test('verdict: full credit, no wrong picks → correct', () => {
  assert.equal(verdict(['A', 'B'], ['A', 'B']), 'correct');
});

test('verdict: some but not all correct → partial', () => {
  assert.equal(verdict(['A', 'B'], ['A']), 'partial');
});

test('verdict: one correct one wrong → partial', () => {
  assert.equal(verdict(['A', 'B'], ['A', 'C']), 'partial');
});

test('verdict: zero correct → wrong', () => {
  assert.equal(verdict(['A', 'B'], ['C']), 'wrong');
});

// Lenient model: wrong picks are not penalized in the score, so finding all
// correct answers is full credit even with an extra wrong pick. The wrong
// option is still shown with ✗ styling in the UI.
test('verdict: all correct found, extra wrong pick → still correct (lenient)', () => {
  assert.equal(verdict(['A', 'B'], ['A', 'B', 'C']), 'correct');
});
