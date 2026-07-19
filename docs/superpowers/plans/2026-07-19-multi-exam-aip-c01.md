# Multi-Exam Support Phase 1 (Registry + AIP-C01) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an exam registry to the quiz app and ship AIP-C01 (97 ExamTopics questions, AI-answered) as the second selectable exam, leaving SAA-C03 data and progress untouched.

**Architecture:** A static `EXAMS` registry (`public/exams.js`) drives data-file loading, per-exam localStorage namespacing, and nav gating in `app.js`. A new ExamTopics txt parser + generic test builder produce `public/tests-aip-c01.json` in the same shape as the existing `tests.json`. Questions with no source answer key carry Claude-written answers flagged `aiAnswered: true`, badged in the UI.

**Tech Stack:** Vanilla ES modules, `node --test`, no new dependencies. Node >= 20.

## Global Constraints

- SAA-C03's `public/tests.json`, question IDs, and `saa-c03-progress` localStorage key must not change.
- Footer, splash modal, and LICENSE non-commercial/non-affiliation disclaimers preserved (compliance requirement); wording may generalize from "SAA-C03" to AWS exams broadly but no disclaimer may be dropped.
- AIP source: ExamTopics txt dumps at scratchpad `AIP-C01/{1-25,26-50,51-75,76-97}.txt` — copy into `data/aip-c01/` (Task 3).
- Every AIP question flagged `aiAnswered: true`; UI shows amber "AI-answered · unverified" badge.
- AIP exam config: 2 tests (49 + 48 Qs), 130 min, pass 75%, unscoredPerTest 0.
- Existing test command: `node --test scripts/*.test.js`.

---

### Task 1: Exam registry module

**Files:**
- Create: `public/exams.js`
- Test: `scripts/exams.test.js`

**Interfaces:**
- Produces: `EXAMS` (array of `{ code, title, dataFile, hasTheory, unscoredPerTest, note? }`), `resolveExam(code) -> exam` (falls back to first entry / SAA on unknown or null). Consumed by `app.js` (Tasks 6–7).

- [ ] **Step 1: Write the failing test**

```js
// scripts/exams.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/exams.test.js`
Expected: FAIL — cannot find module `public/exams.js`

- [ ] **Step 3: Write implementation**

```js
// public/exams.js
// Registry of exams the app can serve. Order matters: first entry is the default.
// unscoredPerTest mirrors the real exam's experimental-question count (SAA: 15 of 65).
export const EXAMS = [
  { code: 'saa-c03', title: 'SAA-C03', dataFile: 'tests.json', hasTheory: true, unscoredPerTest: 15 },
  {
    code: 'aip-c01', title: 'AIP-C01', dataFile: 'tests-aip-c01.json', hasTheory: false, unscoredPerTest: 0,
    note: 'Answers are AI-generated and unverified — treat as study guidance, not ground truth.',
  },
];

export function resolveExam(code) {
  return EXAMS.find(e => e.code === code) || EXAMS[0];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/exams.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add public/exams.js scripts/exams.test.js
git commit -m "feat: exam registry module"
```

---

### Task 2: ExamTopics txt parser

**Files:**
- Create: `scripts/parse-examtopics-txt.js`
- Create: `scripts/__fixtures__/examtopics-sample.txt`
- Test: `scripts/parse-examtopics-txt.test.js`

**Interfaces:**
- Produces: `parseExamTopicsTxt(text) -> question[]` where each question is `{ id, number, scenario, prompt, options: [{letter, text}], correctAnswers: [], isMultiSelect, explanation: null, references: [], needsManualAnswer: true }` — same shape as existing `data/raw-questions.json` entries. Consumed by Task 3 (CLI run) and Task 5 (builder input).

Source format (verified against real files): blocks separated by `====` rule lines and `URL: …` lines; `Question #N` heading; body lines; options as a bare letter line (` A.`) followed by blank line(s) then the option text line(s). Multi-select signaled by "(Choose two.)" / "(Choose three.)" in the body. No answers, no explanations in these dumps.

- [ ] **Step 1: Write the fixture**

