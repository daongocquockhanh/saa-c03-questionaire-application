# SAA-C03 Practice Quiz App — Design

**Date**: 2026-05-14
**Status**: Approved (overall shape)
**Owner**: gondk

## Goal

Web-based practice quiz app that mirrors the AWS Certified Solutions Architect – Associate (SAA-C03) exam experience. Built from a Passleader exam dump PDF (897 questions). Deployed as a static site so the user and colleagues can practise via a browser link, no install.

## Non-Goals

- No user accounts, no shared backend, no cross-device sync.
- No editing of questions in-app. Source-of-truth is the regenerated `tests.json` artifact.
- No fancy analytics, leaderboards, or social features.

## Source Material

- File: `/Users/gondk/Downloads/SAA-C03.pdf` (Passleader dump v24.021, 418 pages, 3.4 MB).
- Extracted via `pdftotext -layout` (poppler 26.04.0, installed via Homebrew).
- 897 questions, numbered 1–897 sequential, no gaps.
- 896 have `Answer:` line (Q13 missing — answer inferable as D from explanation; parser must handle).
- 682 have `Explanation:` block; 215 do not.
- ~97 multi-select (`(Choose two.)` / `(Choose three.)`); answer letters concatenated e.g. `Answer: BCE`.
- Options A–D standard; 108 Qs have E; 10 have F.
- Page-break form-feed `\f` chars prefix some `QUESTION` / `Answer:` / `Explanation:` lines.
- Per-page footer noise: `Get Latest & Actual SAA-C03 Exam's Question and Answers from Passleader. {N}` + `https://www.passleader.com`. Strip during parse.

## Exam Fidelity Targets

Mirror official AWS SAA-C03 exam structure:

- **65 questions per test**, **130 minutes** countdown.
- Pass mark **720/1000 ≈ 72%** correct.
- Mixed single-answer and multi-answer questions.
- Official domain weights:

| Domain | Topic | Weight | Per 65-Q test |
|---|---|---|---|
| 1 | Design Secure Architectures | 30% | 20 |
| 2 | Design Resilient Architectures | 26% | 17 |
| 3 | Design High-Performing Architectures | 24% | 16 |
| 4 | Design Cost-Optimized Architectures | 20% | 12 |

Total = 65 per test.

## High-Level Architecture

Two-phase system:

```
┌──────────────────────────────────────────┐    ┌──────────────────────────────┐
│ Pre-build phase (local, one-time)        │    │ Runtime app (static, shipped)│
│                                          │    │                              │
│  PDF ─► parse.js ─► raw-questions.json   │    │  index.html ──► Dashboard    │
│              │                           │    │       │                      │
│              ▼                           │    │       ├──► Test runner       │
│       classify.js (Claude Haiku) ────────┼───►│       │                      │
│              │                           │    │       └──► Result page       │
│              ▼                           │    │                              │
│       build-tests.js ─► tests.json ──────┼───►│  tests.json (loaded fetch)   │
└──────────────────────────────────────────┘    └──────────────────────────────┘
```

### Phase 1 — Pre-build (Node scripts, dev machine only)

1. **`scripts/parse.js`** — Extract questions from PDF text.
   - Input: `/Users/gondk/Downloads/SAA-C03.pdf`
   - Runs `pdftotext -layout` if not yet extracted.
   - Parses 897 questions into structured records.
   - Output: `data/raw-questions.json`
   - Handles edge cases: form-feed prefixes, multi-line option text, page-break interruptions, Q13 missing answer (records `correctAnswers: []`, flag `needsManualAnswer: true`), multi-select answer letters like `BCE`, option letters A–F, embedded URLs in explanations.

2. **`scripts/classify.js`** — Tag each question with AWS exam domain.
   - Reads `data/raw-questions.json`.
   - For each question, calls Claude Haiku via Anthropic API with a structured prompt: returns one of `1` (Secure), `2` (Resilient), `3` (High-Performing), `4` (Cost-Optimized).
   - Writes domain into question record.
   - Caches per-question result so a re-run skips already-classified Qs.
   - Output: `data/questions.json`
   - **Prerequisite**: `ANTHROPIC_API_KEY` env var. Estimated cost < $1 for all 897 Qs.

