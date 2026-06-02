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
