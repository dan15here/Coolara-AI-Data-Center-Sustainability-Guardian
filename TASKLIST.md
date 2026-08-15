# Coolara — Build-window task list

This is a planning checklist. Mark items complete only after the official build
window begins and the implementation is verified.

## 1. Foundation

- [ ] Create the event repository and record the build-window start commit.
- [ ] Initialise the approved framework and dependencies.
- [ ] Add environment variable documentation; do not commit credentials.
- [ ] Confirm team access to GitHub, deployment, database, and AI accounts.

## 2. Deterministic data layer

- [ ] Define telemetry type, units, and synthetic scenarios.
- [ ] Implement deterministic PUE/WUE and baseline calculations.
- [ ] Implement anomaly thresholds and structured findings.
- [ ] Implement the thermal/reliability safety gate.
- [ ] Add tests for calculations and safe/unsafe outcomes.

## 3. Application experience

- [ ] Build the command-centre dashboard.
- [ ] Build telemetry and anomaly pages.
- [ ] Build the simulator interface and result states.
- [ ] Add loading, empty, and error states.
- [ ] Verify responsive layout.

## 4. AI and persistence

- [ ] Create the database schema and seed only after the build window starts.
- [ ] Connect the application to the database.
- [ ] Add server-side AI explanation integration.
- [ ] Confirm no API key is exposed to the browser.
- [ ] Verify AI output does not create numerical claims.

## 5. Demo and submission

- [ ] Test Monitor → Detect → Explain → Simulate → Optimize end to end.
- [ ] Demonstrate both a safe and a rejected simulation.
- [ ] Run lint, tests, and production build.
- [ ] Deploy and verify the production URL.
- [ ] Complete AI, data, and pre-existing-material disclosures.
- [ ] Prepare a short demo script and judge Q&A.
