# Coolara — Build-window task list

This is a planning checklist. Mark items complete only after the official build
window begins and the implementation is verified.

## 1. Foundation

- [x] Create the event repository and record the build-window start commit.
- [x] Initialise the approved framework and dependencies.
- [x] Add environment variable documentation; do not commit credentials.
- [x] Confirm team access to GitHub, deployment, database, and AI accounts.

## 2. Deterministic data layer

- [x] Define telemetry type, units, and synthetic scenarios.
- [x] Implement deterministic PUE/WUE and baseline calculations.
- [x] Implement anomaly thresholds and structured findings.
- [x] Implement the thermal/reliability safety gate.
- [x] Add tests for calculations and safe/unsafe outcomes.

## 3. Application experience

- [x] Build the command-centre dashboard.
- [x] Build telemetry and anomaly pages.
- [x] Build the simulator interface and result states.
- [x] Add loading, empty, and error states.
- [x] Verify responsive layout.

## 4. AI and persistence

- [x] Create the database schema and seed only after the build window starts.
- [x] Connect the application to the database.
- [x] Add server-side AI explanation integration.
- [x] Confirm no API key is exposed to the browser.
- [x] Verify AI output does not create numerical claims.

## 5. Demo and submission

- [x] Test Monitor → Detect → Explain → Simulate → Optimize end to end.
- [x] Demonstrate both a safe and a rejected simulation.
- [x] Run lint, tests, and production build.
- [x] Deploy and verify the production URL.
- [x] Complete AI, data, and pre-existing-material disclosures.
- [x] Prepare a short demo script and judge Q&A.
