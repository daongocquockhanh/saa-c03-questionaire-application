# SAA-C03 Practice Quiz App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static-site SAA-C03 practice quiz app from a Passleader PDF dump, with a pre-build pipeline that parses, domain-classifies (Claude Haiku), and partitions 897 questions into 14 domain-balanced 65-question tests; runtime app provides dashboard, timer-driven test runner, and per-question review.

**Architecture:** Two phases. Pre-build = Node scripts (`parse → classify → build-tests`) producing `public/tests.json`. Runtime = vanilla HTML/CSS/JS single-page app, hash routing, localStorage persistence, deployable to GitHub Pages.

**Tech Stack:** Node.js 20+ (built-in `node:test`), `@anthropic-ai/sdk` for classification, vanilla HTML/CSS/JS for runtime, poppler `pdftotext` already installed via Homebrew (invoked from `npm` script, never from inside JS).

---

## File Structure

```
saa-c03-questionaire-application/
├── README.md
├── package.json
├── .gitignore
├── .env.example
├── scripts/
│   ├── parse.js              # data/saa-c03.txt → data/raw-questions.json
│   ├── parse.test.js
│   ├── classify.js           # data/raw-questions.json → data/questions.json (calls Haiku)
│   ├── classify.test.js
│   ├── build-tests.js        # data/questions.json → public/tests.json
│   └── build-tests.test.js
├── data/
│   ├── saa-c03.txt           # produced by `npm run extract-pdf`, committed
│   ├── raw-questions.json    # generated, committed
│   └── questions.json        # generated, committed
└── public/
    ├── index.html
    ├── app.js
    ├── styles.css
    └── tests.json            # generated, committed, deployable
```

Decomposition principles:
- One Node script per pipeline phase. Each is a pure data transform with its own test file. None of them spawn child processes — PDF text extraction is a separate `npm` script that calls `pdftotext` directly.
- Runtime app stays vanilla JS in a single `app.js`. Hash routing keeps it one file. Splitting only if it grows beyond ~600 lines.
- `data/` artifacts are checked in so the site can be rebuilt and re-deployed without rerunning the full pipeline.

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `README.md`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "saa-c03-quiz-app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "extract-pdf": "pdftotext -layout /Users/gondk/Downloads/SAA-C03.pdf data/saa-c03.txt",
    "parse": "node scripts/parse.js",
    "classify": "node scripts/classify.js",
    "build-tests": "node scripts/build-tests.js",
    "build": "npm run extract-pdf && npm run parse && npm run classify && npm run build-tests",
    "test": "node --test scripts/*.test.js",
    "serve": "npx -y http-server public -p 8080 -c-1"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 2: Create .gitignore**

```
node_modules/
.env
.env.local
*.log
.DS_Store
```

- [ ] **Step 3: Create .env.example**

```
ANTHROPIC_API_KEY=sk-ant-...
```

- [ ] **Step 4: Create README.md (skeleton; expanded later in Task 10)**

```markdown
# SAA-C03 Practice Quiz App

See `docs/superpowers/specs/2026-05-14-saa-c03-quiz-app-design.md` and `docs/superpowers/plans/2026-05-14-saa-c03-quiz-app.md`.

Quick start:
```bash
npm install
cp .env.example .env   # add ANTHROPIC_API_KEY
npm run build
npm run serve
```
```

- [ ] **Step 5: Install dependencies and verify**

Run: `npm install`
Expected: `node_modules/` populated, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore .env.example README.md
git commit -m "chore: scaffold project (package.json, gitignore, readme)"
```

---

## Task 2: PDF parser — text → structured questions

**Files:**
- Create: `data/saa-c03.txt` (via `npm run extract-pdf`)
- Create: `scripts/parse.js`
- Create: `scripts/parse.test.js`
- Create: `scripts/__fixtures__/sample.txt`

- [ ] **Step 1: Extract the PDF text**

Run: `npm run extract-pdf`
Expected: creates `data/saa-c03.txt` (~1.1 MB, ~24k lines).

Verify: `wc -l data/saa-c03.txt` → about `24079`.

- [ ] **Step 2: Create test fixture with representative shapes**

Create `scripts/__fixtures__/sample.txt` containing 5 hand-crafted questions covering edge cases (form-feed prefix, multi-line option, missing answer, multi-select, 5 options):

```
\fQUESTION 1
A scenario question about ALB.
Sample multi-line scenario continues here.

What should the architect do?

A. First option text.
B. Second option text that
   wraps to a second line.
C. Third option.
D. Fourth option.

Answer: C
Explanation:
This is the explanation text.
https://docs.aws.amazon.com/example


QUESTION 2
Scenario for multi-select.

Which two steps? (Choose two.)

A. Step one.
B. Step two.
C. Step three.
D. Step four.
E. Step five.

Answer: BD
Explanation:
B and D because reasons.


QUESTION 3
A question missing its answer in the dump.

What is the right call?

A. Option A.
B. Option B.
C. Option C.
D. Option D.

Explanation:
Answer is D based on the rationale.


Get Latest & Actual SAA-C03 Exam's Question and Answers from Passleader.    99
https://www.passleader.com
QUESTION 4
\fQuestion with a page footer split mid-block.

What to do?

A. Aaa.
B. Bbb.
C. Ccc.
D. Ddd.

Answer: A


QUESTION 5
Five-option question.

Choose the best.

A. One.
B. Two.
C. Three.
D. Four.
E. Five.

Answer: E
Explanation:
E is correct.
```

Note: the `\f` characters in the fixture are literal `0x0C` bytes. Insert them with an editor that supports it (e.g. in VS Code: type the two characters `\` then `f` and use a `sed` post-step, or just use `printf '\f'`).

- [ ] **Step 3: Write the failing test**

Create `scripts/parse.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseQuestions } from './parse.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sample = readFileSync(join(__dirname, '__fixtures__/sample.txt'), 'utf8');

test('parses all five sample questions', () => {
  const qs = parseQuestions(sample);
  assert.equal(qs.length, 5);
});

