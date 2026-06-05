# Review + Redo mode + test-level flagging — design

Date: 2026-06-05

## Goal

Let the learner revisit the questions they got wrong or flagged, across *all*
practice tests and module quizzes, and redo them (active recall). Add a
whole-test flag (bookmark), parallel to the existing per-question flag.

Per-test result filters (`Wrong only` / `Flagged only`) already exist on the
result page. This feature adds the missing **global** + **redo** + **test-flag**
pieces.

## Data model (localStorage, under existing `saa-c03-progress`)

```
PROGRESS.questionStats   = { [questionId]: { verdict, given } }
                           verdict ∈ 'correct' | 'partial' | 'wrong'
                           given   = last selected letters, e.g. ['A','C']
PROGRESS.flaggedQuestions = [ questionId, ... ]   // global, persistent
PROGRESS.flaggedTests     = [ testId, ... ]       // NEW: whole-test bookmark
```

- Defaults created in `loadProgress()`.
- **Backfill once** (when `questionStats` is absent): walk each test's latest
  attempt (`lastResult.answers`) → `verdict(correctAnswers, given)`; mark module
  `wrong` lists as `{verdict:'wrong', given:[]}` (mapped number→id); seed
  `flaggedQuestions` from attempt `flags`.
- Updated on every submit/check: practice test (`submitTest`), module quiz
  (`saveModuleResult`), redo (per-question check).

## Pools

- **Wrong pool** = ids where `questionStats[id].verdict !== 'correct'`.
- **Flagged pool** = `flaggedQuestions` (still-existing ids).
- Getting a question fully right later overwrites its verdict → it leaves the
  wrong pool. Pool shrinks as you improve.

## UI

### Review page — `#/review` → `renderRevise()` (new nav item "Review")

- Filter tabs: **Wrong (N)** | **Flagged (N)**.
- Mode toggle: **Read** (answers + explanation shown) | **Redo** (answer, then
  check). Both reuse `renderQuizItem` via a synthetic `MQUIZ` (`moduleId:'__revise__'`).
- Empty state when a pool is empty.

### Redo

- Same question set, answerable. On check → compute `verdict`, write
  `questionStats[id]`, `saveProgress()`, re-render. No test/module progress
  written; no 15-unscored (that is only for full 65-question exams).

### Test-level flag

- ⭐ toggle button on each dashboard test card → toggles `flaggedTests`.
- Dashboard filter: **All | Flagged** tests.

### Per-question flag → global

- In-test flag handlers also update `flaggedQuestions` (so the Review flagged
  pool fills immediately, persists without submitting).

## Pure, unit-tested core (`public/review.js`)

- `wrongPool(questionStats)` → sorted ids with verdict ≠ 'correct'.
- `normalizeFlagList(arr)` → deduped, sorted.
- `toggleInList(arr, id)` → add/remove id, returns new array.

Backfill, rendering, and wiring live in `app.js` and are browser-verified.

## Testing

- TDD the three pure functions in `scripts/review.test.js`.
- Browser-verify: Review page lists wrong/flagged, Redo updates pool, test star
  toggles + filter, in-test flag reaches Review.

## Out of scope

- Spaced-repetition scheduling / SM-2.
- Cross-device sync.
- Reverting partial credit or the 15-unscored behavior.
