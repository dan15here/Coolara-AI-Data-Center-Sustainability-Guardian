# Repository Guidelines

## What this is

Coolara is a sustainability decision-support MVP for data-centre operators, built as a Next.js 16 App Router app (React 19, TypeScript, Tailwind CSS v4). The product flow is **Monitor → Detect → Explain → Simulate → Optimize**. It is a pre-event starter: no product-specific functionality exists yet (`src/app/page.tsx` is a placeholder).

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
- `npm run build` — production build. Note: there is no separate `typecheck` script; `next build` and `tsc` are not wired as standalone npm scripts.
- `npm run start` — serve a production build.

There is no test framework configured and no test script.

## Structure

- `src/app/` — routes and global UI (`page.tsx`, `layout.tsx`, `globals.css`). Add API routes under `src/app/api/**`.
- `src/lib/` — reusable integrations. Existing: `src/lib/supabase/client.ts` (browser client). Planned backend dirs per the implementation plan: `src/lib/calculations/`, `src/lib/anomaly/`, `src/lib/simulator/`, `src/lib/ai/`, `src/lib/supabase/`, plus `src/types/` for shared contracts.
- Root config: `package.json`, `tsconfig.json`, `postcss.config.mjs`.

## Path alias

The `@/` alias is **not** configured in `tsconfig.json` (`baseUrl`/`paths` are absent). Do not assume `@/` imports resolve; use relative imports until an alias is actually added. If you add one, wire it in `tsconfig.json`.

## Testing Guidelines

No automated test framework is configured yet. At minimum, run `npm run lint` and `npm run build`, then manually verify affected routes with `npm run dev`. When introducing tests, colocate them with the code or under `src/**/__tests__/`, name files `*.test.ts` or `*.test.tsx`, and add the test command to `package.json`.

## Commit & Pull Request Guidelines

Git history is not present in this checkout, so no repository-specific commit convention can be inferred. Use concise imperative messages, for example `Add Supabase session helper`. Keep commits focused. Pull requests should explain the change, link the relevant task or issue, list validation commands, and include screenshots for visual changes.

## Security & Event Boundaries

Keep secrets only in local environment variables. The starter intentionally excludes product-specific AI calls, database schema, data, and integrations; follow the rules in `README.md` and complete `PRE_EXISTING_DISCLOSURE.md` accurately before submission.