test('Q1: single-answer with 4 options and explanation', () => {
  const q = parseQuestions(sample)[0];
  assert.equal(q.number, 1);
  assert.equal(q.options.length, 4);
  assert.deepEqual(q.correctAnswers, ['C']);
  assert.equal(q.isMultiSelect, false);
  assert.match(q.explanation, /explanation text/);
  assert.deepEqual(q.references, ['https://docs.aws.amazon.com/example']);
});

test('Q1: multi-line option text is joined', () => {
  const q = parseQuestions(sample)[0];
  assert.match(q.options[1].text, /wraps to a second line/);
});

test('Q2: multi-select (Choose two.) with 5 options', () => {
  const q = parseQuestions(sample)[1];
  assert.equal(q.isMultiSelect, true);
  assert.deepEqual(q.correctAnswers, ['B', 'D']);
  assert.equal(q.options.length, 5);
});

test('Q3: missing answer flagged needsManualAnswer', () => {
  const q = parseQuestions(sample)[2];
  assert.deepEqual(q.correctAnswers, []);
  assert.equal(q.needsManualAnswer, true);
});

test('Q4: page footer stripped, form-feed prefix tolerated', () => {
  const q = parseQuestions(sample)[3];
  assert.equal(q.number, 4);
  assert.doesNotMatch(q.scenario, /passleader/i);
  assert.doesNotMatch(q.scenario, /Get Latest/i);
  assert.deepEqual(q.correctAnswers, ['A']);
});

test('Q5: 5-option question', () => {
  const q = parseQuestions(sample)[4];
  assert.equal(q.options.length, 5);
  assert.equal(q.options[4].letter, 'E');
  assert.deepEqual(q.correctAnswers, ['E']);
});

