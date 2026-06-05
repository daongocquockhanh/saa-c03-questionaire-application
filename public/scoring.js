// Scoring for quiz questions. Used by both the practice-test runner and the
// module quizzes in app.js, and unit-tested in scripts/scoring.test.js.
//
// PARTIAL CREDIT (study-tool rule, NOT the real AWS exam rule):
// A multi-answer question is worth 1 point split evenly across its correct
// answers. You earn credit for each correct answer you select; wrong picks are
// not penalized. So "choose 2" with one right + one wrong = 0.5.
// The real AWS exam is all-or-nothing (no partial credit) — this is more
// lenient on purpose, to show progress while studying.

// Returns a fraction in [0, 1]: (correct answers selected) / (total correct).
export function scoreQuestion(correctAnswers, given) {
  const exp = correctAnswers || [];
  if (exp.length === 0) return 0;
  const picked = new Set(given || []);
  let hit = 0;
  for (const letter of exp) if (picked.has(letter)) hit++;
  return hit / exp.length;
}

// Display classification derived from the score:
//   'correct' = full credit, 'partial' = some credit, 'wrong' = none.
export function verdict(correctAnswers, given) {
  const s = scoreQuestion(correctAnswers, given);
  if (s === 1) return 'correct';
  if (s === 0) return 'wrong';
  return 'partial';
}

// Small seeded PRNG (mulberry32) so unscored picks are deterministic per seed.
function mulberry32(seed) {
  let a = seed >>> 0 || 1;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Real SAA-C03 scores only 50 of 65 questions; 15 are unscored (experimental).
// Returns `count` question ids that DON'T count, chosen by a seeded shuffle so
// the set is stable per `seed` (use the test id) but spread across the exam.
export function pickUnscored(questionIds, seed, count) {
  const ids = (questionIds || []).slice();
  const n = Math.min(count, ids.length);
  const rand = mulberry32(seed);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, n);
}
