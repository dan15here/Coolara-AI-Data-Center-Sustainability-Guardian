# Coolara API Specification

This document describes the internal HTTP API used by the Coolara web application. All responses use JSON and all telemetry represents synthetic demo data.

## Base URL

Production: `https://coolara-ai-data-center-sustainabili.vercel.app`

No endpoint accepts or exposes Supabase or Gemini credentials. Numerical metrics, anomaly findings, simulation impacts, and safety outcomes are computed by deterministic application code. Gemini is used only for qualitative explanations.

## Conventions

- Timestamps are ISO 8601 strings.
- Power values use megawatts (`MW`); energy deltas use megawatt-hours (`MWh`).
- Water values use litres (`L`). In this synthetic MVP, the dashboard's WUE
  indicator is a water-intensity proxy expressed as `L/MW` (litres per MW of
  IT power), not a standards-grade `L/kWh` measurement.
- A successful request returns `200 OK`.
- Invalid request input returns `400 Bad Request` with `{ "error": "..." }`.
- The demo data center identifier is `dc-01`.

## Endpoints

### `GET /api/dashboard`

Returns the latest operational snapshot for the demo data center. It includes a persisted telemetry reading when available and otherwise generates a synthetic nominal reading.

Response fields:

| Field | Description |
| --- | --- |
| `point` | Latest `TelemetryPoint`. |
| `metrics` | Deterministic total power, PUE, WUE, and peak server temperature. |
| `activeFinding` | Highest-severity `Finding`, or `null` when no anomaly is active. |
| `activity` | Recent persisted alerts and simulation events. |

### `GET /api/telemetry`

Generates a synthetic telemetry series, calculates metrics and findings for its latest point, and persists the latest reading and findings when Supabase is configured.

Query parameters:

| Parameter | Default | Accepted values |
| --- | --- | --- |
| `scenario` | `nominal` | `nominal`, `coolingInefficiency`, `waterStress`, `workloadSpike` |
| `points` | `24` | Integer from `1` to `200` |

Example:

```text
GET /api/telemetry?scenario=coolingInefficiency&points=24
```

Response fields:

| Field | Description |
| --- | --- |
| `dataCenterId` | Always `dc-01` for the MVP. |
| `points` | Array of `TelemetryPoint` values. |
| `latestMetrics` | Deterministic metrics for the last point. |
| `findings` | Deterministic findings for the last point. |

Invalid scenarios return `400`.

### `POST /api/explain`

Requests a qualitative explanation for a valid deterministic finding. Gemini receives structured finding data only. If Gemini is unavailable, the response uses the rule-based fallback.

Request body:

```json
{
  "finding": {
    "id": "example-finding-id",
    "severity": "high",
    "metric": "coolingPower",
    "actual": 7.73,
    "expected": 5.13,
    "deviationPercent": 50.6,
    "detectedAt": "2026-08-15T08:52:24.973Z",
    "likelyFactors": ["Elevated ambient temperature"],
    "explanationInput": {
      "dataCenterId": "dc-01",
      "ambientTempC": 35.6
    }
  }
}
```

Response fields:

| Field | Description |
| --- | --- |
| `explanation` | Qualitative Markdown explanation and operator inspection priorities. |
| `source` | `gemini` when the model returned a response; otherwise `fallback`. |

The finding must include every field shown above, with a valid severity and metric. Invalid JSON or an invalid finding returns `400`.

### `POST /api/simulate`

Runs a deterministic what-if simulation against the current facility baseline and persists the result when Supabase is configured. It never controls physical equipment.

Request body:

```json
{
  "coolingSetpointC": 22,
  "workloadPercent": 30,
  "ambientTempC": 24
}
```

Response fields:

| Field | Description |
| --- | --- |
| `safe` | Whether the thermal/reliability safety gate allows the scenario. |
| `reason` | Deterministic explanation of the safety decision. |
| `predictedServerTempC` | Predicted server temperature in °C. |
| `estimatedEnergyDeltaMwh` | Estimated energy change in MWh. |
| `estimatedWaterDeltaLiters` | Estimated water change in L. |
| `estimatedCostDeltaIdr` | Estimated cost change in Indonesian rupiah. |
| `pue`, `wue` | Deterministic efficiency metrics for the scenario. |

All three request fields must be finite numbers. Invalid JSON or input returns `400`.

### `POST /api/optimize`

Returns a qualitative AI perspective on an already-computed, safety-gated
simulation. It does not calculate, approve, or apply any operating change.
Gemini receives only the supplied deterministic input, result, and optional
originating finding. If Gemini is unavailable, the endpoint returns a
rule-based fallback.

Request body:

```json
{
  "input": {
    "coolingSetpointC": 22,
    "workloadPercent": 30,
    "ambientTempC": 24
  },
  "result": {
    "safe": true,
    "reason": "All parameters are within safe operating thresholds.",
    "predictedServerTempC": 31.2,
    "estimatedEnergyDeltaMwh": -2.9,
    "estimatedWaterDeltaLiters": -2388,
    "estimatedCostDeltaIdr": -4392760,
    "pue": 1.54,
    "wue": 1007.84
  },
  "finding": null
}
```

`finding` may instead contain a valid `Finding` when the simulation began from
an anomaly page. `input` and `result` must contain finite numerical values.

Response fields:

| Field | Description |
| --- | --- |
| `narrative` | Qualitative Markdown context; no new numerical claims or operating setpoints. |
| `source` | `gemini` when the model returned a response; otherwise `fallback`. |
| `model` | Present only when Gemini returned the response. |

### `GET /api/reports`

Returns persisted anomaly and simulation history for the demo data center.

Query parameters:

| Parameter | Default | Accepted values |
| --- | --- | --- |
| `limit` | `20` | Integer from `1` to `100` |

Response fields:

| Field | Description |
| --- | --- |
| `alerts` | Array of persisted `Finding` values, newest first. |
| `simulations` | Array of persisted simulations, each containing the simulation result plus `id` and `createdAt`. |

When Supabase is unconfigured or no records exist, the endpoint returns empty arrays rather than failing.

## Shared data shapes

```ts
type TelemetryPoint = {
  timestamp: string;
  dataCenterId: string;
  itLoadMw: number;
  itPowerMw: number;
  coolingPowerMw: number;
  waterLiters: number;
  ambientTempC: number;
  serverTempC: number;
};

type Finding = {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: 'coolingPower' | 'waterUsage' | 'serverTemperature';
  actual: number;
  expected: number;
  deviationPercent: number;
  detectedAt: string;
  likelyFactors: string[];
  explanationInput: Record<string, number | string>;
};
```

The authoritative TypeScript contracts are maintained in [`src/types/index.ts`](./src/types/index.ts).
