import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EXAMS, resolveExam } from '../public/exams.js';

test('saa-c03 is first and default', () => {
  assert.equal(EXAMS[0].code, 'saa-c03');
  assert.equal(EXAMS[0].dataFile, 'tests.json');
  assert.equal(EXAMS[0].unscoredPerTest, 15);
  assert.equal(EXAMS[0].hasTheory, true);
});

test('aip-c01 is registered', () => {
  const aip = EXAMS.find(e => e.code === 'aip-c01');
  assert.ok(aip);
  assert.equal(aip.dataFile, 'tests-aip-c01.json');
  assert.equal(aip.hasTheory, false);
  assert.equal(aip.unscoredPerTest, 0);
});

test('resolveExam falls back to saa-c03', () => {
  assert.equal(resolveExam('aip-c01').code, 'aip-c01');
  assert.equal(resolveExam('nope').code, 'saa-c03');
  assert.equal(resolveExam(null).code, 'saa-c03');
});