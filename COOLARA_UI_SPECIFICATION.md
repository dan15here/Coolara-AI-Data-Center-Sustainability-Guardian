# Coolara — UI Specification for the Hackathon MVP

**Purpose:** Prevent page overlap and ensure each navigation item has one clear operational purpose.  
**Design direction:** Calm, professional infrastructure console. Use a neutral near-black or warm-charcoal base, white/gray typography, restrained teal for healthy states, amber for warning, and red only for critical conditions. Avoid navy gradients, glass effects, oversized shadows, and decorative widgets.

## 1. Non-negotiable navigation model

| Navigation item | Question it answers | Primary content | Must not duplicate |
| --- | --- | --- | --- |
| **Command Center** | “What needs my attention right now?” | Executive summary, one priority finding, next decision | Detailed telemetry charts or full AI explanation |
| **Telemetry** | “What is the data trend?” | Time-series charts and raw/latest readings | Executive decision cards or simulator controls |
| **Anomalies** | “Why is this abnormal and what should I inspect?” | Finding detail, actual vs expected, causes, Gemini explanation | Broad dashboard summary or simulation controls |
| **Simulator** | “What happens if I change these parameters?” | Inputs, deterministic result, safety gate | Historical charts or long AI report |
| **Reports** | “What has happened?” | Event/activity timeline and completed simulations | Live monitoring controls |

**Rule:** every page gets one primary job. If a component belongs to two pages, use a smaller link/CTA to the detailed page instead of embedding the whole component twice.

## 2. Persistent application shell

```text
+-------------------+-------------------------------------------------------+
| LEFT SIDEBAR      | TOPBAR                                                |
|                   +-------------------------------------------------------+
| Coolara logo      | PAGE CONTENT                                          |
| Sustainability    |                                                       |
| Guardian          |                                                       |
|                   |                                                       |
| Command Center    |                                                       |
| Telemetry         |                                                       |
| Anomalies [count] |                                                       |
| Simulator         |                                                       |
| Reports           |                                                       |
|                   |                                                       |
| Synthetic data    |                                                       |
| User / team       |                                                       |
+-------------------+-------------------------------------------------------+
```

### Sidebar rules

- Width: approximately `256–280px` desktop; collapsible or drawer on narrow screens.
- Only navigation, synthetic-data label, and compact user/team identity live here.
- Show the active route clearly with a subtle neutral surface plus a slim left indicator.
- The anomaly count is the only persistent badge. Do not add metric cards, charts, or “operational posture” to the sidebar.
- Keep labels consistent: **Command Center**, **Telemetry**, **Anomalies**, **Simulator**, **Reports**.

### Topbar rules

- One line: page title/breadcrumb on the left; facility selector, last updated time, stream status, and one global **Run simulation** CTA on the right.
- Global CTA navigates to `/simulator`; it does not run a hidden calculation from every page.
- Do not repeat the same title inside the page except for a small descriptive section heading.

## 3. Command Center — exact layout

**Job:** executive operations overview. It should be useful in 20 seconds.

```text
TOPBAR

[ Operational posture ---------------------------------------------------- ]
  Status pill + one-sentence status          Demo data  Reliability  Energy  Water

FACILITY SNAPSHOT
Executive operations overview                           ● Synthetic demo telemetry
One-sentence description

[ Total power ] [ PUE ] [ WUE ] [ Peak server temperature ]

ACTIVE PRIORITY FINDING                                      CRITICAL / HIGH
Decision-ready anomaly
[ anomaly summary and contributing factor chips ] [ actual | expected | deviation ]
                                          [ View anomaly details ] [ Simulate response ]

[ Decision support ------------------------------------------------------- ]
  “Simulate before recommending action”                  [ Open What-if Simulator ]

RECENT OPERATIONAL EVENTS                                 [ View activity log ]
  event 1                 event 2                  event 3
```

### Command Center content rules

- **Operational posture:** one concise condition sentence and three circular health percentages: Reliability, Energy, Water. They are health indicators, not PUE/WUE duplicates.
- **Metric row:** exactly four cards: Total Power, PUE, WUE, Peak Server Temperature. Each has one value, unit, and compact baseline/target note.
- **Priority finding:** show only the highest-severity active finding. Do not render the Gemini output here.
- **Decision support:** one compact bridge to Simulator, not the simulator itself.
- **Activity:** maximum three recent events. Full history belongs to Reports.

## 4. Telemetry — exact layout

**Job:** trend inspection. It is deliberately chart-led.

