# Mathella — Math Spark

A React + TypeScript math learning app for a sixth grader, built with Vite. The app keeps its original **Math Spark** name; this repository is **Mathella**.

## Run locally

Install Node.js 24 LTS. Copy `.env.example` to `.env.local` and set `VITE_FIREBASE_API_KEY` to your Firebase web key. This local file is ignored by Git. Then run:

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. To validate and build:

```sh
npm test
npm run build
npm run preview
```

`dist/` is the production website. It is generated, not checked into Git. Relative asset paths allow the build to work at `/mathella/` or on another static host. The bundled public Firebase web configuration points to `mathella-f7da0`. The Firebase web API key is injected at build time from `VITE_FIREBASE_API_KEY`. It remains visible in the browser bundle; keep its API restrictions in place. Firebase Console setup is required for cloud features; guest mode remains available.

## Upload this ZIP to your repository

If direct publishing from ChatGPT is unavailable, extract this ZIP and open a terminal inside the extracted `mathella` folder. For the currently empty repository:

```sh
git init
git add .
git commit -m "Add Mathella React math learning app"
git branch -M main
git remote add origin https://github.com/melbelachew/mathella.git
git push -u origin main
```

Authenticate using your normal GitHub login flow or GitHub Desktop; never paste a personal token into a chat. If the repository now contains commits, clone it first and copy this project's files into that clone instead; do not force-push over existing work. Include `.github/workflows/deploy.yml` when copying files.

## Publish with GitHub Pages

Before deploying, create a repository Actions secret named `VITE_FIREBASE_API_KEY` under Settings → Secrets and variables → Actions. Set its value to the Firebase web API key. A missing value stops the build before deployment, preserving the existing live site.

1. In this repository, open **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Open **Actions → Deploy Mathella to GitHub Pages → Run workflow**, choosing `main`. If a run happened before you enabled Pages, rerun it after enabling Pages.
4. Wait for the deployment to pass. The workflow's environment link is the confirmed live URL. The expected default address is `https://melbelachew.github.io/mathella/`.

Every later push to `main` runs the tests, builds the app, and publishes it. If organization/repository policies restrict Actions, the owner must allow the referenced official GitHub actions. Repository settings are separate from pushing source files.

Workflow reference: https://vite.dev/guide/static-deploy#github-pages
GitHub Pages setup: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Included learning experiences

- 28 area challenges, including trapezoids, rhombuses, kites, hexagons, coordinate grids, and surface area.
- 26 fraction challenges, including mixed numbers and fraction operations.
- Five more topics: Ratios, Unit Rates & Percentages; Arithmetic in Base Ten; Expressions & Equations; Rational Numbers; Data Sets & Distributions.
- Across seven topics: 145 guided problems, 77 word detective questions, and 68 formula cards.
- Word detective: identify a quantity or operation before calculating.
- Formula recall cards, with a queue to revisit tricky ideas.
- Progressive hints, encouraging feedback, and sparks without a timer or hint penalties.
- Parent curriculum JSON import/export.

This is a starting curriculum, not a complete sixth-grade course. Sparks count participation, not mastery. Answers accept negative numbers (with `-` or `−`), decimals, fractions such as `3/4`, and mixed numbers such as `1 1/8` or `1⅛`.

## Update or add curriculum

Edit `src/curriculum.ts` for changes shared by everyone visiting the website. Topic definitions live in `src/types.ts` and import validation lives in `src/learning.ts`.

Each topic has a unique `id`, `name`, `subtitle`, and three nonempty arrays: `problems`, `detectives`, and `cards`. Detective `correct` values are zero-based option indexes. Problem `unit` may be an empty string for unitless answers; optional `answerLabel` clarifies the requested quantity. Problem `answer` values are numbers, including decimal equivalents for fractions. Diagrams support rectangle, square, triangle, parallelogram, or text. Measurements in diagrams are illustrative, not to scale. New shapes, nets, and coordinate questions use text expressions. Optional `decimalPlaces` (0–8) accepts decimal answers within half a unit of that precision; fraction inputs are checked against the exact numeric answer. The 5/6-cup question accepts `5/6` or a decimal rounded to four places.

For browser-only changes, use **For grown-ups → Download curriculum JSON**, edit the file, and import it. Matching topic IDs replace existing topics while retaining order; new IDs append topics. Keep a copy of your customized JSON. Saved topics identical to the original bundled lessons automatically use the expanded lessons. Customized topics stay unchanged. The five new topics are appended when their IDs are missing from saved guest or account curricula. Unchanged original questions retain their completion keys even when reordered, preserving spark deduplication.

Guest progress and imports use browser local storage. Signed-in parent accounts use Firebase Authentication and Firestore to sync learner progress and account curriculum. The parent can explicitly import this browser's existing guest data. Nicknames are learner profiles, not separate child logins.

**Required Firebase setup:** follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md) to enable Google sign-in, authorize the website domain, and publish the supplied database rules. The GitHub workflow publishes the website and tests the rules; it does not deploy live Firebase rules without a separate authenticated setup.

Cloud saves need a connection. Failed challenge saves can be retried while the page remains open. Formula review queues remain session-local. Sparks indicate participation, not verified mastery.

## Project structure

- `src/App.tsx`: topic navigation and browser-local progress
- `src/Activity.tsx`: guided solving, word detective, and formula recall
- `src/Diagram.tsx`: accessible math diagrams
- `src/ParentPanel.tsx`: curriculum import/export
- `src/curriculum.ts`: editable lesson content
- `src/learning.ts`: numeric answers, validation, and completion scoring
- `tests/learning.test.ts`: core learning and import checks
- `.github/workflows/deploy.yml`: GitHub Pages deployment

## Download the source ZIP

On GitHub, choose **Code → Download ZIP**. Extract it, then follow the local setup above. The ZIP includes the React/TypeScript source and deployment workflow; dependencies are installed with `npm ci`.