3. **`scripts/build-tests.js`** — Partition into 14 fixed, domain-balanced tests.
   - Reads `data/questions.json`.
   - Allocates 14 tests of 65 Qs each (= 910 slots, but only 897 Qs, so the **last test will be partial**).
   - Each test draws **20 / 17 / 16 / 12** from the four domain pools (proportionally less for the final partial test).
   - Sampling is deterministic (seeded shuffle) so Test 1 is always the same set across rebuilds — keeps "best score per test" meaningful.
   - Output: `public/tests.json` (deployable artifact).

### Phase 2 — Runtime (static site)

- Plain HTML / CSS / vanilla JS. No framework, no build step, no dependencies.
- Single-page app with hash-based routing (`#/dashboard`, `#/test/3`, `#/result/3`).
- Loads `tests.json` once via `fetch()` on app start.
- Three screens:
  - **Dashboard** — grid of 14 test cards.
  - **Test runner** — one question at a time, timer, navigation.
  - **Result page** — score + per-question review.

## Data Model

```jsonc
// questions.json (per record)
{
  "id": 1,
  "number": 1,                          // original PDF question number
  "scenario": "A company has a website hosted on AWS...",
  "prompt": "What should a solutions architect do to meet this requirement?",
  "options": [
    { "letter": "A", "text": "Update the ALB's network ACL..." },
    { "letter": "B", "text": "Create a rule that replaces..." },
    { "letter": "C", "text": "Create a listener rule on the ALB..." },
    { "letter": "D", "text": "Replace the ALB with a Network Load Balancer..." }
  ],
  "correctAnswers": ["C"],              // array even for single-answer
  "isMultiSelect": false,
  "explanation": "To redirect HTTP traffic to HTTPS...",
  "references": ["https://docs.aws.amazon.com/..."],
  "domain": 3,                          // 1–4, from classifier
  "needsManualAnswer": false            // true only for Q13
}
```

```jsonc
// tests.json
{
  "version": "1.0",
  "totalTests": 14,
  "durationMinutes": 130,
  "passPercent": 72,
  "tests": [
    {
      "id": 1,
      "title": "Practice Test 1",
      "questionIds": [/* 65 ids, domain-weighted */]
    },
    // ...
  ]
}
```

```jsonc
// localStorage shape (per browser, per user)
// key: "saa-c03-progress"
{
  "tests": {
    "1": {
      "status": "done",                 // "not-started" | "in-progress" | "done"
      "bestScore": 47,                  // out of 65
      "bestPercent": 72,
      "lastAttempt": "2026-05-14T10:23:00Z",
      "attempts": 2,
      "inProgressState": null           // serialized runner state if resuming
    }
  }
}
```

## Screens

### Dashboard (`#/dashboard`)

- Header: app title, total progress (e.g. "3 of 14 tests passed").
- Grid of 14 test cards. Each card:
  - Title ("Practice Test 1", "Practice Test 14 — Final (52 Qs)").
  - Status badge: Not Started / In Progress / Done.
  - Best score (e.g. "Best: 47/65 — 72% ✓ Pass").
  - Last attempt date.
  - Button: **Start** (if not-started), **Resume** (if in-progress), **Retake** (if done).
- "Reset all progress" link at bottom (with confirm).

### Test runner (`#/test/{N}`)

- Top bar:
  - Test title left, Question counter middle ("Question 12 of 65"), **timer countdown** right ("01:48:23"). Timer red <10 min.
- Main panel:
  - Scenario + prompt.
  - Options as radio buttons (single-answer) or checkboxes (multi-answer + helper text "Choose two").
  - Selected answer auto-persists to `inProgressState`.
- Footer:
  - Previous, Flag for Review (toggle), Next.
  - Right side: "Review & Submit" button (always visible).