```text
// scripts/__fixtures__/examtopics-sample.txt — two questions, second is Choose two

================================================================================
URL: https://www.examtopics.com/discussions/amazon/view/1-exam-sample/
================================================================================

Question #1

A company runs a web app.
The company needs lower latency.
Which solution will meet these requirements?

 A.

 Use CloudFront.

 B.

 Use a bigger instance.

 C.

 Move to one AZ.

 D.

 Disable caching.

================================================================================
URL: https://www.examtopics.com/discussions/amazon/view/2-exam-sample/
================================================================================

Question #2

A company stores logs.
Which combination of steps will meet this requirement? (Choose two.)

 A.

 Enable versioning.

 B.

 Use Object Lock.

 C.

 Delete the bucket.
```

(Write the file without the leading `//` comment line — it is shown here only to name the file.)

- [ ] **Step 2: Write the failing test**

```js
// scripts/parse-examtopics-txt.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseExamTopicsTxt } from './parse-examtopics-txt.js';

const fixture = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '__fixtures__', 'examtopics-sample.txt'),
  'utf8'
);

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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test scripts/parse-examtopics-txt.test.js`
Expected: FAIL — cannot find module `parse-examtopics-txt.js`

- [ ] **Step 4: Write implementation**

```js
// scripts/parse-examtopics-txt.js
// Parser for ExamTopics discussion-dump txt files (DOP-C02 / AIP-C01 format).
// Format: "Question #N" headings, option letters on their own line (" A.")
// followed by the option text. No answers or explanations in the dump.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SEPARATOR_RE = /^(=+|URL:.*)$/;
const QUESTION_RE = /^Question #(\d+)/;
const OPTION_LETTER_RE = /^\s*([A-F])\.\s*(.*)$/;

export function parseExamTopicsTxt(text) {
  const lines = text.split('\n').filter(l => !SEPARATOR_RE.test(l.trim()));

  // Split into question blocks.
  const blocks = [];
  let current = null;
  for (const line of lines) {
    const m = line.trim().match(QUESTION_RE);
    if (m) {
      if (current) blocks.push(current);
      current = { number: Number(m[1]), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) blocks.push(current);

  return blocks.map(parseBlock);
}

function parseBlock({ number, lines }) {
  const bodyLines = [];
  const options = [];
  let currentOption = null;

  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(OPTION_LETTER_RE);
    if (m) {
      if (currentOption) options.push(currentOption);
      currentOption = { letter: m[1], text: m[2].trim() };
      continue;
    }
    if (!line) continue;
    if (currentOption) {
      currentOption.text = (currentOption.text + ' ' + line).trim();
    } else {
      bodyLines.push(line);
    }
  }
  if (currentOption) options.push(currentOption);

  const body = bodyLines.join('\n');
  const { scenario, prompt } = splitScenarioPrompt(bodyLines);
  const isMultiSelect = /\(Choose (two|three)\.?\)/i.test(body);

  return {
    id: number,
    number,
    scenario,
    prompt,
    options,
    correctAnswers: [],
    isMultiSelect,
    explanation: null,
    references: [],
    needsManualAnswer: true,
  };
}

// Last line ending with '?' (or the final line) is the prompt; the rest is scenario.
function splitScenarioPrompt(bodyLines) {
  if (bodyLines.length === 0) return { scenario: '', prompt: '' };
  let idx = bodyLines.length - 1;
  for (let i = bodyLines.length - 1; i >= 0; i--) {
    if (/\?\s*(\(Choose (two|three)\.?\))?\s*$/i.test(bodyLines[i])) { idx = i; break; }
  }
  return {
    scenario: bodyLines.slice(0, idx).join('\n'),
    prompt: bodyLines.slice(idx).join('\n'),
  };
}

// CLI: node scripts/parse-examtopics-txt.js <input-dir> <output-file>
// Reads every non "-ans" .txt in input-dir, concatenates, parses, writes JSON.
const invoked = fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) {
  const { readdirSync } = await import('node:fs');
  const [inputDir, outputFile] = process.argv.slice(2);
  if (!inputDir || !outputFile) {
    console.error('Usage: node scripts/parse-examtopics-txt.js <input-dir> <output-file>');
    process.exit(1);
  }
  const files = readdirSync(inputDir)
    .filter(f => f.endsWith('.txt') && !f.includes('-ans'))
    .sort((a, b) => parseInt(a) - parseInt(b));
  const text = files.map(f => readFileSync(join(inputDir, f), 'utf8')).join('\n');
  const questions = parseExamTopicsTxt(text);
  const numbers = new Set(questions.map(q => q.number));
  if (numbers.size !== questions.length) throw new Error('Duplicate question numbers');
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, JSON.stringify(questions, null, 2));
  console.log(`Parsed ${questions.length} questions from ${files.length} files → ${outputFile}`);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test scripts/parse-examtopics-txt.test.js`
