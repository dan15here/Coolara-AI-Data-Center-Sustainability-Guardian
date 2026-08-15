# Coolara — AI tools and model disclosure

This document discloses the tools, services, and AI use in the Coolara
hackathon prototype during the official build window.

## Tools and services

| Tool / service | Status | Role in the project |
| --- | --- | --- |
| OpenAI Codex | Used | Assisted with implementation, debugging, refactoring, code review, and verification. Team members reviewed the resulting code and decisions. |
| GPT-5.6 Terra (medium reasoning) | Used | Model used through OpenAI Codex to assist implementation, debugging, refactoring, documentation, and verification. Team members reviewed the resulting code and decisions. |
| Claude Sonnet 5 (high reasoning effort) | Used | Assisted ideation, implementation review, and refinement during development. Team members reviewed the resulting code and decisions. |
| Google Gemini API | Used | Provides qualitative explanations of structured anomaly findings and qualitative perspectives on safety-gated simulations. |
| `gemini-3.5-flash-lite` | Used | Gemini model configured through the server-side `GEMINI_MODEL` environment variable. |
| Supabase PostgreSQL | Used | Stores synthetic telemetry, detected alert episodes, and simulation records. |
| Vercel | Used | Hosts and deploys the web application. |
| Next.js, TypeScript, Tailwind CSS, Recharts | Used | Application framework, type-safe code, UI styling, and data visualisation. |

## How AI is used

Coolara uses a **deterministic-first** architecture:

1. Application code calculates telemetry metrics, expected baselines,
   deviations, PUE, WUE, simulation estimates, and safety outcomes.
2. Application code sends only structured findings to Gemini.
3. Gemini produces a qualitative explanation, plausible contributing factors,
   and operator-oriented next steps.
4. The application renders this explanation alongside the deterministic source
   data and the safety-gate result.

Gemini is not the numerical source of truth. It is not allowed to invent
measurements, energy or water savings, PUE/WUE values, temperatures, costs, or
safety approvals.

## Data and safety disclosure

- The prototype uses synthetic/demo telemetry unless a source is explicitly
  identified and licensed.
- Coolara is a decision-support tool. It does not autonomously control real
  data-centre equipment.
- A configurable thermal/reliability gate rejects unsafe simulated scenarios.
- Gemini API credentials are stored only in server/deployment environment
  variables. They are never committed to the repository or exposed to clients.

## Final verification before submission

- [x] Replace every `Planned / confirm` status above with the actual final status.
- [x] Record the exact deployed Gemini model name: `gemini-3.5-flash-lite`.
- [x] Confirm the UI identifies AI-generated text as an explanation or perspective.
- [x] Confirm all numerical outputs come from deterministic application logic.
- [x] Confirm the README includes this disclosure and data-source disclosure.
