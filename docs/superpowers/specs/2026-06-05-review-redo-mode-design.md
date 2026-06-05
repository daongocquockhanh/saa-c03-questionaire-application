# Per-test Review + Redo + test-level flagging — design

Date: 2026-06-05 (revised through 2026-06-06)

## Goal

For each practice test, let the learner review and redo the questions they got
**wrong or left unanswered** (and the ones they flagged) — active recall scoped
to that test. Plus a whole-test flag (bookmark) on the dashboard.

Review is a **sub-page of each practice test**, not a separate top-nav section.
Source is practice tests only (module quizzes are excluded).

## Data model (localStorage, under `saa-c03-progress`)

```
PROGRESS.tests[testId].lastResult.answers  // existing: { [id]: [letters] }
PROGRESS.tests[testId].lastResult.flags    // existing: { [id]: bool }
PROGRESS.tests[testId].reviewFixed         // NEW: [ids] corrected during redo
PROGRESS.flaggedTests                      // NEW: [testId] whole-test bookmark
```

No global per-question store. Each test's review set is derived on the fly from
that test's saved attempt, so there is nothing to migrate.

## Per-test derivation (`testReviewData(testId)`)

- `answers`/`flags` from `lastResult`.
- **To review/redo** = `questionIds` where `verdict(correctAnswers, answers[id] || [])
  !== 'correct'` (wrong-answered, partial, or unanswered), **minus** `reviewFixed`.
- **Flagged** = `questionIds` where `flags[id]`.

## Redo

- Answerable list; on check, compute `verdict`. If fully correct → add id to
  `reviewFixed` (leaves the review set); if not → remove it. **Recorded test
  score/percent never changes.**
- The on-screen list stays frozen after a check (so the revealed answer remains
  visible); counts update live; the item is gone on the next fresh visit.

## UI

- **No top-nav entry.** Reached from each test:
  - Dashboard test card shows a `Review & Redo` button when the test has an attempt.
  - Result page shows a `Review & Redo wrong/unanswered` button.
- Route: `#/review/<testId>` → `renderReviseTest(testId)`.
- Tabs: **Sai & chưa trả lời (N)** (wrong + unanswered) | **Đã gắn cờ (N)** (flagged).
- Modes: **Read** (shows your actual answer — blank for unanswered, marked ✗ —
  plus correct answer + explanation) | **Redo** (answer, then check).
- Reuses `renderQuizItem` via a synthetic `MQUIZ` (`moduleId:'__revise__'`).
- Read mode does NOT pre-fill unanswered questions with the correct answer (that
  earlier made blanks look like ✓ "correct").

## Test-level flag (dashboard)

- ⭐ toggle on each test card → `flaggedTests`.
- Dashboard filter: **All | Flagged** tests.

## Pure, unit-tested core (`public/review.js`)

- `normalizeFlagList(arr)` → deduped, sorted.
- `toggleInList(arr, id)` → add/remove id, new array.
- `subtractIds(ids, remove)` → ids minus remove, order preserved (wrong minus fixed).

Derivation, rendering, and wiring live in `app.js` and are browser-verified.

## Out of scope

- Spaced-repetition scheduling.
- Cross-device sync (localStorage is per-device).
- Reverting partial credit or the 15-unscored behavior.
- Review sourced from module quizzes.