Expected: PASS (5 tests)

- [ ] **Step 6: Run full suite (regression)**

Run: `node --test scripts/*.test.js`
Expected: all PASS

- [ ] **Step 7: Commit**

```bash
git add scripts/parse-examtopics-txt.js scripts/parse-examtopics-txt.test.js scripts/__fixtures__/examtopics-sample.txt
git commit -m "feat: ExamTopics txt parser"
```

---

### Task 3: Import AIP-C01 source data and parse

**Files:**
- Create: `data/aip-c01/1-25.txt`, `data/aip-c01/26-50.txt`, `data/aip-c01/51-75.txt`, `data/aip-c01/76-97.txt` (copies of source dumps)
- Create: `data/aip-c01/raw-questions.json` (generated)
- Modify: `package.json` (add `parse-aip` script)

**Interfaces:**
- Consumes: `parseExamTopicsTxt` CLI from Task 2.
- Produces: `data/aip-c01/raw-questions.json` — 97 question objects, numbers 1–97. Consumed by Tasks 4–5.

- [ ] **Step 1: Copy source files**

```bash
SP=/private/tmp/claude-501/-Users-gondk-Documents-Work-saa-c03-questionaire-application/9cb1d32f-4444-4b4e-9287-986b2f34dc75/scratchpad
mkdir -p data/aip-c01
cp "$SP/AIP-C01/1-25.txt" "$SP/AIP-C01/26-50.txt" "$SP/AIP-C01/51-75.txt" "$SP/AIP-C01/76-97.txt" data/aip-c01/
```

(If the scratchpad has been cleaned, re-extract from `~/Downloads/AIP-C01-20260719T062234Z-1-001.zip`.)

- [ ] **Step 2: Add npm script**

In `package.json` `scripts`, after `"parse"`:

```json
"parse-aip": "node scripts/parse-examtopics-txt.js data/aip-c01 data/aip-c01/raw-questions.json",
```

- [ ] **Step 3: Run parser**

Run: `npm run parse-aip`
Expected: `Parsed 97 questions from 4 files → data/aip-c01/raw-questions.json`

- [ ] **Step 4: Sanity-check output**

Run:
```bash
node -e "
const qs = require('./data/aip-c01/raw-questions.json');
if (qs.length !== 97) throw new Error('expected 97, got ' + qs.length);
const nums = qs.map(q => q.number).sort((a,b)=>a-b);
if (nums[0] !== 1 || nums[96] !== 97) throw new Error('numbers not 1..97');
const bad = qs.filter(q => q.options.length < 4 || !q.prompt);
if (bad.length) throw new Error('malformed: ' + bad.map(q=>q.number).join(','));
console.log('OK: 97 questions, all with >=4 options and a prompt');
"
```
Expected: `OK: 97 questions, all with >=4 options and a prompt`
If malformed questions are reported, inspect those blocks in the source txt and fix the parser (not the data) — then re-run from Step 3.

- [ ] **Step 5: Commit**

```bash
git add data/aip-c01 package.json
git commit -m "feat: import and parse AIP-C01 question dump"
```

---

### Task 4: AIP-C01 answer key (Claude-generated)

**Files:**
- Create: `data/aip-c01/answers.json`

**Interfaces:**
- Produces: `data/aip-c01/answers.json` — object keyed by question number (string): `{ "1": { "answers": ["D"], "rationale": "…" }, … }` for all 97 questions. `answers` = option letters; `rationale` = 2–4 sentence explanation of why, written to be shown as the question's explanation text. Consumed by Task 5 builder.

