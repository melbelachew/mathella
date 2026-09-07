# Mathella — Math Spark

A React + TypeScript math learning app for a sixth grader, built with Vite. The app keeps its original **Math Spark** name; this repository is **Mathella**.

## Run locally

Install Node.js 24 LTS, then run:

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

`dist/` is the production website. It is generated, not checked into Git. Relative asset paths allow the build to work at `/mathella/` or on another static host. No API keys, backend, or environment variables are needed.

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

1. In this repository, open **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Open **Actions → Deploy Mathella to GitHub Pages → Run workflow**, choosing `main`. If a run happened before you enabled Pages, rerun it after enabling Pages.
4. Wait for the deployment to pass. The workflow's environment link is the confirmed live URL. The expected default address is `https://melbelachew.github.io/mathella/`.

Every later push to `main` runs the tests, builds the app, and publishes it. If organization/repository policies restrict Actions, the owner must allow the referenced official GitHub actions. Repository settings are separate from pushing source files.

Workflow reference: https://vite.dev/guide/static-deploy#github-pages
GitHub Pages setup: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Included learning experiences

- Eight area challenges: rectangles, squares, triangles, parallelograms, missing dimensions, decimal measurements, and combined areas.
- A four-challenge fractions starter.
- Word detective: identify a quantity or operation before calculating.
- Formula recall cards, with a queue to revisit tricky ideas.
- Progressive hints, encouraging feedback, and sparks without a timer or hint penalties.
- Parent curriculum JSON import/export.

This is a starting curriculum, not a complete sixth-grade course. Sparks count participation, not mastery. Fractions can be entered as `3/4` or `0.75`; mixed-number notation is not supported.

## Update or add curriculum

Edit `src/curriculum.ts` for changes shared by everyone visiting the website. Topic definitions live in `src/types.ts` and import validation lives in `src/learning.ts`.

Each topic has a unique `id`, `name`, `subtitle`, and three nonempty arrays: `problems`, `detectives`, and `cards`. Detective `correct` values are zero-based option indexes. Problem `answer` values are numbers, including decimal equivalents for fractions. Diagrams support rectangle, square, triangle, parallelogram, or text. Measurements in diagrams are illustrative, not to scale.

For browser-only changes, use **For grown-ups → Download curriculum JSON**, edit the file, and import it. Matching topic IDs replace existing topics while retaining order; new IDs append topics. Keep a copy of your customized JSON.

All progress and imports use browser local storage. They do not sync between devices or domains, and clearing browser data removes them. Moving from the original private site to GitHub Pages starts with fresh progress. Export/import transfers customized curriculum, not progress. Existing browser imports override the bundled curriculum until replaced or browser storage is cleared.

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
