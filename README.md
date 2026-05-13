# Workshop 2026 2Q-1 Survey App

누리미디어 AI 사업부 2026년 상반기 워크샵 사전 설문 앱입니다.

## Core

- React 19 + Vite
- Firebase Authentication
- Firebase Realtime Database
- Browser-run AI analysis from the result page
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

## AI Analysis

AI analysis runs from the result page by clicking `AI 분석 생성/갱신`. The facilitator enters an OpenAI API key in the result page, the browser sends anonymized aggregate survey data to the OpenAI Responses API, and the generated report is saved to Firebase Realtime Database.

This keeps GitHub Pages deployment simple and avoids Firebase Cloud Functions/Blaze requirements. The OpenAI key is not committed, not added to GitHub Actions secrets, and not saved to Firebase. It is used only for that browser request.

The report prompt requires an `Executive Summary` first and asks for a structured expert-review style report covering organization, product, engineering collaboration, risks, and 4-week experiments.

Do not commit `.env.local`, OpenAI keys, Firebase service account JSON files, or GitHub tokens.

## Deployment

GitHub Pages builds through `.github/workflows/deploy.yml`. The workflow is manual (`workflow_dispatch`) because this private repository's current GitHub plan returned `Pages not supported` when Pages enablement was attempted.

After Pages support is enabled for the repo, run the workflow from the Actions tab. The workflow builds the app in Firebase mode, so team members can open the GitHub Pages URL from their phone or computer and write responses directly to the dedicated Firebase Realtime Database without local setup. OpenAI keys, GitHub tokens, and Firebase service account JSON files must remain outside the repo.
