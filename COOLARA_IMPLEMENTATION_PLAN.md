# Coolara — Hackathon Implementation Plan

**Purpose:** Shared execution guide for a two-person team during the hackathon build window.  
**Product:** Coolara, a sustainability decision-support MVP for data-center operations.  
**Principle:** **Monitor → Detect → Explain → Simulate → Optimize**

## 1. MVP outcome

By demo time, an operator must be able to:

1. See synthetic telemetry and sustainability metrics on a command-center dashboard.
2. Identify a deterministic anomaly, including its severity and affected metric.
3. Ask Gemini for a qualitative explanation of the structured finding.
4. Adjust a what-if scenario and receive deterministic estimates.
5. See a clear **safe / unsafe** decision based on a thermal-reliability gate.

### Out of scope

- Real data-center integrations or claims of live operational data.
- Authentication, multi-tenancy, billing, mobile apps, or microservices.
- AI-generated numeric calculations or autonomous control actions.

## 2. Working agreement

- Work only in the agreed GitHub repository and protect `main`.
- Start by creating a hackathon-start tag or initial commit when the official build window opens.
- Keep commits small and descriptive: `feat: add telemetry chart`, `fix: reject unsafe scenario`.
- Do not commit `.env.local`, API keys, Supabase passwords, or service-role keys.
- Use synthetic data only. Label the UI as **Synthetic demo telemetry**.
- Numbers must come from TypeScript calculations or SQL, never from Gemini.
- Gemini receives a structured finding and returns explanation/recommendations only.
- Before merging, run lint, build, and the relevant demo flow.

## 3. Team split

| Area | Owner | Main responsibility | Deliverables |
| --- | --- | --- | --- |
| Frontend | Team member A | Operator experience and route-level UI | Dashboard, telemetry charts, anomaly view, simulator form/results, reports, responsive styling |
| Backend / data / AI | Team member B | Reliable data flow and decision logic | Supabase schema/seed, synthetic telemetry, metrics/anomaly rules, simulator calculation, Gemini API route |
| Shared integration | Both | Connect and validate the end-to-end demo | Environment variables, integration contract, deployment, demo rehearsal, README/disclosures |

### Ownership boundaries

**Frontend owns**

- `src/app/**` pages, layouts, and route navigation.
- `src/components/**` visual components and charts.
- Client-side interaction state, loading, empty, and error states.
- The UI contract: expected API payload shapes and how a result is displayed.

**Backend owns**

- `supabase/migrations/**`, `supabase/seed.sql`, and database access helpers.
- `src/lib/calculations/**`, `src/lib/anomaly/**`, and `src/lib/simulator/**`.
- `src/app/api/**` endpoints and server-only Gemini integration.
- Input validation, safety rules, API errors, and the environment-variable contract.

**Both own**

- Product decisions, scenario definitions, labels, demo data, and final quality.
- No one changes another owner’s files without a short heads-up in chat/commit message.

## 4. Integration contract

Agree on these objects before implementation. Keep the types in `src/types/` or `src/lib/types.ts`.

```ts
type TelemetryPoint = {
  timestamp: string
  dataCenterId: string
  itLoadMw: number
  itPowerMw: number
  coolingPowerMw: number
  waterLiters: number
  ambientTempC: number
  serverTempC: number
}

type Finding = {
  id: string
  severity: "low" | "medium" | "high" | "critical"
  metric: "coolingPower" | "waterUsage" | "serverTemperature"
  actual: number
  expected: number
  deviationPercent: number
  detectedAt: string
  likelyFactors: string[]
  explanationInput: Record<string, number | string>
}

type SimulationInput = {
  coolingSetpointC: number
  workloadPercent: number
  ambientTempC: number
}

type SimulationResult = {
  safe: boolean
  reason: string
  predictedServerTempC: number
  estimatedEnergyDeltaMwh: number
  estimatedWaterDeltaLiters: number
  estimatedCostDeltaIdr: number
  pue: number
  wue: number
}
```

## 5. Build sequence

### Phase 0 — Start-of-hackathon setup (0–30 min)

