# Coolara — AI Data-Center Sustainability Guardian

A sustainability decision-support prototype for data-centre operators. It helps teams understand operational signals across energy, water, cooling, and thermal performance before they consider a response.

Product flow: **Monitor → Detect → Explain → Simulate → Optimize**

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- Recharts (charts)
- Supabase (PostgreSQL persistence)
- Google Gemini API (qualitative explanation only)
- Vitest (unit tests)

## MVP features

| Page | Route | Purpose |
| --- | --- | --- |
| Command Center | `/dashboard` | Executive overview, metric cards, one priority finding |
| Telemetry | `/telemetry` | Energy & thermal charts with 6h/24h/7d ranges |
| Anomalies | `/anomalies` | Finding detail, actual vs expected, AI explanation |
| Simulator | `/simulator` | What-if scenarios with a deterministic safety gate |
| Reports | `/reports` | Activity timeline and simulation history |

## Core architecture

- **Numbers come from deterministic TypeScript logic only.** Never from the LLM.
- **Gemini is qualitative only.** It receives structured findings and returns explanation/recommendations. It must never invent measurements, PUE/WUE values, savings, costs, or safety approvals.
- **Safety gate.** The simulator rejects any scenario that violates the configured thermal/reliability thresholds.
- **Synthetic data.** All telemetry is synthetic and labelled as such in the UI.
- **Graceful fallback.** If Supabase or Gemini is unconfigured, the app falls back to synthetic generation and rule-based explanations rather than failing.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in values as needed
npm run dev
```

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build (includes typecheck)
- `npm run start` — serve a production build
- `npm run lint` — ESLint
- `npm run test` — run Vitest once
- `npm run test:watch` — run Vitest in watch mode

## Environment variables

| Variable | Scope |
| --- | --- |
| `SUPABASE_URL` | server-only |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only |
| `GEMINI_API_KEY` | server-only |
| `GEMINI_MODEL` | server-only (default `gemini-3.6-flash`) |

Never commit real values. Server-only keys must never reach the browser.

## API routes

| Endpoint | Purpose |
| --- | --- |
| `GET /api/dashboard` | Latest metrics, active finding, recent activity |
| `GET /api/telemetry?scenario=&points=` | Synthetic telemetry series |
| `POST /api/explain` | Gemini qualitative explanation of a finding |
| `POST /api/simulate` | Deterministic what-if result with safety gate |
| `GET /api/reports` | Alert and simulation history |

Shared TypeScript contracts live in `src/types/index.ts`.

## Database

Migrations and seed data live under `supabase/`:

- `supabase/migrations/0001_init.sql` — schema (data_centers, telemetry, alerts, simulations)
- `supabase/seed.sql` — demo facility seed data

Apply them manually via the Supabase SQL editor or CLI.

## Deploy

Live on Vercel: `https://coolara-ai-data-center-sustainabili.vercel.app`

## Related docs

- `PRD.md` — MVP scope, features, non-goals
- `TECH.md` — architecture and security limits
- `COOLARA_UI_SPECIFICATION.md` — exact page layouts
- `COOLARA_IMPLEMENTATION_PLAN.md` — build phases and API contract
- `PRE_EXISTING_DISCLOSURE.md`, `AI_TOOLS_DISCLOSURE.md` — submission disclosures