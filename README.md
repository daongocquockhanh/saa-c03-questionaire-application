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