**This is a content task, not a code task.** The executing agent must read each question in `data/aip-c01/raw-questions.json` and answer it using AWS domain knowledge (Bedrock, SageMaker, guardrails, agents, RAG, GenAI security — AIP-C01 scope). Work in batches (e.g. 10 questions at a time) and write the accumulating JSON file. Multi-select questions ("Choose two/three") get exactly 2/3 letters.

- [ ] **Step 1: Answer questions 1–97 in batches, writing `data/aip-c01/answers.json`**

Format:

```json
{
  "1": { "answers": ["D"], "rationale": "Amazon Bedrock model evaluation jobs natively compare prompt variants including fairness dimensions..." },
  "2": { "answers": ["A", "D", "F"], "rationale": "..." }
}
```

- [ ] **Step 2: Validate the answer file**

Run:
```bash
node -e "
const qs = require('./data/aip-c01/raw-questions.json');
const ans = require('./data/aip-c01/answers.json');
const errs = [];
for (const q of qs) {
  const a = ans[String(q.number)];
  if (!a) { errs.push(q.number + ': missing'); continue; }
  const valid = new Set(q.options.map(o => o.letter));
  for (const l of a.answers) if (!valid.has(l)) errs.push(q.number + ': bad letter ' + l);
  const chooseN = /\(Choose three\.?\)/i.test(q.prompt + q.scenario) ? 3
                : /\(Choose two\.?\)/i.test(q.prompt + q.scenario) ? 2 : 1;
  if (a.answers.length !== chooseN) errs.push(q.number + ': expected ' + chooseN + ' answers, got ' + a.answers.length);
  if (!a.rationale || a.rationale.length < 40) errs.push(q.number + ': rationale too short');
}
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
console.log('OK: all 97 answered, letters valid, counts match Choose-N');
"
```
Expected: `OK: all 97 answered, letters valid, counts match Choose-N`
Fix any reported issue and re-run until clean.

- [ ] **Step 3: Commit**

```bash
git add data/aip-c01/answers.json
git commit -m "feat: AI-generated answer key for AIP-C01 (unverified)"
```

---

### Task 5: Generic exam test builder

**Files:**
- Create: `scripts/build-exam-tests.js`
- Test: `scripts/build-exam-tests.test.js`
- Create: `public/tests-aip-c01.json` (generated)
- Modify: `package.json` (add `build-aip` script)

**Interfaces:**
- Consumes: `seededShuffle` from `scripts/build-tests.js` (exported); `data/aip-c01/raw-questions.json` + `data/aip-c01/answers.json`.
- Produces: `mergeAnswers(questions, answers) -> question[]` (sets `correctAnswers`, `explanation`, `aiAnswered: true`, drops `needsManualAnswer`); `chunkTests(questionIds, testCount, seed) -> tests[]` (`{ id, title, questionIds }`, near-even split, every id used exactly once); `public/tests-aip-c01.json` in the same top-level shape as `tests.json`: `{ version, totalTests, durationMinutes, passPercent, tests, questions }`.

- [ ] **Step 1: Write the failing test**