- [ ] Confirm the rules on pre-existing material, AI disclosure, and submission requirements.
- [ ] Create/push a `hackathon-start` tag or timestamped first commit.
- [ ] Clone/open the repository for both team members.
- [ ] Create `.env.local` from `.env.example` locally only.
- [ ] Add Vercel environment variables for Preview and Production.
- [ ] Create a shared issue/checklist board or use the task list below.
- [ ] Confirm API payload types and route names together.

**Exit condition:** both machines can run `npm install` and `npm run dev`.

### Phase 1 — Foundation (30–90 min)

**Frontend**

- [ ] Establish the app shell: sidebar, topbar, page container, status badges.
- [ ] Create route placeholders: `/dashboard`, `/telemetry`, `/anomalies`, `/simulator`, `/reports`.
- [ ] Add a consistent neutral/black operations theme and responsive layout.

**Backend**

- [ ] Create the initial Supabase migration: `data_centers`, `telemetry`, `alerts`, `simulations`.
- [ ] Write seed data for one clearly named synthetic facility.
- [ ] Add server-only Supabase client helpers and test read access.
- [ ] Implement deterministic metric functions: total power, PUE, WUE, baseline/deviation.

**Exit condition:** a page displays seeded telemetry through the defined contract.

### Phase 2 — Monitor and detect (90–210 min)

**Frontend**

- [ ] Build dashboard metric cards and operational-posture summary.
- [ ] Build Telemetry charts with explicit labels, units, legend, and time range.
- [ ] Build the anomaly card with severity, actual/expected/deviation, causes, and CTA.

**Backend**

- [ ] Create deterministic baseline and anomaly rules.
- [ ] Return the newest telemetry, calculated metrics, and highest-priority finding.
- [ ] Persist or seed alerts with their source telemetry timestamp.
- [ ] Add safe API error responses and input validation.

**Exit condition:** changing the selected synthetic scenario creates a predictable, visible anomaly.

### Phase 3 — Explain and simulate (210–360 min)

**Frontend**

- [ ] Build the AI explanation panel: idle, loading, successful, and unavailable/error states.
- [ ] Render model output safely as Markdown (headings, bold, bullets, paragraphs).
- [ ] Build simulator controls with visible current values and reset action.
- [ ] Render simulation outcome: safe/unsafe, reason, projected temperature, PUE/WUE, energy/water/cost deltas.

**Backend**

- [ ] Implement `POST /api/explain` using Gemini with the structured finding only.
- [ ] Keep prompt instructions strict: no invented metrics; qualitative recommendations only.
- [ ] Implement deterministic simulator calculation and configurable temperature safety threshold.
- [ ] Implement `POST /api/simulate` and persist a simulation record when appropriate.

**Exit condition:** Gemini explains a finding; the simulator reliably rejects an unsafe input.

### Phase 4 — Reports, polish, and deployment (360–480 min)

**Frontend**

- [ ] Add a compact activity/reports page based on alerts and simulation events.
- [ ] Check desktop and narrow-screen layout; fix overflow and unreadable labels.
- [ ] Ensure all CTAs do something meaningful or are removed.

**Backend**

- [ ] Verify data is present in Supabase and API routes work in Vercel Preview.
- [ ] Verify `GEMINI_API_KEY` stays server-only and no secret appears in browser output.
- [ ] Add graceful fallback if Gemini is unavailable.

**Both**

- [ ] Update README, demo script, data source disclosure, AI tool disclosure, and architecture.
- [ ] Deploy to Vercel and test the production URL in an incognito/private window.

**Exit condition:** deployed app completes the five-step MVP journey without manual fixes.

## 6. Suggested repository structure after the build begins

```text
coolara/
├─ src/
│  ├─ app/                 # pages and API routes
│  ├─ components/          # visual UI components
│  ├─ lib/
│  │  ├─ calculations/     # deterministic metrics
│  │  ├─ anomaly/          # deterministic rules
│  │  ├─ simulator/        # safety-gated scenario logic
│  │  ├─ ai/               # server-only Gemini adapter
│  │  └─ supabase/         # database clients/queries
│  └─ types/               # shared contracts
├─ supabase/
│  ├─ migrations/
│  └─ seed.sql
├─ docs/                   # architecture, demo script, disclosures
├─ .env.example
└─ README.md
```