```text
LIVE TELEMETRY
Telemetry overview
Track energy demand and thermal conditions across synthetic DC-01 data.

[ Energy & Cooling Demand chart (wide, 2/3) ] [ Temperature Conditions chart (1/3) ]
  IT power / Cooling / Total energy            Ambient / Server / threshold
  6h | 24h | 7d controls                       current temperature + safe status

[ optional compact latest-reading table ]
```

### Telemetry content rules

- At most two principal charts on desktop; no dashboard metric grid at the top.
- Every chart must have title, units, legend, readable axes, time window, and a visible threshold when relevant.
- The anomaly event can appear as a chart annotation and link to `/anomalies`.
- Do not place AI explanation, action recommendations, or simulator sliders on this page.

## 5. Anomalies — exact layout

**Job:** explain a single actionable operational finding.

```text
DETECTION & EXPLANATION
Anomaly detection

[ Critical anomaly card -------------------------------------------------- ]
  severity + detected time      title                Actual | Expected | Deviation
  short deterministic summary
  [ contributing factor ] [ contributing factor ] [ contributing factor ]
  [ View source telemetry ] [ Simulate response ]  scenario selector

[ Coolara AI analysis ---------------------------------------------------- ]
  provider state: Gemini ready / unavailable
  idle: “Run analysis to ask Gemini for a qualitative explanation.”
  loading: visible progress state
  result: readable Markdown sections, bullets, and bold labels
  footer: “Structured telemetry input” + [ Analyze findings ]
```

### Anomaly content rules

- Actual, expected, and deviation must be deterministic and visually grouped.
- Gemini panel is the only long-form narrative panel in the app.
- Gemini content must be rendered as Markdown, never a single unformatted text block.
- Provider badge says `Gemini ready` when configured; never claim real-time AI if unavailable.
- “Simulate response” navigates to Simulator with a matching preselected scenario.

## 6. Simulator — exact layout

**Job:** assess operational trade-offs before a recommendation is accepted.

```text
DECISION SUPPORT
What-if simulator

[ Simulator panel -------------------------------------------------------- ]
  Left: input controls                         Right: deterministic result
  Cooling setpoint slider                      Estimated cost impact
  IT workload assumption slider                Safety gate: safe / unsafe
  Ambient temperature slider                   Energy | Water | Cost
  [ Reset ] [ Run safe simulation ]            Predicted temp | PUE | WUE
                                                Simple before/after bars
```

### Simulator content rules

- Keep the page to a two-column layout on desktop; stack on mobile.
- The safety verdict is visually strongest: green only if safe, red if unsafe.
- An unsafe result states the threshold and why it is rejected. It cannot use a “recommended” treatment.
- Button text describes outcome: **Run safe simulation**, not generic “Submit”.
- Charts are comparison bars only; detailed historical trends belong to Telemetry.

## 7. Reports — exact layout

**Job:** trace operational history, not live monitoring.

```text
OPERATIONAL HISTORY
Reports

[ Summary filters: date range | event type | severity ]

[ Activity timeline / event table ]
  time | event | source | severity | resulting status

[ Optional: simulation history ]
  scenario | safe/unsafe | predicted temp | created time
```

### Reports content rules

- Show events from anomaly detection and simulations only.
- Make the first version a simple sorted timeline; avoid fake complex analytics.
- No primary dashboard metrics and no long AI text.

## 8. UI states that must be designed

| State | Required behavior |
| --- | --- |
| Loading | Skeleton or concise loading label; page shell stays stable |
| No data | Say data is unavailable and explain the next action; never show blank panels |
| Gemini unavailable | Preserve deterministic finding; show explanation fallback and configuration-safe message |
| No anomaly | Green/neutral posture with a short “No active anomalies” message |
| Unsafe simulation | Red status, threshold breach reason, no positive recommendation |
| Small screen | Sidebar becomes drawer; grids stack; no horizontal chart/card overflow |

## 9. Visual quality checklist

- [ ] One page = one primary job, matching the navigation table.
- [ ] Sidebar has no operational content beyond nav/status label.
- [ ] Command Center has no full telemetry charts or AI prose.
- [ ] Telemetry has no metric-card dashboard clone.
- [ ] Anomalies contains all Gemini prose and the detailed deterministic finding.
- [ ] Simulator contains all input controls and safety outcome.
- [ ] Every metric has a unit and readable label.
- [ ] Red is reserved for critical/unsafe states; amber is warning; teal/green is healthy.
- [ ] Synthetic-data label is visible but not distracting.
- [ ] Every CTA navigates or performs a real, explainable action.
