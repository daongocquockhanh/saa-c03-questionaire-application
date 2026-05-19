import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const IN_PATH = join(PROJECT_ROOT, 'data', 'questions.json');
const OUT_PATH = join(PROJECT_ROOT, 'public', 'tests.json');

export const TOTAL_TESTS = 50;
export const TEST_SIZE = 65;
export const DOMAIN_QUOTA = { 1: 20, 2: 17, 3: 16, 4: 12 };

export function seededShuffle(arr, seed) {
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

  const tests = [];
  for (let i = 0; i < TOTAL_TESTS; i++) {
    const ids = [];
    for (const d of [1, 2, 3, 4]) {
      const shuffled = seededShuffle(pools[d], `test-${i + 1}-d${d}`);
      ids.push(...shuffled.slice(0, DOMAIN_QUOTA[d]));
    }
    tests.push({
      id: i + 1,
      title: `Practice Test ${i + 1}`,
      questionIds: seededShuffle(ids, `test-${i + 1}-order`),
    });
  }

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
      tip: q.tip,
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
