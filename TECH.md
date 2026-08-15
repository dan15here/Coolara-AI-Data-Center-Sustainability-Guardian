# Coolara — Technical plan

## Proposed technology stack

| Layer | Proposed technology | Purpose |
| --- | --- | --- |
| Web application | Next.js + TypeScript | A reliable full-stack web framework with type-safe application code. |
| UI | Tailwind CSS + reusable UI components | Fast, consistent, responsive interface development. |
| Charts | Recharts | Operational telemetry and simulation visualisation. |
| Database | Supabase PostgreSQL | Storage for synthetic telemetry, alerts, and simulation records. |
| AI explanation | Google Gemini API | Qualitative explanation of structured findings and recommendations. |
| Deployment | Vercel | Continuous deployment of the web application. |
| Quality | ESLint, TypeScript checks, and tests | Basic correctness and maintainability checks. |

## Conceptual architecture

```text
              +-----------------------+
              | Synthetic telemetry   |
              +-----------+-----------+
                          |
                          v
              +-----------------------+
              | Deterministic layer   |
              | - metrics             |
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
              | Supabase + Vercel         |
              | Storage and deployment    |
              +--------------------------+
```

## Design principles

- **Deterministic numerical layer:** telemetry metrics, PUE, WUE, deviations,
  estimates, and safety decisions are calculated by application logic.
- **AI explanation layer:** Gemini receives structured findings and provides
  qualitative explanations only. It must not invent measurements, savings, or
  safety outcomes.
- **Safety-first simulation:** any scenario beyond the configured thermal or
  reliability threshold is marked unsafe and rejected.
- **Demo transparency:** telemetry is synthetic unless an explicitly licensed
  source is disclosed.

## Environment variables

Use deployment/server environment variables only. Never commit real values.

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side database access. |
| `GEMINI_API_KEY` | Server-side Gemini API access. |
| `GEMINI_MODEL` | Gemini model selected for the deployment. |

## Security and operational limits

- API keys must never be sent to the browser or committed to Git.
- Validate user-controlled simulation inputs on the server.
- Apply database access rules appropriate to the demo scope.
- Coolara is a decision-support prototype; it does not control real equipment.
- Simulation outputs are estimates, not guarantees of operational savings.