test('every question has scenario and prompt populated', () => {
  for (const q of parseQuestions(sample)) {
    assert.ok(q.scenario && q.scenario.length > 0, `Q${q.number} missing scenario`);
    assert.ok(q.prompt && q.prompt.length > 0, `Q${q.number} missing prompt`);
  }
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `parseQuestions is not defined`.

- [ ] **Step 5: Implement parser**

Create `scripts/parse.js`:

```javascript
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const TXT_PATH = join(PROJECT_ROOT, 'data', 'saa-c03.txt');
const OUT_PATH = join(PROJECT_ROOT, 'data', 'raw-questions.json');

const FOOTER_RE = /(Get Latest|passleader\.com)/i;
const URL_RE = /https?:\/\/\S+/g;

export function parseQuestions(text) {
  // 1. Normalise: strip form-feed chars, strip footer/watermark lines.
  const cleaned = text
    .replace(/\f/g, '')
    .split('\n')
    .filter(line => !FOOTER_RE.test(line))
    .join('\n');

  // 2. Split into question blocks on /^QUESTION N$/ boundaries.
  const blocks = [];
  const re = /^QUESTION (\d+)\s*$/gm;
  let match;
  const indices = [];
  while ((match = re.exec(cleaned)) !== null) {
    indices.push({ number: Number(match[1]), start: match.index });
  }
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].start;
    const end = i + 1 < indices.length ? indices[i + 1].start : cleaned.length;
    blocks.push({ number: indices[i].number, raw: cleaned.slice(start, end) });
  }

  // 3. Parse each block.
  return blocks.map(parseBlock).filter(Boolean);
}

function parseBlock({ number, raw }) {
  const lines = raw.split('\n').slice(1); // drop the QUESTION N line
  const optionRe = /^\s*([A-F])\.\s+(.*)$/;
  const answerRe = /^\s*Answer:\s*([A-F]+)\s*$/;
  const explRe = /^\s*Explanation:\s*$/;

  const options = [];
  let answerLetters = null;
  let explanationLines = [];
  let mode = 'scenario'; // scenario → options → answer → explanation
  let scenarioLines = [];
  let currentOption = null;

  for (const line of lines) {
    if (mode === 'scenario' || mode === 'options') {
      const optMatch = line.match(optionRe);
      if (optMatch) {
        if (currentOption) options.push(currentOption);
        currentOption = { letter: optMatch[1], text: optMatch[2].trim() };
        mode = 'options';
        continue;
      }
    }
    const ansMatch = line.match(answerRe);
    if (ansMatch) {
      if (currentOption) { options.push(currentOption); currentOption = null; }
      answerLetters = ansMatch[1].split('');
      mode = 'answer';
      continue;
    }
    if (explRe.test(line)) {
      if (currentOption) { options.push(currentOption); currentOption = null; }
      mode = 'explanation';
      continue;
    }

    if (mode === 'scenario') {
      scenarioLines.push(line);
    } else if (mode === 'options' && currentOption) {
      const trimmed = line.trim();
      if (trimmed) currentOption.text += ' ' + trimmed;
    } else if (mode === 'explanation') {
      explanationLines.push(line);
    }
  }
  if (currentOption) options.push(currentOption);

  // 4. Split scenario into scenario + prompt (last paragraph ending with '?').
  const scenarioText = scenarioLines.join('\n').trim();
  const { scenario, prompt } = splitScenarioPrompt(scenarioText);

  // 5. Extract URLs from explanation as references.
  const explanationText = explanationLines.join('\n').trim();
  const references = Array.from(explanationText.matchAll(URL_RE)).map(m => m[0].replace(/[).,]+$/, ''));
  const explanation = explanationText.replace(URL_RE, '').replace(/\n{3,}/g, '\n\n').trim() || null;

  const isMultiSelect = /Choose (two|three|2|3)/i.test(scenarioText) || (answerLetters && answerLetters.length > 1);

  return {
    id: number,
    number,
    scenario,
    prompt,
    options,
    correctAnswers: answerLetters ?? [],
    isMultiSelect: !!isMultiSelect,
    explanation,
    references,
    needsManualAnswer: !answerLetters,
  };
}

function splitScenarioPrompt(text) {
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return { scenario: '', prompt: '' };
  const last = paragraphs[paragraphs.length - 1];
  if (last.endsWith('?')) {
    return {
      scenario: paragraphs.slice(0, -1).join('\n\n'),
      prompt: last,
    };
  }
  return { scenario: text, prompt: last };
}

const invoked = fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) {
  const text = readFileSync(TXT_PATH, 'utf8');
  const questions = parseQuestions(text);
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(questions, null, 2));
  const missing = questions.filter(q => q.needsManualAnswer).map(q => q.number);
  console.log(`Parsed ${questions.length} questions → ${OUT_PATH}`);
  if (missing.length) console.warn(`⚠ Missing answers: ${missing.join(', ')}`);
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all 8 fixture tests green.

- [ ] **Step 7: Run parser on real PDF text and sanity-check**

Run: `npm run parse`
Expected output: `Parsed 897 questions → .../data/raw-questions.json` plus `⚠ Missing answers: 13`.

Verify counts:
```bash
node -e "const q = JSON.parse(require('fs').readFileSync('data/raw-questions.json')); console.log('count:', q.length, 'multi:', q.filter(x=>x.isMultiSelect).length, 'no-answer:', q.filter(x=>x.needsManualAnswer).length)"
```
Expected: `count: 897 multi: ~97 no-answer: 1`.

- [ ] **Step 8: Manually patch Q13 answer**

Open `data/raw-questions.json`, find the record with `"number": 13`, set `"correctAnswers": ["D"]` and `"needsManualAnswer": false`. Save.

- [ ] **Step 9: Commit**

```bash
git add scripts/parse.js scripts/parse.test.js scripts/__fixtures__/sample.txt data/raw-questions.json data/saa-c03.txt
git commit -m "feat: PDF parser extracts 897 questions with edge-case handling"
```

---

## Task 3: Domain classifier — Claude Haiku per question

**Files:**
- Create: `scripts/classify.js`
- Create: `scripts/classify.test.js`

- [ ] **Step 1: Write the failing test**

Create `scripts/classify.test.js`:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — functions not exported.

- [ ] **Step 3: Implement classifier**

Create `scripts/classify.js`:

```javascript
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const IN_PATH = join(PROJECT_ROOT, 'data', 'raw-questions.json');
const OUT_PATH = join(PROJECT_ROOT, 'data', 'questions.json');

const SYSTEM = `You are an AWS certification expert. Given an AWS SAA-C03 exam question, return the single best matching exam domain as a number 1-4.

Domains:
1 = Design Secure Architectures (IAM, encryption, KMS, Secrets Manager, security groups, NACLs, WAF, Shield, Macie, GuardDuty, identity, access control).
2 = Design Resilient Architectures (Multi-AZ, multi-Region, backups, DR, failover, RDS replicas, Aurora, S3 versioning, Route 53 health checks, decoupling with SQS/SNS).
3 = Design High-Performing Architectures (caching, CloudFront, ElastiCache, EBS types, throughput, Auto Scaling for performance, EFS vs FSx, Aurora performance, read replicas for read scaling).
4 = Design Cost-Optimized Architectures (Spot, Savings Plans, Reserved Instances, S3 storage classes, Glacier, lifecycle policies, right-sizing, cost reporting).

Respond with ONLY the single digit 1, 2, 3, or 4.`;

export function buildPrompt(q) {
  const opts = q.options.map(o => `${o.letter}. ${o.text}`).join('\n');
  return `Question ${q.number}:
${q.scenario}

${q.prompt}

${opts}

Which AWS SAA-C03 domain (1=Secure, 2=Resilient, 3=High-Performing, 4=Cost-Optimized) does this question test?`;
}

export function parseDomainResponse(text) {
  if (!text) return null;
  const m = text.match(/[1-4]/);
  if (!m) return null;
  return Number(m[0]);
}

export function mergeClassifications(questions, cache) {
  return questions.map(q => cache[q.id] != null ? { ...q, domain: cache[q.id] } : q);
}

async function classifyOne(client, q, { retries = 3 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8,
        system: SYSTEM,
        messages: [{ role: 'user', content: buildPrompt(q) }],
      });
      const text = resp.content.map(b => b.text || '').join('');
      const domain = parseDomainResponse(text);
      if (domain) return domain;
      console.warn(`Q${q.number}: unparseable response "${text}", retrying`);
    } catch (e) {
      console.warn(`Q${q.number} attempt ${attempt} failed: ${e.message}`);
      if (attempt < retries) await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return null;
}

const invoked = fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Set ANTHROPIC_API_KEY env var.');
    process.exit(1);
  }
  const questions = JSON.parse(readFileSync(IN_PATH, 'utf8'));
  const cache = existsSync(OUT_PATH)
    ? Object.fromEntries(JSON.parse(readFileSync(OUT_PATH, 'utf8')).filter(q => q.domain).map(q => [q.id, q.domain]))
    : {};
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const out = mergeClassifications(questions, cache);
  let classified = 0;
  for (let i = 0; i < out.length; i++) {
    if (out[i].domain) continue;
    out[i].domain = await classifyOne(client, out[i]);
    classified++;
    if (classified % 10 === 0) {
      mkdirSync(dirname(OUT_PATH), { recursive: true });
      writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
      console.log(`Progress: ${classified} classified (${i + 1}/${out.length})`);
    }
  }
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  const dist = out.reduce((acc, q) => ((acc[q.domain] = (acc[q.domain] || 0) + 1), acc), {});
  console.log(`Done. Distribution:`, dist);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all parse + classify tests green.

- [ ] **Step 5: Run classifier on real data**

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run classify
```

Expected: progress log every 10 questions; final distribution roughly `{1: ~270, 2: ~233, 3: ~215, 4: ~179}`. Runtime ~5–10 minutes.

- [ ] **Step 6: Sanity-check distribution**

```bash
node -e "const q = JSON.parse(require('fs').readFileSync('data/questions.json')); const d = q.reduce((a,x)=>((a[x.domain]=(a[x.domain]||0)+1),a),{}); const t = q.length; for(const k of [1,2,3,4]) console.log('D'+k+':', d[k], (d[k]/t*100).toFixed(1)+'%');"
```
Expected: each domain within ±5% of target (30/26/24/20).

- [ ] **Step 7: Commit**

```bash
git add scripts/classify.js scripts/classify.test.js data/questions.json
git commit -m "feat: classify all 897 questions into 4 AWS exam domains via Haiku"
```

---

## Task 4: Test builder — partition into 14 domain-balanced tests

**Files:**
- Create: `scripts/build-tests.js`
- Create: `scripts/build-tests.test.js`

- [ ] **Step 1: Write the failing test**

Create `scripts/build-tests.test.js`:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — functions not exported.

- [ ] **Step 3: Implement test builder**

Create `scripts/build-tests.js`:

```javascript
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const IN_PATH = join(PROJECT_ROOT, 'data', 'questions.json');
const OUT_PATH = join(PROJECT_ROOT, 'public', 'tests.json');

