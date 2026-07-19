# Multi-Exam Support — Design

**Date:** 2026-07-19
**Status:** Approved (pending user spec review)

## Goal

Extend the SAA-C03 quiz app to host additional AWS exam question sets — AIP-C01 first, then DOP-C02, then SCS-C02 — while leaving existing SAA-C03 data, progress, and behavior untouched.

## Source material

| Exam | Source format | Questions | Answer coverage | Decision |
|---|---|---|---|---|
| AIP-C01 | ExamTopics txt dumps (4 files: 1-25, 26-50, 51-75, 76-97) | 97 | None | Claude answers all 97; every question flagged `aiAnswered: true` and badged "AI-answered, unverified" in UI |
| DOP-C02 | ExamTopics txt dumps (15 files, Q1-429) + separate `-ans.txt` key files | 429 | Keys for 1-149 and 175-249 (~225 Qs) | Ship only answered questions; unanswered (150-174, 250-429) excluded until keys arrive |
| SCS-C02 | ExamTopics PDFs (via pdftotext) | 297 | Embedded: official "Correct Answer" + community "Most Voted" | Grade by **Most Voted**; fall back to official when no votes |

Source files extracted from zips in `~/Downloads` (dated 2026-07-19). Raw txt/PDF sources copied into `data/<exam-code>/` for reproducible builds.

ExamTopics dumps carry no explanations. New exams ship without explanation text (SAA keeps its own). AIP questions get a short Claude-written rationale stored alongside the AI answer.

## Architecture

### Exam registry

New `public/exams.js`:

```js
export const EXAMS = [
  { code: 'saa-c03', title: 'SAA-C03', dataFile: 'tests.json',          hasTheory: true  },
  { code: 'aip-c01', title: 'AIP-C01', dataFile: 'tests-aip-c01.json',  hasTheory: false },
  // dop-c02, scs-c02 added in later phases
];
```

- SAA-C03 remains the default exam. Its `tests.json` filename and question IDs are untouched.
- Active exam persisted in localStorage (`active-exam` key). Dashboard shows exam switcher tabs.
- Progress storage namespaced per exam: existing `saa-c03-*` keys unchanged; new exams use `<code>-progress` etc. Switching exams never mixes state.
- Theory / Modules / Tips navigation renders only when `hasTheory` is true. Other exams show Tests + Review only.
- Splash modal and footer wording generalized from "SAA-C03" to AWS certification exams generally. All non-commercial / non-affiliation disclaimers, footer, and LICENSE are preserved verbatim in substance (compliance requirement).

### Data pipeline

New parser `scripts/parse-examtopics-txt.js`:

- Split on `^Question #(\d+)` headings; `====`/URL separator lines discarded.
- Options matched as ` A.` letter blocks with following paragraph text.
- Multi-select detected from "(Choose two.)" / "(Choose three.)" in prompt, or multi-letter answer key.
- Output shape identical to existing `data/raw-questions.json` question objects (id, number, scenario, prompt, options, correctAnswers, isMultiSelect, explanation, references, needsManualAnswer).

Answer merging per exam:

- **AIP:** `data/aip-c01/answers.json` — Claude-produced `{ number, answers, rationale }` for all 97. Merge sets `correctAnswers`, `explanation` (rationale), and `aiAnswered: true`.
- **DOP (later):** parse `-ans.txt` files (`<number> <letters...>` lines). Questions without a key are dropped from the build.
- **SCS (later):** `scripts/parse-examtopics-pdf.js` — pdftotext output; extract "Correct Answer: X" and "Most Voted" markers; grade by Most Voted with official fallback.

Build script `scripts/build-tests.js` parameterized by exam config (pool file, output file, questions per test, duration, pass %). SAA invocation unchanged.

### Practice test generation

| Exam | Tests | Qs/test | Duration | Pass % |
|---|---|---|---|---|
| SAA-C03 (existing) | 50 | 65 | 130 min | 72 |
| AIP-C01 | 2 | ~48 | 130 min | 75 |
| DOP-C02 (later) | 3 | 75 | 180 min | 75 |
| SCS-C02 (later) | 4-5 | 65 | 170 min | 75 |

Same shuffled-sampling approach as existing SAA builder. Values adjustable in exam config.

### UI changes

- Exam switcher tabs on dashboard header area.
- Amber "AI-answered — unverified" badge on question cards where `aiAnswered: true`, plus a one-line note on that exam's dashboard.
- Test runner, review mode, redo mode, scoring reused as-is — they operate on whatever exam data is active.

## Error handling

- Parser warns (existing pattern) on questions with missing options or malformed blocks; build fails loudly if question count deviates from expected.
- `fetch` of a per-exam data file that 404s shows an error state, not a blank page.
- Unknown/stale `active-exam` value in localStorage falls back to SAA-C03.

## Testing

- Parser unit tests (`node --test`, existing pattern) with an ExamTopics-format fixture in `scripts/__fixtures__/`.
- Answer-merge tests: AIP merge flags `aiAnswered`; DOP drop-unanswered behavior.
- Storage namespacing test: per-exam progress keys don't collide.
- Manual QA: existing SAA progress survives upgrade; AIP flow end-to-end (pick exam → take test → score → review → redo).

## Build order

1. **Phase 1 — Registry + AIP end-to-end** (this effort's deliverable): exams.js, txt parser, Claude answer pass over 97 Qs, build, UI switcher + badge, tests.
2. **Phase 2 — DOP-C02**: ans-file merge, 225 answered Qs.
3. **Phase 3 — SCS-C02**: PDF parser, Most Voted grading.

Phases 2-3 require no registry or UI rework.

## Out of scope

- Answering DOP's ~205 unanswered questions (excluded until keys arrive).
- Theory/module content for new exams.
- Any change to SAA-C03 question data or IDs.