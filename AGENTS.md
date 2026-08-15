# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 starter using the App Router, React, TypeScript, and Tailwind CSS.

- `src/app/` contains routes and global UI: `page.tsx` is the home route, `layout.tsx` defines shared document structure, and `globals.css` holds global styles.
- `src/lib/` contains reusable integrations. Keep Supabase browser-client code in `src/lib/supabase/` and AI-related helpers in `src/lib/ai/`.
- Root documents define the project constraints: read `PRD.md`, `TECH.md`, `TASKLIST.md`, and the disclosure files before adding feature work.
- `.env.example` lists required configuration; never commit real credentials.

Place route-specific components beside their route when they are not reused. Put broadly reusable helpers in `src/lib/` and use descriptive, narrowly scoped modules such as `src/lib/supabase/client.ts`.

## Build, Test, and Development Commands

Run commands from the repository root:

- `npm install` installs dependencies.
- `npm run dev` starts the local Next.js development server.
- `npm run lint` runs ESLint using the Next.js configuration.
- `npm run build` creates a production build and performs framework type checks.
- `npm run start` serves a completed production build.

## Coding Style & Naming Conventions

Use TypeScript for application code and follow the existing two-space indentation, semicolons, and single-quote import style. Name React components in `PascalCase`; name functions, variables, and utilities in `camelCase`. Use lowercase route folder names and descriptive filenames such as `client.ts`. Prefer small components, strict TypeScript types, and imports through the existing `@/` alias when applicable. Run `npm run lint` before handing off changes.

## Testing Guidelines

No automated test framework is configured yet. At minimum, run `npm run lint` and `npm run build`, then manually verify affected routes with `npm run dev`. When introducing tests, colocate them with the code or under `src/**/__tests__/`, name files `*.test.ts` or `*.test.tsx`, and add the test command to `package.json`.

## Commit & Pull Request Guidelines

Git history is not present in this checkout, so no repository-specific commit convention can be inferred. Use concise imperative messages, for example `Add Supabase session helper`. Keep commits focused. Pull requests should explain the change, link the relevant task or issue, list validation commands, and include screenshots for visual changes.

## Security & Event Boundaries

Keep secrets only in local environment variables. The starter intentionally excludes product-specific AI calls, database schema, data, and integrations; follow the rules in `README.md` and complete `PRE_EXISTING_DISCLOSURE.md` accurately before submission.