const TOTAL_TESTS = 14;
const TEST_SIZE = 65;
const DOMAIN_QUOTA = { 1: 20, 2: 17, 3: 16, 4: 12 }; // sums to 65

export function seededShuffle(arr, seed) {
  // Mulberry32 PRNG seeded with sha256(seed).
  const hash = createHash('sha256').update(seed).digest();
  let s = hash.readUInt32BE(0);
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function partitionTests(questions) {
  const pools = { 1: [], 2: [], 3: [], 4: [] };
  for (const q of questions) {
    if (pools[q.domain]) pools[q.domain].push(q.id);
  }
  for (const d of [1, 2, 3, 4]) {
    pools[d] = seededShuffle(pools[d], `domain-${d}`);
  }

  const tests = [];
  // First 13 tests: pull quota from each pool.
  for (let i = 0; i < TOTAL_TESTS - 1; i++) {
    const ids = [];
    for (const d of [1, 2, 3, 4]) {
      ids.push(...pools[d].splice(0, DOMAIN_QUOTA[d]));
    }
    while (ids.length < TEST_SIZE) {
      const next = [1, 2, 3, 4].find(d => pools[d].length > 0);
      if (!next) break;
      ids.push(pools[next].shift());
    }
    tests.push({
      id: i + 1,
      title: `Practice Test ${i + 1}`,
      questionIds: seededShuffle(ids, `test-${i + 1}`),
    });
  }

  // Final test: everything left.
  const remainder = [1, 2, 3, 4].flatMap(d => pools[d]);
  tests.push({
    id: TOTAL_TESTS,
    title: `Practice Test ${TOTAL_TESTS} (Final, ${remainder.length} Qs)`,
    questionIds: seededShuffle(remainder, `test-${TOTAL_TESTS}`),
  });

  return tests;
}

const invoked = fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) {
  const questions = JSON.parse(readFileSync(IN_PATH, 'utf8'));
  const tests = partitionTests(questions);
  const byId = new Map(questions.map(q => [q.id, q]));
  const out = {
    version: '1.0',
    totalTests: TOTAL_TESTS,
    durationMinutes: 130,
    passPercent: 72,
    tests,
    questions: questions.map(q => ({
      id: q.id,
      number: q.number,
      scenario: q.scenario,
      prompt: q.prompt,
      options: q.options,
      correctAnswers: q.correctAnswers,
      isMultiSelect: q.isMultiSelect,
      explanation: q.explanation,
      references: q.references,
      domain: q.domain,
    })),
  };
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out));
  console.log(`Built ${tests.length} tests, ${questions.length} questions → ${OUT_PATH}`);
  for (const t of tests) {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const id of t.questionIds) counts[byId.get(id).domain]++;
    console.log(`  ${t.title}: D1=${counts[1]} D2=${counts[2]} D3=${counts[3]} D4=${counts[4]} (${t.questionIds.length} Qs)`);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all parse + classify + build-tests tests green.

- [ ] **Step 5: Build real `tests.json`**