```js
// scripts/build-exam-tests.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeAnswers, chunkTests } from './build-exam-tests.js';

const questions = [
  { id: 1, number: 1, prompt: 'Q1?', options: [{ letter: 'A', text: 'a' }, { letter: 'B', text: 'b' }], correctAnswers: [], isMultiSelect: false, explanation: null, needsManualAnswer: true },
  { id: 2, number: 2, prompt: 'Q2?', options: [{ letter: 'A', text: 'a' }, { letter: 'B', text: 'b' }], correctAnswers: [], isMultiSelect: true, explanation: null, needsManualAnswer: true },
];
const answers = {
  '1': { answers: ['B'], rationale: 'Because B.' },
  '2': { answers: ['A', 'B'], rationale: 'Both.' },
};

test('mergeAnswers sets correctAnswers, explanation, aiAnswered', () => {
  const merged = mergeAnswers(questions, answers);
  assert.deepEqual(merged[0].correctAnswers, ['B']);
  assert.equal(merged[0].explanation, 'Because B.');
  assert.equal(merged[0].aiAnswered, true);
  assert.equal(merged[0].needsManualAnswer, undefined);
  assert.deepEqual(merged[1].correctAnswers, ['A', 'B']);
});

test('mergeAnswers throws on missing answer', () => {
  assert.throws(() => mergeAnswers(questions, { '1': answers['1'] }), /no answer for question 2/i);
});

test('chunkTests splits all ids exactly once, near-evenly', () => {
  const ids = Array.from({ length: 97 }, (_, i) => i + 1);
  const tests = chunkTests(ids, 2, 'aip-c01');
  assert.equal(tests.length, 2);
  assert.equal(tests[0].questionIds.length, 49);
  assert.equal(tests[1].questionIds.length, 48);
  const all = tests.flatMap(t => t.questionIds).sort((a, b) => a - b);
  assert.deepEqual(all, ids);
  assert.equal(tests[0].title, 'Practice Test 1');
});

test('chunkTests is deterministic per seed', () => {
  const ids = [1, 2, 3, 4, 5, 6];
  assert.deepEqual(chunkTests(ids, 2, 's'), chunkTests(ids, 2, 's'));
  assert.notDeepEqual(chunkTests(ids, 2, 's')[0].questionIds, chunkTests(ids, 2, 'other')[0].questionIds);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-exam-tests.test.js`
Expected: FAIL — cannot find module `build-exam-tests.js`

- [ ] **Step 3: Write implementation**