- Sidebar / collapsible: jump-to-question grid. Each cell coloured: unanswered (grey), answered (blue), flagged (orange).
- Review screen (before submit):
  - List of all 65 Qs with status (Answered / Unanswered / Flagged). Click to jump back.
  - "Submit Test" button + confirm modal.
- Auto-submit when timer hits 0.

### Result page (`#/result/{N}`)

- Header: Score `47 / 65 (72%)`, **Pass** ✓ or **Fail** ✗ badge, time taken.
- Domain breakdown bar chart: % correct per domain (vs target weight).
- Filter buttons: All / Wrong only / Flagged only.
- Per-question expandable cards:
  - Question text + options.
  - Your answer (highlighted, ✓ green / ✗ red).
  - Correct answer (highlighted green).
  - Explanation text + reference links (if any).
  - Domain badge.
- Footer: "Back to Dashboard" / "Retake Test".

## Repository Layout

```
saa-c03-questionaire-application/
├── README.md
├── package.json                  # for scripts only, no runtime deps
├── scripts/
│   ├── parse.js
│   ├── classify.js
│   └── build-tests.js
├── data/
│   ├── raw-questions.json        # output of parse
│   └── questions.json            # output of classify
├── public/                       # deployable
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── tests.json                # output of build-tests, shipped to site
└── docs/
    └── superpowers/specs/2026-05-14-saa-c03-quiz-app-design.md
```

GitHub Pages serves `public/` as site root. Pre-build artifacts (`data/`) checked into repo too (so rebuilds aren't required to deploy).

## Deployment

- Hosting: **GitHub Pages** from `public/` folder of `main` branch.
- Process: `npm run build` runs `parse.js && classify.js && build-tests.js`, then `git push` and GitHub Pages serves it.
- Free, no domain config needed (uses `*.github.io` URL).

## Testing Strategy

- **Parser**: unit tests on a handful of representative question shapes — single-answer, multi-answer, missing-answer (Q13), 5-option E, 6-option F, page-break interrupted scenario, explanation with URLs.
- **Classifier**: dry-run mode (uses cached classifications, no API calls). Sanity check: domain distribution across 897 Qs roughly proportional to 30/26/24/20.
- **Test builder**: assert each generated test has exactly 65 Qs (last test may be smaller), domain counts ≈ 20/17/16/12, no overlap between tests, all 897 Qs used exactly once.
- **Runtime**: manual smoke test — start each of 14 tests, answer a few, submit, verify result. No browser test framework.

## Error Handling

- Parser errors → log and skip that question, but warn at end if total < 897.
- Classifier API error → retry with backoff 3×, then mark `domain: null` and flag for manual review.
- Runtime fetch of `tests.json` fails → friendly error screen "Could not load questions. Try refreshing."
- Timer race condition (close tab mid-test) → on next visit, dashboard shows "In Progress — Resume?" if state was saved.

## Open Questions

1. **Repo visibility / hosting** — Passleader dump is watermarked third-party content. Options:
   - Private GitHub repo + GitHub Pages "private site" (paid GitHub Pro/Team feature).
   - Public repo with question data gitignored and hosted elsewhere (e.g. uploaded manually to a private Netlify deploy).
   - Public repo and accept the risk (questions are widely circulated already).
   To resolve before deploy. Does not block code work.
2. CSS styling, animations, exact colour palette — deferred to implementation.

## Risks

- **Classifier quality**: Haiku may misclassify ambiguous Qs (some Qs span 2 domains). Mitigation: spot-check a sample after run; allow manual override via editing `data/questions.json`.
- **PDF parser fragility**: dump format has inconsistencies (Q13, page footers, form-feed). Mitigation: ship parser with the source PDF in repo and tests for each edge case found.
- **localStorage limits**: ~5 MB per origin in most browsers. Progress JSON well under 100 KB. No risk.
- **Source copyright**: Passleader watermarks. App is for personal/colleague study — not publishing the question text publicly. Repo should be **private** or at least the data files gitignored on public repos. To be confirmed before deploy.