## 7. API plan

| Endpoint | Owner | Purpose | Must return |
| --- | --- | --- | --- |
| `GET /api/dashboard` | Backend | Latest dashboard data | metrics, active finding, activity |
| `GET /api/telemetry` | Backend | Chart series | labeled telemetry points |
| `POST /api/explain` | Backend | Gemini qualitative explanation | Markdown/text and provider status |
| `POST /api/simulate` | Backend | Deterministic what-if result | `SimulationResult` with safe/unsafe gate |
| `GET /api/reports` | Backend | Demo activity history | alerts and simulations |

Frontend should develop against small local mock fixtures until each endpoint is ready. Replace only the data adapter, not the visual component APIs.

## 8. Demo scenarios

Prepare two deterministic scenarios that both team members can explain.

| Scenario | Trigger | What the audience sees | Expected outcome |
| --- | --- | --- | --- |
| Cooling inefficiency | Cooling power rises above baseline with elevated ambient temperature | Critical cooling anomaly and contributing factors | Gemini gives qualitative inspection priorities |
| Thermal-risk simulation | High workload / low cooling setpoint | Simulator output turns unsafe | App rejects recommendation and explains the thermal threshold |

## 9. Testing checklist

### Functional

- [ ] Dashboard loads metric cards and an active operational status.
- [ ] Telemetry chart labels and units match the returned data.
- [ ] Anomaly values are recalculated deterministically and show the correct severity.
- [ ] “Analyze findings” calls Gemini and renders readable Markdown.
- [ ] Missing/invalid Gemini key shows a safe fallback, not a broken screen.
- [ ] Simulator updates after inputs change and produces a clear safe/unsafe result.
- [ ] Unsafe result cannot be described as an approved optimization.
- [ ] Reports/activity reflects the demo events.

### Technical

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] No secret exists in Git history, client bundle, screenshots, or README.
- [ ] Supabase schema and seed can be reproduced from the repository.
- [ ] Vercel Preview and Production load successfully.

### Demo reliability

- [ ] Keep a known-good seeded scenario available.
- [ ] Browser opened to the production URL before judging.
- [ ] Keep a short screen recording/screenshots as an emergency fallback if permitted.
- [ ] Rehearse the full flow in under three minutes.

## 10. Three-minute demo runbook

1. **Monitor (0:00–0:30):** Introduce Coolara and show synthetic facility health, PUE/WUE, and telemetry.
2. **Detect (0:30–1:05):** Open the active cooling anomaly and compare actual vs expected values.
3. **Explain (1:05–1:35):** Run Gemini analysis; emphasize that metrics/rules are deterministic and Gemini is qualitative.
4. **Simulate (1:35–2:30):** Adjust workload/cooling/ambient conditions. Show a safe scenario, then intentionally show unsafe rejection.
5. **Optimize (2:30–3:00):** Summarize the recommended review action and safety guardrail.

## 11. Merge and handoff protocol

1. Pull latest `main` before beginning a new task.
2. Work in a small feature branch: `feat/dashboard-ui`, `feat/anomaly-engine`, etc.
3. Do not mix UI refactors with backend/schema changes in one commit.
4. Before handoff, share: branch name, changed files, how to test, and known limitation.
5. The receiving teammate checks the affected flow before merge.
6. If time is tight, one teammate merges while the other does a fresh production smoke test.

## 12. Final submission checklist

- [ ] GitHub repository URL is correct, public/private per competition rules, and all work from the build window is committed.
- [ ] Production URL works.
- [ ] README contains setup, architecture, demo flow, synthetic-data note, and limitations.
- [ ] `PRE_EXISTING_DISCLOSURE.md` honestly separates pre-event materials from hackathon work.
- [ ] `AI_TOOLS_DISCLOSURE.md` lists the implementation tools and deployed Gemini model actually used.
- [ ] Database migrations and seed files are committed only if they were created during the permitted build window.
- [ ] No credentials are committed.
- [ ] Team can explain every screen, metric, rule, and limitation.