```js
// scripts/build-exam-tests.js
// Generic builder for exams without domain classification (AIP-C01, later DOP/SCS).
// Merges an answer key into parsed questions and chunks the pool into N tests.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { seededShuffle } from './build-tests.js';

export function mergeAnswers(questions, answers) {
  return questions.map(q => {
    const a = answers[String(q.number)];
    if (!a) throw new Error(`No answer for question ${q.number}`);
    const { needsManualAnswer, ...rest } = q;
    return {
      ...rest,
      correctAnswers: a.answers,
      isMultiSelect: q.isMultiSelect || a.answers.length > 1,
      explanation: a.rationale,
      aiAnswered: true,
    };
  });
}

export function chunkTests(questionIds, testCount, seed) {
  const shuffled = seededShuffle(questionIds, `${seed}-pool`);
  const base = Math.floor(shuffled.length / testCount);
  const extra = shuffled.length % testCount;
  const tests = [];
  let offset = 0;
  for (let i = 0; i < testCount; i++) {
    const size = base + (i < extra ? 1 : 0);
    tests.push({
      id: i + 1,
      title: `Practice Test ${i + 1}`,
      questionIds: shuffled.slice(offset, offset + size),
    });
    offset += size;
  }
  return tests;
}

// CLI: node scripts/build-exam-tests.js aip-c01
const CONFIGS = {
  'aip-c01': {
    rawFile: 'data/aip-c01/raw-questions.json',
    answersFile: 'data/aip-c01/answers.json',
    outFile: 'public/tests-aip-c01.json',
    testCount: 2,
    durationMinutes: 130,
    passPercent: 75,
  },
};

const invoked = fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) {
  const code = process.argv[2];
  const cfg = CONFIGS[code];
  if (!cfg) { console.error(`Unknown exam: ${code}. Known: ${Object.keys(CONFIGS).join(', ')}`); process.exit(1); }
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const raw = JSON.parse(readFileSync(join(root, cfg.rawFile), 'utf8'));
  const answers = JSON.parse(readFileSync(join(root, cfg.answersFile), 'utf8'));
  const questions = mergeAnswers(raw, answers);
  const tests = chunkTests(questions.map(q => q.id), cfg.testCount, code);
  const out = {
    version: '1.0',
    totalTests: cfg.testCount,
    durationMinutes: cfg.durationMinutes,
    passPercent: cfg.passPercent,
    tests,
    questions,
  };
  mkdirSync(dirname(join(root, cfg.outFile)), { recursive: true });
  writeFileSync(join(root, cfg.outFile), JSON.stringify(out));
  console.log(`Built ${tests.length} tests, ${questions.length} questions → ${cfg.outFile}`);
  for (const t of tests) console.log(`  ${t.title}: ${t.questionIds.length} Qs`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/build-exam-tests.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Add npm script and build**

In `package.json` `scripts`, after `"build-tests"`:

```json
"build-aip": "node scripts/build-exam-tests.js aip-c01",
```

Run: `npm run build-aip`
Expected: `Built 2 tests, 97 questions → public/tests-aip-c01.json` then `Practice Test 1: 49 Qs`, `Practice Test 2: 48 Qs`

- [ ] **Step 6: Run full suite (regression)**

Run: `node --test scripts/*.test.js`
Expected: all PASS

- [ ] **Step 7: Commit**

```bash
git add scripts/build-exam-tests.js scripts/build-exam-tests.test.js public/tests-aip-c01.json package.json
git commit -m "feat: generic exam builder + AIP-C01 test data"
```

---

### Task 6: Exam-aware app core

**Files:**
- Modify: `public/app.js` (lines cited below are pre-change positions)

**Interfaces:**
- Consumes: `EXAMS`, `resolveExam` from `public/exams.js` (Task 1); `public/tests-aip-c01.json` (Task 5).
- Produces: module-level `ACTIVE_EXAM` used by Task 7's UI. localStorage key `'active-exam'` holds the selected exam code.

No unit-test harness exists for `app.js` (DOM code); verification is via browser (Step 6) and Task 8 QA.

- [ ] **Step 1: Wire registry into constants (app.js:1-10)**

Replace:

```js
import { MODULES } from './modules.js';
import { scoreQuestion, verdict, pickUnscored } from './scoring.js';
import { normalizeFlagList, toggleInList, subtractIds } from './review.js';

// Real SAA-C03 leaves 15 of 65 questions unscored. Practice Tests mirror that.
const UNSCORED_PER_TEST = 15;

const STORE_KEY = 'saa-c03-progress';
```

with:

```js
import { MODULES } from './modules.js';
import { scoreQuestion, verdict, pickUnscored } from './scoring.js';
import { normalizeFlagList, toggleInList, subtractIds } from './review.js';
import { EXAMS, resolveExam } from './exams.js';

// Which exam this session serves. Switching exams reloads the page (Task 7),
// so everything below can treat ACTIVE_EXAM as constant.
const ACTIVE_EXAM = resolveExam(localStorage.getItem('active-exam'));

// Real SAA-C03 leaves 15 of 65 questions unscored; other exams configure their own.
const UNSCORED_PER_TEST = ACTIVE_EXAM.unscoredPerTest;

// 'saa-c03' + '-progress' === the legacy key, so existing SAA progress survives.
const STORE_KEY = ACTIVE_EXAM.code + '-progress';
```

- [ ] **Step 2: Exam-aware data loading (app.js:31-35)**

Replace:

```js
async function loadData() {
  const res = await fetch('tests.json');
  if (!res.ok) throw new Error('Failed to load tests.json');
  return res.json();
}
```

with:

```js
async function loadData() {
  const res = await fetch(ACTIVE_EXAM.dataFile);
  if (!res.ok) throw new Error(`Failed to load ${ACTIVE_EXAM.dataFile}`);
  return res.json();
}
```

- [ ] **Step 3: Gate theory-dependent nav (updateTopbar, app.js:56-65)**

Replace the four `<a …>` nav links with:

```js
  el.innerHTML = `
    <a href="#/dashboard" class="nav-link ${screen === 'dashboard' ? 'active' : ''}">Practice Tests</a>
    ${ACTIVE_EXAM.hasTheory ? `
    <a href="#/modules" class="nav-link ${screen === 'modules' ? 'active' : ''}">Modules</a>
    <a href="#/theory" class="nav-link ${screen === 'theory' ? 'active' : ''}">Theory</a>
    <a href="#/sources" class="nav-link ${screen === 'sources' ? 'active' : ''}">Sources</a>` : ''}
  `;
```

Also in `route()` (app.js:41-54), guard the theory routes so a stale hash on a non-theory exam falls back to the dashboard. Replace:

```js
  else if (screen === 'theory') renderTheory(arg || null);
  else if (screen === 'modules') renderModule(arg || null);
  else if (screen === 'sources') renderSources();
```

with:

```js
  else if (screen === 'theory' && ACTIVE_EXAM.hasTheory) renderTheory(arg || null);
  else if (screen === 'modules' && ACTIVE_EXAM.hasTheory) renderModule(arg || null);
  else if (screen === 'sources' && ACTIVE_EXAM.hasTheory) renderSources();
```

- [ ] **Step 4: Domain-safe result screen (renderResult, app.js:389-433)**

AIP questions have no `q.domain`. Three changes inside `renderResult`:

(a) Replace the byDomain accumulation loop:

```js
  for (const id of test.questionIds) {
    if (unscoredSet.has(id)) continue;
    const q = getQuestion(id);
    byDomain[q.domain].total++;
    byDomain[q.domain].correct += scoreQuestion(q.correctAnswers, r.answers[id]);
  }
```

with:

```js
  for (const id of test.questionIds) {
    if (unscoredSet.has(id)) continue;
    const q = getQuestion(id);
    if (!byDomain[q.domain]) continue; // exams without domain classification
    byDomain[q.domain].total++;
    byDomain[q.domain].correct += scoreQuestion(q.correctAnswers, r.answers[id]);
  }
```

(b) After the `domainBars` definition, make the bars conditional. Replace the line that renders them in the final template (find `${domainBars}` in the `render(` call at the bottom of `renderResult`) with:

```js
      ${Object.values(byDomain).some(v => v.total > 0) ? domainBars : ''}
```

(If `${domainBars}` sits inside a wrapper element like `<div class="domains">…</div>`, wrap that whole element in the conditional instead so no empty container renders.)

(c) In the per-question summary row, replace:

```js
          ${flagged ? '★' : ''} <span class="muted">D${q.domain} ${domainNames[q.domain]}</span>
```

with:

```js
          ${flagged ? '★' : ''} ${q.domain ? `<span class="muted">D${q.domain} ${domainNames[q.domain]}</span>` : ''}
```

- [ ] **Step 5: Per-exam document title (DOMContentLoaded, app.js:1327)**

Inside the `DOMContentLoaded` handler, before `initSplash()`:

```js
  document.title = `${ACTIVE_EXAM.title} Practice`;
  const brand = document.querySelector('.brand');
  if (brand) brand.textContent = `${ACTIVE_EXAM.title} Practice`;
```

- [ ] **Step 6: Browser smoke test**

Run: `npm run serve` then open `http://localhost:8080`.
Expected: SAA-C03 loads exactly as before (default exam). In devtools console:
`localStorage.setItem('active-exam', 'aip-c01'); location.reload()`
Expected: title becomes "AIP-C01 Practice", nav shows only Practice Tests, dashboard lists 2 tests. Start a test, answer a question, submit via Review & Submit, confirm result screen renders with no domain bars and no console errors. Switch back:
`localStorage.setItem('active-exam', 'saa-c03'); location.reload()` — SAA progress intact.

- [ ] **Step 7: Commit**

```bash
git add public/app.js
git commit -m "feat: exam-aware data loading, storage namespacing, nav gating"
```

---

### Task 7: Exam switcher UI, AI-answered badge, generalized copy

**Files:**
- Modify: `public/app.js` (renderDashboard, renderRunner, renderResult)
- Modify: `public/index.html`
- Modify: `public/styles.css`

**Interfaces:**
- Consumes: `ACTIVE_EXAM`, `EXAMS` from Task 6.

- [ ] **Step 1: Exam switcher + exam note on dashboard (renderDashboard, app.js:116)**

At the top of the dashboard template (before the existing heading/filter content), add:

```js
  const examTabs = EXAMS.map(e =>
    `<button class="exam-tab ${e.code === ACTIVE_EXAM.code ? 'active' : ''}" data-exam="${e.code}">${e.title}</button>`
  ).join('');
  const examNote = ACTIVE_EXAM.note
    ? `<p class="exam-note">⚠ ${escapeHtml(ACTIVE_EXAM.note)}</p>` : '';
```

and include `<div class="exam-tabs">${examTabs}</div>${examNote}` at the start of the rendered HTML. After `render(...)`, wire the click handler:

```js
  document.querySelectorAll('.exam-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.exam === ACTIVE_EXAM.code) return;
      localStorage.setItem('active-exam', btn.dataset.exam);
      location.hash = '#/dashboard';
      location.reload();
    });
  });
```

- [ ] **Step 2: AI-answered badge in runner and result**

In `renderRunner` (app.js:230), in the `<section class="question">` block, directly after the opening tag add:

```js
        ${q.aiAnswered ? '<span class="badge ai-unverified">AI-answered · unverified</span>' : ''}
```

In `renderResult`, inside each result row's `<summary>` (next to the pass/fail badge), add the same expression.

- [ ] **Step 3: Badge + tabs CSS (styles.css, append)**

```css
/* Multi-exam UI */
.exam-tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.exam-tab {
  padding: 6px 14px; border-radius: 999px; border: 1px solid var(--border, #d0d7de);
  background: transparent; cursor: pointer; font: inherit;
}
.exam-tab.active { background: var(--accent, #0969da); color: #fff; border-color: transparent; }
.badge.ai-unverified { background: #fff3cd; color: #7a5b00; border: 1px solid #e6c34a; }
.exam-note { color: #7a5b00; background: #fff8e1; border: 1px solid #e6c34a; border-radius: 6px; padding: 8px 12px; }
```

(Check `styles.css` for existing custom property names — reuse the project's border/accent variables if they exist rather than the fallbacks shown.)

- [ ] **Step 4: Generalize index.html copy**

In `public/index.html`:
- `<title>SAA-C03 Practice</title>` → `<title>AWS Cert Practice</title>` (app.js overrides per exam at runtime).
- Brand link text `SAA-C03 Practice` → `AWS Cert Practice` (also runtime-overridden).
- Splash modal paragraph: `for the AWS Certified Solutions Architect – Associate (SAA-C03) exam.` → `for AWS certification exams (SAA-C03, AIP-C01, and others).`
- Footer sentence `is sourced from publicly circulated study material` — add `, including ExamTopics community dumps,` after "material". **Every non-commercial / non-affiliation sentence stays; only broaden exam naming.** Also add `or ExamTopics` alongside the existing `or Passleader` non-affiliation mentions (footer and splash).

- [ ] **Step 5: Browser verification**

Run: `npm run serve`, open `http://localhost:8080`.
Expected:
- Dashboard shows SAA-C03 / AIP-C01 pill tabs; clicking AIP-C01 reloads into AIP with amber note under the tabs.
- AIP runner questions show the amber "AI-answered · unverified" badge; SAA questions don't.
- Splash modal (clear `saa-c03-splash-ack` in localStorage to re-trigger) shows generalized wording with all disclaimers.

- [ ] **Step 6: Commit**

```bash
git add public/app.js public/index.html public/styles.css
git commit -m "feat: exam switcher, AI-answered badge, generalized site copy"
```

---

### Task 8: Full QA + docs

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Full test suite**

Run: `node --test scripts/*.test.js`
Expected: all PASS

- [ ] **Step 2: End-to-end QA checklist (browser, `npm run serve`)**

- SAA-C03 default: dashboard, take/resume a test, result, review, redo, theory, modules — all unchanged, existing progress visible.
- Switch to AIP-C01: 2 tests listed, exam note visible, no Theory/Modules/Sources nav.
- Take AIP Practice Test 1 end-to-end: timer, flagging, grid, submit, result (no domain bars, badges present, rationale shown as explanation).
- Score maths: with `unscoredPerTest 0`, result total equals 49 for Test 1.
- Switch back to SAA: progress intact; `localStorage` shows separate `saa-c03-progress` and `aip-c01-progress` keys.
- Stale-hash check: while on AIP, manually visit `#/theory` — lands on dashboard.

- [ ] **Step 3: Update README**

Add a "Multiple exams" section: registry location (`public/exams.js`), per-exam data files, AIP build pipeline (`npm run parse-aip && npm run build-aip`), AI-answered caveat, and that DOP-C02/SCS-C02 are planned phases (see spec `docs/superpowers/specs/2026-07-19-multi-exam-support-design.md`).

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: multi-exam usage and AIP-C01 pipeline"
```