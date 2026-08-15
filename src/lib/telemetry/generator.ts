import { createRng, seededRange } from './rng';
import { computeExpectedBaseline } from '@/lib/calculations/baseline';
import type { TelemetryPoint } from '@/types';

export const DEMO_DATA_CENTER_ID = 'dc-01';

export type ScenarioId = 'nominal' | 'coolingInefficiency' | 'waterStress' | 'workloadSpike';

export interface ScenarioPreset {
  id: ScenarioId;
  label: string;
  description: string;
}

export const scenarioPresets: Record<ScenarioId, ScenarioPreset> = {
  nominal: {
    id: 'nominal',
    label: 'Normal operation',
    description: 'Healthy baseline: cooling, water use, and server temperature track expected conditions.',
  },
  coolingInefficiency: {
    id: 'coolingInefficiency',
    label: 'Cooling inefficiency',
    description: 'Elevated ambient temperature pushes cooling power and server temperature above baseline.',
  },
  waterStress: {
    id: 'waterStress',
    label: 'Water stress',
    description: 'Water consumption rises well above the expected baseline (e.g. cooling tower drift or leak).',
  },
  workloadSpike: {
    id: 'workloadSpike',
    label: 'Workload spike',
    description: 'A surge in IT load outpaces the cooling system response, raising server temperature.',
  },
};

const IT_LOAD_MIN_MW = 8;
const IT_LOAD_MAX_MW = 12;
const AMBIENT_MIN_C = 22;
const AMBIENT_MAX_C = 28;
const PSU_LOSS_MIN = 0.03;
const PSU_LOSS_MAX = 0.06;

function buildPoint(
  scenarioId: ScenarioId,
  rng: () => number,
  progress: number,
  at: Date,
): TelemetryPoint {
  let itLoadMw = seededRange(rng, IT_LOAD_MIN_MW, IT_LOAD_MAX_MW);
  let ambientTempC = seededRange(rng, AMBIENT_MIN_C, AMBIENT_MAX_C);

  if (scenarioId === 'coolingInefficiency') {
    ambientTempC += progress * seededRange(rng, 8, 14);
  }
  if (scenarioId === 'workloadSpike') {
    itLoadMw *= 1 + progress * seededRange(rng, 0.3, 0.5);
  }

  const psuLossRatio = seededRange(rng, PSU_LOSS_MIN, PSU_LOSS_MAX);
  const itPowerMw = itLoadMw * (1 + psuLossRatio);

  const expected = computeExpectedBaseline(ambientTempC, itLoadMw);

  let coolingPowerMw = expected.coolingPowerMw * seededRange(rng, 0.95, 1.05);
  let waterLiters = expected.waterLiters * seededRange(rng, 0.95, 1.05);
  let serverTempC = expected.serverTempC * seededRange(rng, 0.97, 1.03);

  if (scenarioId === 'coolingInefficiency') {
    coolingPowerMw *= 1 + progress * seededRange(rng, 0.3, 0.5);
    serverTempC *= 1 + progress * seededRange(rng, 0.15, 0.3);
  }
  if (scenarioId === 'waterStress') {
    waterLiters *= 1 + progress * seededRange(rng, 1.2, 2.0);
  }
  if (scenarioId === 'workloadSpike') {
    serverTempC *= 1 + progress * seededRange(rng, 0.18, 0.32);
  }

  return {
    timestamp: at.toISOString(),
    dataCenterId: DEMO_DATA_CENTER_ID,
    itLoadMw,
    itPowerMw,
    coolingPowerMw,
    waterLiters,
    ambientTempC,
    serverTempC,
  };
}

export function generateTelemetryPoint(
  scenarioId: ScenarioId,
  opts?: { seed?: number; at?: Date; progress?: number },
): TelemetryPoint {
  const seed = opts?.seed ?? 1;
  const at = opts?.at ?? new Date();
  const progress = opts?.progress ?? 1;
  const rng = createRng(seed);

  return buildPoint(scenarioId, rng, progress, at);
}

export function generateTelemetrySeries(
  scenarioId: ScenarioId,
  points: number,
  opts?: { seed?: number; intervalMinutes?: number; endAt?: Date },
): TelemetryPoint[] {
  const seedBase = opts?.seed ?? 1;
  const intervalMinutes = opts?.intervalMinutes ?? 15;
  const endAt = opts?.endAt ?? new Date();
  const count = Math.max(1, points);

  const series: TelemetryPoint[] = [];
  for (let i = 0; i < count; i += 1) {
    const progress = count === 1 ? 1 : i / (count - 1);
    const minutesBeforeEnd = (count - 1 - i) * intervalMinutes;
    const at = new Date(endAt.getTime() - minutesBeforeEnd * 60_000);
    series.push(generateTelemetryPoint(scenarioId, { seed: seedBase + i, at, progress }));
  }

  return series;
}
