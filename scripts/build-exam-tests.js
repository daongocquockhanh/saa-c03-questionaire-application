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
    expectedCount: 97,
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
  if (cfg.expectedCount != null && questions.length !== cfg.expectedCount) {
    throw new Error(`Expected ${cfg.expectedCount} questions for ${code}, got ${questions.length}`);
  }
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
