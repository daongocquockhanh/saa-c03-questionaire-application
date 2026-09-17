import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sectionLabel } from '../public/exams.js';

test('sectionLabel renders a single section as number and title', () => {
  assert.equal(
    sectionLabel({ sections: [{ number: 9, title: 'Security, Identity & Compliance' }] }),
    '§9 Security, Identity & Compliance'
  );
});

test('sectionLabel joins a question that spans two sections', () => {
  assert.equal(
    sectionLabel({ sections: [{ number: 5, title: 'Operations' }, { number: 8, title: 'Governance & QA' }] }),
    '§5 Operations · §8 Governance & QA'
  );
});

test('sectionLabel is empty for questions with no section', () => {
  assert.equal(sectionLabel({ sections: [] }), '');
  assert.equal(sectionLabel({}), '');
});
