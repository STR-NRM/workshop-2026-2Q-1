# Workshop 2026 2Q-1 Survey App

누리미디어 AI 사업부 2026년 상반기 워크샵 사전 설문 앱입니다.

## Core

- React 19 + Vite
- Firebase Authentication
- Firebase Realtime Database
- Browser-run report generation from the result page
- Mobile-first respondent survey
- Shared result and report dashboard

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Create `.env.local` from `.env.example`.

```bash
cp .env.example .env.local
```

3. For UI-only local testing without Firebase, set:

```bash
VITE_USE_LOCAL_STORE=true
```

For real Firebase testing, keep `VITE_USE_LOCAL_STORE=false` and use the dedicated Firebase project:

- Project ID: `workshop-2026-2q-1`
- Database namespace: `surveys/2026-2Q-1`

4. Run locally.

```bash
npm run dev
```

## Verification

```bash
npm run validate:survey
npm run test:logic
npm run lint
npm run build
```

## Report Generation

Report generation runs from the result page through three separate report tabs: `AI 종합`, `AI 비주관식`, and `AI 주관식`. The facilitator enters a report generation key in the selected report tab, the browser sends the relevant anonymized aggregate survey data to the configured analysis provider, and the generated report is saved to the app database.

This keeps GitHub Pages deployment simple and avoids server-side functions or paid runtime requirements. The report generation key is not committed, not added to GitHub Actions secrets, and not saved to the app database. It is used only for that browser request.

Each report prompt requires an `Executive Summary` first, with a 10-word-or-shorter one-sentence conclusion, an easy analysis summary, and 3-5 action bullets before detailed sections. The result UI highlights the conclusion, section summary, and section proposal as distinct visual callouts.

Do not commit `.env.local`, OpenAI keys, Firebase service account JSON files, or GitHub tokens.

## Deployment

GitHub Pages builds through `.github/workflows/deploy.yml`. The workflow is manual (`workflow_dispatch`) because this private repository's current GitHub plan returned `Pages not supported` when Pages enablement was attempted.

After Pages support is enabled for the repo, run the workflow from the Actions tab. The workflow builds the production survey app so team members can open the GitHub Pages URL from their phone or computer and save responses without local setup. Report generation keys, GitHub tokens, and Firebase service account JSON files must remain outside the repo.
