# Coolara — AI Data-Center Sustainability Guardian

A sustainability decision-support prototype for data-centre operators. Coolara helps operations teams understand operational signals across energy, water, cooling, and thermal performance — **before** they commit to a response.

Product flow:

```text
Monitor → Detect → Explain → Simulate → Optimize
```

> All telemetry is synthetic demo data and is clearly labelled as such in the UI. Numerical results — including PUE, WUE, deviations, savings, costs, and safety verdicts — come exclusively from deterministic TypeScript logic, never from the LLM.

## Documentation

| Product | Technical | Submission |
| --- | --- | --- |
| [PRD](./PRD.md) · [UI specification](./COOLARA_UI_SPECIFICATION.md) · [Implementation plan](./COOLARA_IMPLEMENTATION_PLAN.md) | [Technical plan](./TECH.md) · [API specification](./API_SPEC.md) | [AI tools disclosure](./AI_TOOLS_DISCLOSURE.md) · [Pre-existing materials](./PRE_EXISTING_DISCLOSURE.md) |

## Problem

Data-centre teams must balance reliability, energy efficiency, and water use. Raw telemetry alone does not tell an operator which deviation deserves attention, why it is happening, or whether a proposed operational response is actually safe.

## What this MVP demonstrates

1. **Monitor** a command-centre dashboard with energy, cooling, water, temperature, PUE, and WUE indicators.
2. **Detect** anomalies through deterministic rules (actual vs. expected baseline → severity).
3. **Explain** each finding qualitatively with Gemini, driven only by structured, pre-computed findings.
4. **Simulate** what-if scenarios and receive deterministic energy/water/cost estimates.
5. **Optimize** safely: a configurable thermal/reliability gate rejects any unsafe scenario.

## Stack

| Layer | Technology |
| --- | --- |
| Web application | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS v4, reusable components, lucide-react icons |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| AI explanation | Google Gemini API (qualitative only) |
| Testing | Vitest |
| Deployment | Vercel |

## Pages

| Page | Route | Primary job | Key output |
| --- | --- | --- | --- |
| Command Center | `/dashboard` | "What needs attention right now?" | Metric cards (total power, PUE, WUE, peak temp), one priority finding, recent activity |
| Telemetry | `/telemetry` | "What is the data trend?" | Energy & thermal charts, 6h/24h/7d ranges, latest reading |
| Anomalies | `/anomalies` | "Why is this abnormal?" | Finding detail, actual vs expected, likely factors, AI explanation panel |
| Simulator | `/simulator` | "What if I change these parameters?" | Safety-gated result: energy/water/cost deltas, PUE/WUE, predicted temp |
| Reports | `/reports` | "What has happened?" | Activity timeline and simulation history |

Each page has one primary job and links to the others with smaller CTAs (per `COOLARA_UI_SPECIFICATION.md`).

## Architecture

```text
              +-----------------------+
              | Synthetic telemetry   |
              | (seeded PRNG, 4       |
              |  scenarios)           |
              +-----------+-----------+
                          |
                          v
              +-----------------------+
              | Deterministic layer   |
              | - metrics (PUE, WUE)  |
              | - anomaly rules       |
              | - safety gate         |
              +-----------+-----------+
                          |
            +-------------+-------------+
            |                           |
            v                           v
+-----------------------+     +-----------------------+
| Dashboard / simulator |     | Gemini explanation    |
| Operator decision UI  |     | Qualitative only      |
+-----------+-----------+     +-----------+-----------+
            |                             |
            +--------------+--------------+
                           |
                           v
              +--------------------------+
              | Supabase + Vercel        |
              | Storage and deployment   |
              +--------------------------+
```

### Deterministic layer (`src/lib/calculations`, `src/lib/anomaly`, `src/lib/simulator`)

- `calculations/metrics.ts` — PUE, WUE, total power, dashboard metrics.
- `calculations/baseline.ts` — expected cooling, water, and server temperature as a pure function of ambient temperature and IT load.
- `anomaly/rules.ts` — adverse deviation bands (15/30/50/80%) map to `low`/`medium`/`high`/`critical`; emits structured `Finding` objects.
- `simulator/engine.ts` + `simulator/thresholds.ts` — projects the facility state from input assumptions and rejects any scenario outside safe thresholds (e.g. max server temp `32°C`).

### AI explanation layer (`src/lib/ai`)

- `gemini.ts` — server-only adapter; returns a **rule-based fallback** when `GEMINI_API_KEY` is unconfigured or the call fails.
- `prompt.ts` — guardrail prompt forbids Gemini from inventing measurements, PUE/WUE, savings, costs, or safety approvals. It only returns a short Markdown explanation plus inspection priorities.
- `types.ts` — request/response contract (`source: 'gemini' | 'fallback'`).

### Synthetic telemetry (`src/lib/telemetry`)

- `generator.ts` — four deterministic scenarios: `nominal`, `coolingInefficiency`, `waterStress`, `workloadSpike`.
- `rng.ts` — mulberry32 PRNG so every scenario is reproducible from a seed.
- `current.ts` — returns the latest persisted telemetry point, falling back to a fresh synthetic nominal reading.

### Persistence (`src/lib/supabase`)

- Server-only client using the **service-role key**, never exposed to the browser.
- All operations are best-effort and null-safe: the app falls back to synthetic data when Supabase is unconfigured.
- Schema, indexes, row-level security, and the RLS trigger live under `supabase/migrations/`.

