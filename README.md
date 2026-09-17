# SAA-C03 Practice Quiz App

Static-site practice quiz mirroring the AWS Certified Solutions Architect – Associate (SAA-C03) exam, built from a Passleader PDF dump.

- **50 fixed practice tests, 65 questions each**
- Domain-balanced per official AWS weights: **20 Secure / 17 Resilient / 16 High-Performing / 12 Cost-Optimized**
- **130-minute timer**, single-answer + multi-answer support, flag-for-review, full review screen, per-question explanation + references
- Progress saved in browser `localStorage`. No accounts, no backend.

## Prerequisites

- macOS or Linux with Node.js 20+.
- `pdftotext` (from poppler): `brew install poppler` — only needed to rebuild from PDF.
- The source PDF at `/Users/gondk/Downloads/SAA-C03.pdf` — only needed to rebuild.

## Setup

```bash
npm install
```

## Run locally

```bash
npm run serve
# then open http://localhost:8080
```

## Rebuild from source

The committed `public/tests.json` is already built. To rebuild from the PDF:

```bash
npm run extract-pdf     # PDF → data/saa-c03.txt
npm run parse           # → data/raw-questions.json
# (classification was done in-session; data/questions.json is committed)
npm run build-tests     # → public/tests.json (deployable)
```

## Multiple exams

The app supports multiple AWS exams through an **exam registry** in `public/exams.js`, defining code, title, data file, and per-exam options. The first entry is the default exam; dashboard tabs let users switch between registered exams, each maintaining separate `localStorage` progress keys (`<exam-code>-progress`).

- **Per-exam data files**: `public/tests.json` (SAA-C03), `public/tests-aip-c01.json` (AIP-C01).
- **AIP-C01 answers are AI-generated and unverified** — badged throughout the UI.

Build AIP-C01 from ExamTopics txt dumps in `data/aip-c01/`:

```bash
npm run parse-aip           # ExamTopics dumps → data/aip-c01/raw-questions.json
npm run parse-aip-sections  # sections.txt → data/aip-c01/sections.json
npm run build-aip           # + AI key (data/aip-c01/answers.json) → public/tests-aip-c01.json
```

### AIP-C01 source data

`data/aip-c01/` holds everything the build reads:

| File | Contents |
|---|---|
| `<from>-<to>.txt` | ExamTopics question dumps. Only files named this way are parsed. |
| `sections.txt` | Exam-guide section map (§2–§9) plus a per-question quick-reference table. |
| `answers.json` | AI-generated answer key and rationale, one entry per question. |
| `theory/` | Course section notes. **Internal reference only — never copied into `public/`.** |

The dumps come in two formats and the parser handles both: the original
`Question #N` style (questions 1–97) and a condensed `QUESTION N` style with
hard-wrapped prose and hanging-indent options (98–117, 128–136).

**Pool size is 126, not 136.** Questions 118–127 appear in the section map but
no dump file contains their text, so they are not in the app. The `NOTE:` footer
in `98-117.txt` claims Q105 has five answer choices; the dump only contains four.
The "Most upvoted answer" lines in both condensed dumps are ExamTopics paywall
placeholders — the parser strips them and they are not used as answers.

Each question carries the exam-guide sections it belongs to, shown as a `§N`
badge in the runner and review screens.

Planned next phases: DOP-C02, SCS-C02. See `docs/superpowers/specs/2026-07-19-multi-exam-support-design.md`.

## Deploy

Configured for **Cloudflare Pages**:

- **Build command**: *(none)*
- **Build output directory**: `public`
- **Production branch**: `main`

Every `git push origin main` triggers an auto-deploy.

## Repository visibility

The source PDF is third-party watermarked content. **Keep this repo private.**

## Test runner shortcuts

- `←` / `→` — previous / next question
- `F` — flag current question for review

## Tests

```bash
npm test
```

19 unit tests cover parser, classifier prompt/response logic, and the 50-test builder.

## Architecture

See `docs/superpowers/specs/2026-05-14-saa-c03-quiz-app-design.md` and `docs/superpowers/plans/2026-05-14-saa-c03-quiz-app.md`.

## License & Disclaimer

Licensed under **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)**.
Full text in [`public/LICENSE.txt`](public/LICENSE.txt).

- Personal study tool. **Not for sale, not a business, no revenue.**
- Not affiliated with, endorsed by, or sponsored by Amazon Web Services, Inc. or Passleader.
- Question content is sourced from publicly circulated study material and used solely for non-commercial personal exam preparation.
- Access restricted to the author and invited colleagues.
- Rights-holder takedown requests: contact `daongocquockhanh@gmail.com`.
