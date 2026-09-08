# Finish Firebase setup for Mathella

Project: `mathella-f7da0`. Keep the Firebase Spark plan. No Cloud Functions, paid hosting, SMS sign-in, Analytics, or service-account keys are used by this app.

## One-time console setup

1. In Firebase Authentication, enable **Google** sign-in and choose a support email.
2. In Authentication settings, add `melbelachew.github.io` to **Authorized domains**. For local development only, add `localhost` if needed.
3. Create the **default Cloud Firestore database**, using Standard edition and production mode. Choose your preferred region before creating it.
4. Open **Firestore Database → Rules**. Copy the complete contents of `firestore.rules` from this repository into the editor and click **Publish**. These rules allow only a signed-in account to access its own learner profiles, completions, and curriculum. Never replace them with a blanket allow rule.
5. In Firestore's single-field indexes, exempt the `json` field for collection group `settings` from indexing. The curriculum JSON isn't queried, and indexing it is unnecessary.

You can alternatively deploy the supplied rules and index exemption from your own authenticated terminal:

```sh
npm ci
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes --project mathella-f7da0
```

The GitHub Pages workflow tests the rules with a local emulator but does not publish them to Firebase. Direct Firebase administrative access has not been connected to this chat. No secrets are needed for the emulator tests. To automate live rule deployment later, configure narrowly scoped Google Cloud credentials for GitHub Actions through a separate authorized setup.

## Try the app

1. Open https://melbelachew.github.io/mathella/ and click **Parent sign in with Google**. Allow the sign-in popup.
2. Add a learner nickname. A nickname is a profile under the parent's account, not a separate authenticated child or protected parent role.
3. Complete a challenge. Wait for the save indicator and spark total to update.
4. Sign in with the same parent account in a second browser/device and select that learner. Check the sparks and imported curriculum.
5. To carry over existing guest data, use **Learners & browser import** and explicitly import it into the selected learner. Old browser data remains unchanged. Import from the original site is not automatic because that website has separate browser storage; curriculum can be exported there and imported here.

## Storage and sync behavior

- `users/{uid}/learners/{learnerId}`: learner nickname.
- `users/{uid}/learners/{learnerId}/completions/{sha256}`: one record per completed challenge/card. Sparks are the number of these records. Transactions and deterministic IDs prevent duplicate rewards from retries or two devices.
- `users/{uid}/settings/curriculum`: account-wide curriculum, stored as a JSON string under 700 KB. Transactions merge imported topic IDs with the latest saved curriculum.
- Challenge identity includes its content, as in the original app; changing a question produces a new reward identity. A future curriculum version can adopt explicit permanent question IDs if progress should span content edits.
- Existing guest data remains in the original `mathspark-*` local storage keys. Cloud records are never copied into those guest keys.
- A cloud save requires a connection. Failed challenge saves stay in memory with a retry button; keep the page open until they finish. They do not survive closing the tab. Guest practice remains usable without cloud access.
- Firebase keeps the parent sign-in session in the browser. The app does not enable persistent Firestore disk caching or analytics.
- Formula revisit queues remain within a practice session; only completed-card rewards sync in this version.
- Importing a large set of guest completions can partially finish before a connection fails. Retry safely: existing completion IDs aren't counted twice.
- Progress represents practice participation, not tamper-proof exam grading. An authenticated parent can edit their own records; client rules isolate families and validate document shapes but do not verify math mastery.

## Validation

```sh
npm test
npm run test:rules
npm run build
```

Rules tests require Java 21 and use an isolated `demo-mathella` emulator project. They check guest denial, cross-account denial, profile validation, completion validation and private curriculum access. The GitHub workflow runs these tests before publishing the website. A real Google sign-in and cross-device smoke test must be performed after the console setup above; emulator tests do not validate the live project's configuration.

## Build configuration

Set the repository Actions secret `VITE_FIREBASE_API_KEY` before merging the environment configuration change. For local development, copy `.env.example` to `.env.local` and fill in the key. Never commit `.env.local`. The build refuses to deploy without a key. The public web key is still embedded in the generated browser JavaScript; API restrictions and database rules remain necessary. Removing it from current source does not erase older commits or close a secret-scanning alert.