Run: `npm run build-tests`
Expected: `Built 14 tests, 897 questions → .../public/tests.json` plus per-test domain breakdown.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-tests.js scripts/build-tests.test.js public/tests.json
git commit -m "feat: partition 897 questions into 14 domain-balanced tests"
```

---

## Task 5: Runtime — HTML scaffold, hash routing, data loading

**Files:**
- Create: `public/index.html`
- Create: `public/app.js`
- Create: `public/styles.css`

- [ ] **Step 1: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SAA-C03 Practice</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="topbar">
    <a href="#/dashboard" class="brand">SAA-C03 Practice</a>
    <div id="topbar-right"></div>
  </header>
  <main id="root">Loading…</main>
  <script type="module" src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create styles.css (baseline)**

```css
* { box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; background: #f5f6f8; color: #1a1a1a; }
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.5rem; background: #232f3e; color: #fff; }
.brand { color: #ff9900; font-weight: 700; text-decoration: none; }
main { padding: 1.5rem; max-width: 960px; margin: 0 auto; }
button { font: inherit; cursor: pointer; padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 4px; background: #fff; }
button.primary { background: #ff9900; color: #fff; border-color: #ff9900; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
.card { background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 1rem; margin-bottom: 1rem; }
.badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 12px; font-size: 0.85rem; }
.badge.done { background: #d4edda; color: #155724; }
.badge.in-progress { background: #fff3cd; color: #856404; }
.badge.not-started { background: #e2e3e5; color: #383d41; }
.badge.pass { background: #d4edda; color: #155724; }
.badge.fail { background: #f8d7da; color: #721c24; }
.timer { font-variant-numeric: tabular-nums; font-weight: 600; }
.timer.warning { color: #d9534f; }
```

- [ ] **Step 3: Create app.js with router + data loader (screens stubbed)**

```javascript
const STORE_KEY = 'saa-c03-progress';
let DATA = null;
let PROGRESS = null;

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || { tests: {} }; }
  catch { return { tests: {} }; }
}
function saveProgress() {
  localStorage.setItem(STORE_KEY, JSON.stringify(PROGRESS));
}

async function loadData() {
  const res = await fetch('tests.json');
  if (!res.ok) throw new Error('Failed to load tests.json');
  return res.json();
}

function render(html) {
  document.getElementById('root').innerHTML = html;
}

function route() {
  const hash = location.hash || '#/dashboard';
  const [, screen, arg] = hash.split('/');
  if (screen === 'test' && arg) renderRunner(Number(arg));
  else if (screen === 'result' && arg) renderResult(Number(arg));
  else renderDashboard();
}

function renderDashboard() {
  render('<h1>Dashboard</h1><p>Tests will be listed here.</p>');
}
function renderRunner(testId) {
  render(`<h1>Test ${testId}</h1><p>Runner placeholder.</p>`);
}
function renderResult(testId) {
  render(`<h1>Result ${testId}</h1><p>Result placeholder.</p>`);
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', async () => {
  try {
    DATA = await loadData();
    PROGRESS = loadProgress();
    route();
  } catch (e) {
    render(`<p>Error: ${e.message}</p>`);
  }
});
```

- [ ] **Step 4: Smoke test**

Run: `npm run serve` (background). Open `http://localhost:8080` in a browser. Verify the page loads, header renders, navigation to `#/dashboard`, `#/test/3`, `#/result/3` all render the placeholder text.

- [ ] **Step 5: Commit**

```bash
git add public/index.html public/app.js public/styles.css
git commit -m "feat: app scaffold with hash router and data loader"
```

---

## Task 6: Runtime — Dashboard screen

**Files:**
- Modify: `public/app.js` (replace `renderDashboard`)
- Modify: `public/styles.css` (append dashboard rules)

- [ ] **Step 1: Replace renderDashboard in app.js**

Replace the existing `renderDashboard` function with:

```javascript
function renderDashboard() {
  const totalPassed = Object.values(PROGRESS.tests).filter(t => t.bestPercent >= DATA.passPercent).length;
  const cards = DATA.tests.map(t => {
    const p = PROGRESS.tests[t.id] || { status: 'not-started' };
    const status = p.status || 'not-started';
    const score = p.bestScore != null ? `Best: ${p.bestScore}/${t.questionIds.length} (${p.bestPercent}%)` : 'No attempts yet';
    const passBadge = p.bestPercent >= DATA.passPercent
      ? '<span class="badge pass">Pass ✓</span>'
      : p.bestPercent != null ? '<span class="badge fail">Fail ✗</span>' : '';
    const last = p.lastAttempt ? `Last: ${new Date(p.lastAttempt).toLocaleDateString()}` : '';
    const action = status === 'in-progress' ? 'Resume' : status === 'done' ? 'Retake' : 'Start';
    return `
      <div class="card test-card">
        <div class="test-card-header">
          <h3>${t.title}</h3>
          <span class="badge ${status}">${status.replace('-', ' ')}</span>
        </div>
        <p>${score} ${passBadge}</p>
        <p class="muted">${last}</p>
        <a href="#/test/${t.id}"><button class="primary">${action}</button></a>
      </div>
    `;
  }).join('');
  render(`
    <h1>Practice Tests</h1>
    <p>${totalPassed} of ${DATA.totalTests} tests passed.</p>
    <div class="test-grid">${cards}</div>
    <p><a href="#" id="reset-link">Reset all progress</a></p>
  `);
  document.getElementById('reset-link').addEventListener('click', e => {
    e.preventDefault();
    if (confirm('Erase all progress?')) {
      PROGRESS = { tests: {} };
      saveProgress();
      route();
    }
  });
}
```

- [ ] **Step 2: Append dashboard styles to styles.css**

```css
.test-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
.test-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.test-card-header h3 { margin: 0; font-size: 1.05rem; }
.muted { color: #888; font-size: 0.85rem; }
```

- [ ] **Step 3: Smoke test**

Reload the page. Verify:
- 14 cards visible, each showing "Not Started".
- "Reset all progress" link visible.
- Clicking a "Start" button navigates to `#/test/N` (placeholder for now).

- [ ] **Step 4: Commit**

```bash
git add public/app.js public/styles.css
git commit -m "feat: dashboard lists 14 tests with status/score badges"
```

---

## Task 7: Runtime — Test runner (timer, navigation, flags, review)

**Files:**
- Modify: `public/app.js` (replace `renderRunner`, add runner helpers)
- Modify: `public/styles.css` (append runner styles)

- [ ] **Step 1: Replace renderRunner and add helpers in app.js**

Replace the existing `renderRunner` stub with the following block (which also adds the helper functions `startOrResumeRunner`, `persistRunnerState`, `getQuestion`, `formatTimeLeft`, `tickTimer`, `escapeHtml`, `renderReview`, `submitTest`, and the module-level `RUNNER` variable):

```javascript
let RUNNER = null; // { testId, current, answers, flags, startedAt, timerId, endsAt }

function startOrResumeRunner(testId) {
  const test = DATA.tests.find(t => t.id === testId);
  const persisted = PROGRESS.tests[testId]?.inProgressState;
  if (persisted) {
    RUNNER = { ...persisted, testId };
  } else {
    const durationMs = DATA.durationMinutes * 60 * 1000;
    RUNNER = {
      testId,
      current: 0,
      answers: Object.fromEntries(test.questionIds.map(id => [id, []])),
      flags: {},
      startedAt: Date.now(),
      endsAt: Date.now() + durationMs,
    };
    PROGRESS.tests[testId] = PROGRESS.tests[testId] || {};
    PROGRESS.tests[testId].status = 'in-progress';
    PROGRESS.tests[testId].inProgressState = RUNNER;
    saveProgress();
  }
}

function persistRunnerState() {
  PROGRESS.tests[RUNNER.testId].inProgressState = RUNNER;
  saveProgress();
}

function getQuestion(id) {
  return DATA.questions.find(q => q.id === id);
}

function formatTimeLeft(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function tickTimer() {
  const el = document.getElementById('timer');
  if (!el || !RUNNER) return;
  const left = RUNNER.endsAt - Date.now();
  el.textContent = formatTimeLeft(left);
  el.classList.toggle('warning', left < 10 * 60 * 1000);
  if (left <= 0) submitTest();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderRunner(testId) {
  const test = DATA.tests.find(t => t.id === testId);
  if (!test) { render('<p>Test not found.</p>'); return; }
  if (!RUNNER || RUNNER.testId !== testId) startOrResumeRunner(testId);

  const qId = test.questionIds[RUNNER.current];
  const q = getQuestion(qId);
  const selected = RUNNER.answers[qId] || [];
  const inputType = q.isMultiSelect ? 'checkbox' : 'radio';
  const helper = q.isMultiSelect
    ? `<p class="muted">${/Choose three/i.test(q.prompt + ' ' + q.scenario) ? 'Choose three.' : 'Choose two.'}</p>`
    : '';

  const opts = q.options.map(o => `
    <label class="option">
      <input type="${inputType}" name="opt" value="${o.letter}" ${selected.includes(o.letter) ? 'checked' : ''} />
      <span><strong>${o.letter}.</strong> ${escapeHtml(o.text)}</span>
    </label>
  `).join('');

  const grid = test.questionIds.map((id, idx) => {
    const ans = (RUNNER.answers[id] || []).length > 0;
    const flagged = RUNNER.flags[id];
    const cls = ['grid-cell',
      idx === RUNNER.current ? 'current' : '',
      ans ? 'answered' : '',
      flagged ? 'flagged' : ''].filter(Boolean).join(' ');
    return `<button class="${cls}" data-idx="${idx}">${idx + 1}</button>`;
  }).join('');

  render(`
    <div class="runner">
      <div class="runner-topbar">
        <div>${escapeHtml(test.title)}</div>
        <div>Question ${RUNNER.current + 1} of ${test.questionIds.length}</div>
        <div class="timer" id="timer">${formatTimeLeft(RUNNER.endsAt - Date.now())}</div>
      </div>
      <section class="question">
        <p class="scenario">${escapeHtml(q.scenario).replace(/\n/g, '<br>')}</p>
        <p class="prompt"><strong>${escapeHtml(q.prompt)}</strong></p>
        ${helper}
        <form id="opts">${opts}</form>
      </section>
      <footer class="runner-footer">
        <button id="prev" ${RUNNER.current === 0 ? 'disabled' : ''}>Previous</button>
        <button id="flag">${RUNNER.flags[qId] ? '★ Flagged' : '☆ Flag'}</button>
        <button id="next" ${RUNNER.current === test.questionIds.length - 1 ? 'disabled' : ''}>Next</button>
        <button id="review" class="primary">Review &amp; Submit</button>
      </footer>
      <aside class="grid">${grid}</aside>
    </div>
  `);

  document.getElementById('opts').addEventListener('change', e => {
    const letter = e.target.value;
    if (q.isMultiSelect) {
      const set = new Set(RUNNER.answers[qId]);
      e.target.checked ? set.add(letter) : set.delete(letter);
      RUNNER.answers[qId] = [...set].sort();
    } else {
      RUNNER.answers[qId] = [letter];
    }
    persistRunnerState();
    renderRunner(testId);
  });
  document.getElementById('prev').addEventListener('click', () => { RUNNER.current--; persistRunnerState(); renderRunner(testId); });
  document.getElementById('next').addEventListener('click', () => { RUNNER.current++; persistRunnerState(); renderRunner(testId); });
  document.getElementById('flag').addEventListener('click', () => {
    RUNNER.flags[qId] = !RUNNER.flags[qId];
    persistRunnerState();
    renderRunner(testId);
  });
  document.getElementById('review').addEventListener('click', () => renderReview(testId));
  document.querySelectorAll('.grid-cell').forEach(btn =>
    btn.addEventListener('click', () => { RUNNER.current = Number(btn.dataset.idx); persistRunnerState(); renderRunner(testId); }));

  if (!window.__TIMER_ID__) window.__TIMER_ID__ = setInterval(tickTimer, 1000);
}

function renderReview(testId) {
  const test = DATA.tests.find(t => t.id === testId);
  const rows = test.questionIds.map((id, idx) => {
    const answered = (RUNNER.answers[id] || []).length > 0;
    const flagged = RUNNER.flags[id];
    return `<li><a href="#" data-idx="${idx}">Q${idx + 1}</a> — ${answered ? 'Answered' : '<em>Unanswered</em>'} ${flagged ? '★' : ''}</li>`;
  }).join('');
  render(`
    <h1>Review &amp; Submit</h1>
    <ol>${rows}</ol>
    <p><button id="back">Back to test</button> <button id="submit" class="primary">Submit Test</button></p>
  `);
  document.querySelectorAll('a[data-idx]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    RUNNER.current = Number(a.dataset.idx);
    renderRunner(testId);
  }));
  document.getElementById('back').addEventListener('click', () => renderRunner(testId));
  document.getElementById('submit').addEventListener('click', () => {
    if (confirm('Submit this test now?')) submitTest();
  });
}

function submitTest() {
  const test = DATA.tests.find(t => t.id === RUNNER.testId);
  let correct = 0;
  for (const id of test.questionIds) {
    const q = getQuestion(id);
    const given = (RUNNER.answers[id] || []).slice().sort();
    const exp = (q.correctAnswers || []).slice().sort();
    if (given.length && given.length === exp.length && given.every((v, i) => v === exp[i])) correct++;
  }
  const total = test.questionIds.length;
  const pct = Math.round((correct / total) * 100);
  const attempt = {
    score: correct,
    total,
    percent: pct,
    answers: RUNNER.answers,
    flags: RUNNER.flags,
    startedAt: RUNNER.startedAt,
    finishedAt: Date.now(),
  };
  const prev = PROGRESS.tests[test.id] || {};
  PROGRESS.tests[test.id] = {
    status: 'done',
    bestScore: Math.max(prev.bestScore || 0, correct),
    bestPercent: Math.max(prev.bestPercent || 0, pct),
    lastAttempt: new Date().toISOString(),
    attempts: (prev.attempts || 0) + 1,
    inProgressState: null,
    lastResult: attempt,
  };
  saveProgress();
  clearInterval(window.__TIMER_ID__);
  window.__TIMER_ID__ = null;
  RUNNER = null;
  location.hash = `#/result/${test.id}`;
}
```

- [ ] **Step 2: Append runner styles to styles.css**

```css
.runner-topbar { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #fff; border-radius: 6px; margin-bottom: 1rem; }
.question .scenario { white-space: pre-wrap; }
.question .prompt { font-size: 1.05rem; }
.option { display: flex; gap: 0.5rem; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 0.4rem; cursor: pointer; }
.option:has(input:checked) { background: #eef4ff; border-color: #4a8eff; }
.runner-footer { display: flex; gap: 0.5rem; margin: 1rem 0; }
.runner-footer button { flex: 0 0 auto; }
.runner-footer .primary { margin-left: auto; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(36px, 1fr)); gap: 0.25rem; padding: 0.5rem; background: #fff; border-radius: 6px; }
.grid-cell { padding: 0.25rem 0; border: 1px solid #ccc; background: #fafafa; font-size: 0.85rem; }
.grid-cell.answered { background: #cfe2ff; }
.grid-cell.flagged { border-color: #ff9900; }
.grid-cell.current { outline: 2px solid #232f3e; }
```

- [ ] **Step 3: Smoke test**

Reload page. Click Start on Test 1.
- Verify: scenario + options render, timer counts down, options are radio (or checkbox if multi-select), Flag toggles a star, Prev/Next navigate, grid sidebar highlights answered cells, Review screen lists all 65 with status, submit lands on the result placeholder, dashboard shows the test as Done with a score.
- Reload mid-test (after answering 5 Qs): dashboard shows "In Progress", Resume returns to the same Q with answers preserved.

- [ ] **Step 4: Commit**

```bash
git add public/app.js public/styles.css
git commit -m "feat: test runner with timer, navigation, flags, review, submit"
```

---

## Task 8: Runtime — Result screen

**Files:**
- Modify: `public/app.js` (replace `renderResult`)
- Modify: `public/styles.css` (append result styles)

- [ ] **Step 1: Replace renderResult in app.js**

```javascript
function renderResult(testId) {
  const test = DATA.tests.find(t => t.id === testId);
  const prog = PROGRESS.tests[testId];
  if (!prog || !prog.lastResult) { render('<p>No result yet.</p>'); return; }
  const r = prog.lastResult;
  const pass = r.percent >= DATA.passPercent;
  const durationMin = Math.round((r.finishedAt - r.startedAt) / 60000);

  const byDomain = { 1: { correct: 0, total: 0 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 }, 4: { correct: 0, total: 0 } };
  for (const id of test.questionIds) {
    const q = getQuestion(id);
    const given = (r.answers[id] || []).slice().sort();
    const exp = q.correctAnswers.slice().sort();
    const isRight = given.length && given.length === exp.length && given.every((v, i) => v === exp[i]);
    byDomain[q.domain].total++;
    if (isRight) byDomain[q.domain].correct++;
  }

  const domainNames = { 1: 'Secure', 2: 'Resilient', 3: 'High-Performing', 4: 'Cost-Optimized' };
  const domainBars = Object.entries(byDomain).map(([d, v]) => {
    const pct = v.total ? Math.round((v.correct / v.total) * 100) : 0;
    return `<div class="domain-row"><span>D${d} ${domainNames[d]}</span><div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div><span>${v.correct}/${v.total} (${pct}%)</span></div>`;
  }).join('');

  const filters = `
    <div class="filters">
      <button data-filter="all" class="primary">All</button>
      <button data-filter="wrong">Wrong only</button>
      <button data-filter="flagged">Flagged only</button>
    </div>`;

  const rows = test.questionIds.map((id, idx) => {
    const q = getQuestion(id);
    const given = (r.answers[id] || []).slice().sort();
    const exp = q.correctAnswers.slice().sort();
    const isRight = given.length && given.length === exp.length && given.every((v, i) => v === exp[i]);
    const flagged = r.flags && r.flags[id];
    const optHtml = q.options.map(o => {
      const isGiven = given.includes(o.letter);
      const isCorrect = exp.includes(o.letter);
      const cls = isCorrect ? 'opt-correct' : isGiven ? 'opt-wrong' : '';
      return `<li class="${cls}"><strong>${o.letter}.</strong> ${escapeHtml(o.text)}${isCorrect ? ' ✓' : ''}${isGiven && !isCorrect ? ' ✗' : ''}</li>`;
    }).join('');
    const refs = (q.references || []).map(u => `<li><a href="${u}" target="_blank" rel="noopener">${u}</a></li>`).join('');
    return `
      <details class="card result-q" data-wrong="${!isRight}" data-flagged="${!!flagged}">
        <summary>
          Q${idx + 1} — ${isRight ? '<span class="badge pass">Correct</span>' : '<span class="badge fail">Incorrect</span>'}
          ${flagged ? '★' : ''} <span class="muted">D${q.domain} ${domainNames[q.domain]}</span>
        </summary>
        <p class="scenario">${escapeHtml(q.scenario).replace(/\n/g, '<br>')}</p>
        <p><strong>${escapeHtml(q.prompt)}</strong></p>
        <ul class="opts">${optHtml}</ul>
        <p><strong>Your answer:</strong> ${given.join(', ') || '—'} <strong>Correct:</strong> ${exp.join(', ') || 'N/A'}</p>
        ${q.explanation ? `<p class="explanation">${escapeHtml(q.explanation).replace(/\n/g, '<br>')}</p>` : ''}
        ${refs ? `<ul class="refs">${refs}</ul>` : ''}
      </details>`;
  }).join('');

  render(`
    <h1>${escapeHtml(test.title)} — Result</h1>
    <div class="card result-summary">
      <div class="score"><strong>${r.score} / ${r.total}</strong> (${r.percent}%)</div>
      <div>${pass ? '<span class="badge pass">Pass ✓</span>' : '<span class="badge fail">Fail ✗</span>'}</div>
      <div class="muted">Time taken: ${durationMin} min</div>
    </div>
    <div class="card">
      <h3>By domain</h3>
      ${domainBars}
    </div>
    ${filters}
    <div id="result-list">${rows}</div>
    <p><a href="#/dashboard"><button>Back to Dashboard</button></a> <a href="#/test/${testId}"><button class="primary">Retake</button></a></p>
  `);

  document.querySelectorAll('.filters button').forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    document.querySelectorAll('.filters button').forEach(x => x.classList.toggle('primary', x === b));
    document.querySelectorAll('.result-q').forEach(card => {
      const wrong = card.dataset.wrong === 'true';
      const flagged = card.dataset.flagged === 'true';
      card.style.display = (f === 'all') || (f === 'wrong' && wrong) || (f === 'flagged' && flagged) ? '' : 'none';
    });
  }));
}
```

- [ ] **Step 2: Append result styles to styles.css**

```css
.result-summary { display: flex; gap: 1.5rem; align-items: center; }
.result-summary .score { font-size: 1.5rem; }
.domain-row { display: grid; grid-template-columns: 12rem 1fr 8rem; gap: 0.5rem; align-items: center; margin: 0.3rem 0; }
.bar { background: #eee; height: 12px; border-radius: 6px; overflow: hidden; }
.bar-fill { background: #4a8eff; height: 100%; }
.filters { display: flex; gap: 0.5rem; margin: 1rem 0; }
.opts { list-style: none; padding: 0; }
.opts li { padding: 0.3rem 0.5rem; border-left: 3px solid transparent; }
.opt-correct { background: #d4edda; border-left-color: #28a745; }
.opt-wrong { background: #f8d7da; border-left-color: #dc3545; }
.explanation { background: #f0f4f8; padding: 0.75rem; border-radius: 4px; }
.refs { font-size: 0.85rem; }
.result-q summary { cursor: pointer; padding: 0.5rem 0; }
```

- [ ] **Step 3: Smoke test**

Complete a test (or submit an empty test for a fast fail-case). Verify:
- Score header shows correct/total and pass/fail badge.
- Domain breakdown bars match totals.
- Per-question cards expand to show your selected answer, correct answer (green), wrong selection (red), and full explanation + reference links if present.
- Filter buttons (All / Wrong only / Flagged only) correctly show/hide cards.
- "Retake" returns to the same test.
- Dashboard shows the completed test with a Pass/Fail badge.

- [ ] **Step 4: Commit**

```bash
git add public/app.js public/styles.css
git commit -m "feat: result screen with score, domain breakdown, per-question review"
```

---

## Task 9: Polish — responsive layout, keyboard shortcuts, final smoke

**Files:**
- Modify: `public/styles.css`
- Modify: `public/app.js`

- [ ] **Step 1: Append responsive breakpoints to styles.css**

```css
@media (max-width: 720px) {
  .runner-topbar { flex-wrap: wrap; gap: 0.5rem; }
  .test-grid { grid-template-columns: 1fr; }
  .domain-row { grid-template-columns: 8rem 1fr 6rem; }
}
```

- [ ] **Step 2: Add keyboard shortcuts in `renderRunner`**

Inside `renderRunner`, after the existing `document.querySelectorAll('.grid-cell')` listener, add:

```javascript
if (window.__KEY_HANDLER__) document.removeEventListener('keydown', window.__KEY_HANDLER__);
const keyHandler = e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowLeft' && RUNNER && RUNNER.current > 0) { RUNNER.current--; persistRunnerState(); renderRunner(testId); }
  if (e.key === 'ArrowRight' && RUNNER && RUNNER.current < test.questionIds.length - 1) { RUNNER.current++; persistRunnerState(); renderRunner(testId); }
  if (e.key === 'f' && RUNNER) { RUNNER.flags[qId] = !RUNNER.flags[qId]; persistRunnerState(); renderRunner(testId); }
};
window.__KEY_HANDLER__ = keyHandler;
document.addEventListener('keydown', keyHandler);
```

- [ ] **Step 3: Final manual smoke test (10 minutes)**

Walk through each acceptance criterion from the spec:
- Dashboard shows 14 tests with statuses.
- Start Test 1 → timer counts down from 02:10:00.
- Answer 5 Qs, flag 2, refresh page → status shows "In Progress", Resume restores state and answers.
- Skip to Question 65 via the grid sidebar.
- Click Review & Submit → list shows 5 Answered, 60 Unanswered.
- Submit → result screen shows score and domain breakdown.
- Filter to "Wrong only" → unanswered Qs appear.
- Expand a question → explanation text + reference links work.
- Retake brings up the same test with progress wiped.
- "Reset all progress" link clears everything.
- Resize browser to phone width → layout is usable.

- [ ] **Step 4: Commit**

```bash
git add public/styles.css public/app.js
git commit -m "polish: responsive layout and keyboard navigation"
```

---

## Task 10: README + deployment notes

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Expand README**

Replace `README.md` content with:

```markdown
# SAA-C03 Practice Quiz App

A static-site practice quiz mirroring the AWS Certified Solutions Architect – Associate (SAA-C03) exam, built from a Passleader PDF dump.

- 14 fixed practice tests, 65 questions each (final test = 52 Qs).
- Domain-balanced per official AWS weights (30/26/24/20).
- 130-minute timer, single-answer + multi-answer support, flag-for-review, full review screen, per-question explanation + references.
- Progress saved in browser `localStorage`. No accounts, no backend.

## Prerequisites

- macOS or Linux with Node.js 20+.
- `pdftotext` (from poppler): `brew install poppler`.
- An Anthropic API key (only needed to rebuild from the PDF).

## Setup

```bash
npm install
cp .env.example .env   # add ANTHROPIC_API_KEY
```

## Build pipeline

```bash
npm run extract-pdf    # PDF → data/saa-c03.txt
npm run parse          # → data/raw-questions.json
npm run classify       # → data/questions.json (calls Claude Haiku)
npm run build-tests    # → public/tests.json (deployable)
# or all of the above:
npm run build
```

## Run locally

```bash
npm run serve
# then open http://localhost:8080
```

## Deploy

GitHub Pages: in repo settings, set Pages source to `main` branch, `/public` folder. Commit `public/tests.json` so the deployed site has the data.

## Repository visibility

The source PDF is third-party watermarked content. Recommendation: keep this repository **private**, or remove `data/` and `public/tests.json` before pushing to a public repo.

## Tests

```bash
npm test
```

## Architecture

See `docs/superpowers/specs/2026-05-14-saa-c03-quiz-app-design.md` and `docs/superpowers/plans/2026-05-14-saa-c03-quiz-app.md`.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: expand README with build, run, deploy instructions"
```

---

## Acceptance Criteria

- `npm test` passes all unit tests (parser + classifier + builder).
- `npm run build` succeeds end-to-end (with API key set) and produces `public/tests.json` with 14 tests covering 897 questions.
- `npm run serve` serves the app at `http://localhost:8080`.
- Manually verified each spec screen and persistence behaviour per the smoke test in Task 9.
- Source spec at `docs/superpowers/specs/2026-05-14-saa-c03-quiz-app-design.md` fully covered.