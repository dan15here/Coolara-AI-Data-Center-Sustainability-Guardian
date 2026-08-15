# Coolara — 3-Minute Pitch & Demo Script

**Target duration:** 2:45–3:00 minutes  
**Demo path:** Landing → Command Center → Anomalies → Gemini explanation → What-if Simulator → Reports

## Before recording / presenting

- Open the production deployment in a desktop browser and use dark mode.
- Start at the landing page and keep one safe simulation plus one rejected simulation in Reports history.
- Keep the Gemini API configured. If it is rate-limited, the deterministic fallback is still safe to show, but a live Gemini explanation is stronger.
- Do not spend time explaining every card; follow the click path below.

## Timeline and speaker script

| Time | Screen / action | What to say |
| --- | --- | --- |
| **0:00–0:20** | Landing page. Let the hero and dashboard preview show. | “Data-centre operators have to balance reliability, energy, water use, and thermal risk at the same time. Telemetry can show that something is unusual, but it does not tell an operator what matters most or whether a proposed response is safe. **Coolara is an AI sustainability decision-support workspace that turns those signals into a safer, decision-ready workflow.**” |
| **0:20–0:32** | Click **Explore Command Center**. Let the Coolara loading screen appear. | “Our flow is simple: **Monitor, Detect, Explain, Simulate, then Optimize**. The numerical layer is deterministic; Gemini only adds qualitative context. It never controls infrastructure or invents operating values.” |
| **0:32–0:58** | Command Center. Point to scenario tabs, KPI cards, and active finding. Click **Cooling inefficiency**. | “This Command Center gives an operator one view of synthetic energy, water, cooling, and thermal telemetry. I can move from normal operation into a cooling-efficiency scenario. Coolara compares actual values against deterministic expected baselines, highlights the most important deviation, and shows PUE, WUE, total power, and peak server temperature together.” |
| **0:58–1:10** | Click **View anomaly details** or open **Anomalies** in the sidebar. | “Instead of a generic alert feed, the Anomalies view prioritizes the condition requiring review and shows the actual value, expected baseline, deviation, severity, and possible contributing factors.” |
| **1:10–1:35** | Click **Analyze** on one finding. Pause on the Gemini explanation. | “Here Gemini turns the structured deterministic finding into an operator-readable brief. Notice that the context is humanized—DC-01, temperature in degrees, and WIB time—not raw database fields. Gemini explains what to inspect next, while the measurements, thresholds, and safety verdict remain deterministic.” |
| **1:35–1:55** | Click **Simulate response**. On simulator, click **Try a safe scenario**, then **Run simulation** if needed. | “Explanation alone is not enough. Before acting, an operator can test cooling setpoint, workload, and ambient assumptions in the What-if Simulator. This safe scenario returns a deterministic impact on energy, water, cost, PUE, WUE, and predicted server temperature.” |
| **1:55–2:18** | Click **Try an unsafe scenario**. Show the rejected result and predicted temperature / threshold. | “Now I will test an unsafe scenario. Coolara rejects it because the predicted server temperature crosses the hard thermal threshold. This is the key guardrail: the product does not turn AI output into an operational instruction. Unsafe scenarios are visibly blocked by deterministic logic.” |
| **2:18–2:38** | Open **Reports**. Use the source filters, then show **Compare simulations** with A and B different. | “Every anomaly and simulation is retained as synthetic operational history in Supabase. Reports separates anomaly history from What-if simulations. I can compare two different scenarios directly, so the delta shows the trade-off instead of a meaningless zero-to-zero comparison.” |
| **2:38–3:00** | Stay on Reports, or return to dashboard. | “Coolara gives operators a responsible decision loop: see the signal, understand the deviation, get qualitative context, test the response, and reject unsafe choices before action. It makes energy, water, cooling, and reliability trade-offs visible in one workflow. **Coolara: make every response resource-aware.**” |

## One-line answers for judge questions

- **Is this live data-centre control?** “No. This is a clearly labelled synthetic-data prototype for decision support; it does not control equipment.”
- **What does AI decide?** “Gemini provides qualitative explanation only. Metrics, anomalies, costs, PUE/WUE, and safety outcomes come from deterministic TypeScript logic.”
- **Why Supabase?** “Supabase stores synthetic telemetry, alert episodes, and simulation history so the operator can review and compare decisions over time.”
- **What makes it safe?** “A deterministic thermal gate rejects scenarios that exceed the configured maximum server-temperature threshold.”
- **What is the sustainability impact?** “The operator can see energy and water trade-offs together before committing to a response, rather than optimizing one resource in isolation.”

## Presenter notes

- Speak at a steady pace; do not read card values one by one.
- If Gemini takes too long, say: “The deterministic fallback preserves the same safety boundary; the AI layer is optional qualitative context.” Then continue to the simulator.
- If time is tight, skip the Reports filter interaction and go straight to the two-simulation comparison.
