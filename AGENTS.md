# Repository Guidelines

## What this is

Coolara is a sustainability decision-support MVP for data-centre operators, built as a Next.js 16 App Router app (React 19, TypeScript, Tailwind CSS v4). The product flow is **Monitor → Detect → Explain → Simulate → Optimize**. The root route (`src/app/page.tsx`) redirects to `/dashboard`.

## Read before adding feature work

These root docs define hard product constraints — read them before implementing anything:

- `PRD.md` — MVP scope, features, non-goals.
- `TECH.md` — stack, architecture, env vars, security limits.
- `COOLARA_UI_SPECIFICATION.md` — exact page layouts and the "one page = one primary job" rule. Follow this for any UI work.
- `COOLARA_IMPLEMENTATION_PLAN.md` — build phases, team split, API contract, shared TypeScript types.
- `TASKLIST.md` — build-window checklist.
- `PRE_EXISTING_DISCLOSURE.md`, `AI_TOOLS_DISCLOSURE.md` — completion rules (update these before submission).

## Non-negotiable architecture rule

**Numbers come from deterministic TypeScript logic only. Never from the LLM.** Gemini receives structured findings and returns qualitative explanation/recommendations only. It must never invent measurements, PUE/WUE values, savings, costs, or safety approvals. A configurable thermal/reliability gate rejects unsafe simulated scenarios. This is repeated across every doc and is the single most important constraint.

## Commands

Run from the repo root:

- `npm install` — install deps.
- `npm run dev` — local dev server.
- `npm run lint` — ESLint (Next config).
- `npm run build` — production build (includes typecheck; there is no standalone `typecheck` script).
- `npm run start` — serve a production build.
- `npm run test` — run Vitest once.
- `npm run test:watch` — run Vitest in watch mode.

Tests colocate with source or under `src/**/__tests__/`, named `*.test.ts` / `*.test.tsx`.

## Structure

- `src/app/` — routes and global UI. API routes live under `src/app/api/**`. Route-scoped components under `src/app/_components/**`.
- `src/components/` — shared visual components.
- `src/lib/` — integrations:
  - `calculations/` — deterministic metrics and baselines.
  - `anomaly/` — deterministic anomaly rules.
  - `simulator/` — safety-gated scenario engine and thresholds.
  - `ai/` — server-only Gemini adapter and prompt.
  - `telemetry/` — synthetic telemetry generator.
  - `supabase/` — server/client clients and repository.
- `src/types/index.ts` — shared TypeScript contracts between frontend and backend.
- `supabase/` — migrations and seed SQL.
- Root config: `package.json`, `tsconfig.json`, `postcss.config.mjs`, `vitest.config.ts`.

## Path alias

The `@/` alias is configured in `tsconfig.json` (`baseUrl` + `paths` → `./src/*`). Use `@/` imports.

## Environment variables

Server-only values (never commit real values; never expose to browser):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (default `gemini-3.6-flash` in docs; code fallback default is `gemini-2.5-flash`)

The Supabase browser client reads `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` and is `null` when unconfigured. Backend persists best-effort and falls back to synthetic data when Supabase is unconfigured.

## Security & Event Boundaries

Keep secrets only in environment variables. Server-only modules import `server-only` (stubbed in tests via `vitest.server-only-stub.ts`). The service-role key must only be used server-side; never ship it to the browser. Follow the rules in `README.md` and complete `PRE_EXISTING_DISCLOSURE.md` accurately before submission.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