## Repository structure

```text
src/
  app/                 # routes, page components, and API routes
    api/               # dashboard, telemetry, explain, simulate, optimize, reports
  components/          # shared visual components (shell, charts, controls)
  lib/
    calculations/      # deterministic metrics and baselines
    anomaly/           # deterministic anomaly rules
    simulator/         # safety-gated scenario engine and thresholds
    ai/                # server-only Gemini adapter + prompt
    telemetry/         # synthetic telemetry generator
    supabase/          # server client and persistence repository
  types/index.ts       # shared TypeScript contracts
supabase/
  migrations/          # schema, RLS, and activity-query indexes
  seed.sql             # demo facility seed data
```

## API routes

| Endpoint | Purpose | Key response fields |
| --- | --- | --- |
| `GET /api/dashboard` | Latest metrics, active finding, recent activity | `point`, `metrics`, `activeFinding`, `activity` |
| `GET /api/telemetry?scenario=&points=` | Synthetic telemetry series | `points`, plus `latestMetrics` and `findings` for the scenario |
| `POST /api/explain` | Gemini qualitative explanation of a finding | `explanation`, `source` (`gemini` \| `fallback`) |
| `POST /api/simulate` | Deterministic what-if result with safety gate | `safe`, `reason`, deltas, `pue`, `wue` |
| `POST /api/optimize` | Qualitative AI perspective on a safety-gated simulation | `narrative`, `source` (`gemini` \| `fallback`) |
| `GET /api/reports?limit=` | Alert and simulation history | `alerts`, `simulations` |

Shared TypeScript contracts live in `src/types/index.ts`.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in values as needed
npm run dev
```

The app runs without any configuration: it falls back to synthetic telemetry and rule-based explanations. Configure Supabase and Gemini to enable persistence and richer explanations.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build (includes typecheck) |
| `npm run start` | Serve a production build |
| `npm run lint` | ESLint (Next config) |
| `npm run test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |

Tests colocate with source or under `src/**/__tests__/`.

## Environment variables

| Variable | Scope | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | server-only | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | Server-side database access |
| `GEMINI_API_KEY` | server-only | Gemini API access |
| `GEMINI_MODEL` | server-only | Default `gemini-3.6-flash` |

Never commit real values. Server-only keys must never reach the browser.

## Security & limitations

- **Numbers are deterministic only.** The LLM never produces measurements, PUE/WUE, savings, costs, or safety approvals.
- **WUE demo unit.** The displayed WUE is a synthetic water-intensity proxy in `L/MW`, not a standards-grade `L/kWh` measurement.
- **Safety gate.** The simulator rejects any scenario outside the configured thermal/reliability thresholds and never presents an unsafe result as a recommendation.
- **Server-only secrets.** Supabase service-role key and Gemini key are used only server-side (`server-only`).
- **Input validation.** Simulation and explain endpoints validate payloads server-side.
- **Synthetic data.** All telemetry is synthetic demo data, labelled in the UI.
- **Decision support, not control.** Coolara does not control physical equipment; simulation outputs are estimates, not guarantees.
- **Graceful fallback.** Without Supabase or Gemini the app degrades to synthetic generation and rule-based explanations rather than failing.

## Three-minute demo runbook

1. **Monitor (0:00–0:30)** — Open the Command Center; show facility health, PUE/WUE, and synthetic telemetry.
2. **Detect (0:30–1:05)** — Open the active cooling anomaly; compare actual vs expected values.
3. **Explain (1:05–1:35)** — Run the AI analysis; emphasise that metrics/rules are deterministic and Gemini is qualitative only.
4. **Simulate (1:35–2:30)** — Adjust workload/cooling/ambient. Show a safe scenario, then an unsafe rejection.
5. **Optimize (2:30–3:00)** — Summarise the recommended review action and the safety guardrail.

## Database

Migrations and seed data live under `supabase/`:

- `supabase/migrations/0001_init.sql` — schema (`data_centers`, `telemetry`, `alerts`, `simulations`) and row-level security.
- `supabase/migrations/20260815084429_secure_and_index.sql` — activity-query indexes and hardened permissions for the automatic RLS helper.
- `supabase/seed.sql` — demo facility seed data.

Apply them manually via the Supabase SQL editor or CLI. Tables are accessed only through server-side service-role code; the public Data API is closed by default.

## Deploy

Live on Vercel: `https://coolara-ai-data-center-sustainabili.vercel.app`

## Success criteria for judges

- Follow the complete demo path in under five minutes.
- One anomaly explained using structured input only.
- One safe and one unsafe simulation demonstrated.
- All assumptions and limitations disclosed honestly.

## Related docs

- `PRD.md` — MVP scope, features, non-goals, success criteria.
- `TECH.md` — architecture and security limits.
- `API_SPEC.md` — request, response, validation, and error contracts for application endpoints.
- `COOLARA_UI_SPECIFICATION.md` — exact page layouts and the "one page = one primary job" rule.
- `COOLARA_IMPLEMENTATION_PLAN.md` — build phases, team split, API contract, shared types.
- `TASKLIST.md` — build-window checklist.
- `PRE_EXISTING_DISCLOSURE.md`, `AI_TOOLS_DISCLOSURE.md` — submission disclosures.
