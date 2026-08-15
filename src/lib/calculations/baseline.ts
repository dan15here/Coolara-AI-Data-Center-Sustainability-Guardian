import type { TelemetryPoint } from '@/types';

export interface ExpectedBaseline {
  coolingPowerMw: number;
  waterLiters: number;
  serverTempC: number;
}

/**
 * Illustrative demo heuristic — not a validated engineering model.
 * Expresses "what a healthy facility should show" purely as a function of
 * ambient temperature and IT load, so it can be reused for both anomaly
 * detection (actual vs. expected under current conditions) and synthetic
 * telemetry generation.
 */
const REFERENCE_AMBIENT_C = 25;
const BASE_COOLING_RATIO = 0.35;
const COOLING_RATIO_PER_AMBIENT_C = 0.02;
const WATER_LITERS_PER_MW = 900;
const WATER_AMBIENT_SENSITIVITY = 0.03;
const SERVER_TEMP_BASELINE_C = 20;
const SERVER_TEMP_PER_AMBIENT_C = 0.4;
const SERVER_TEMP_PER_LOAD_MW = 0.3;

export function computeExpectedBaseline(ambientTempC: number, itLoadMw: number): ExpectedBaseline {
  const ambientExcess = Math.max(0, ambientTempC - REFERENCE_AMBIENT_C);

  const coolingRatio = BASE_COOLING_RATIO + ambientExcess * COOLING_RATIO_PER_AMBIENT_C;
  const coolingPowerMw = itLoadMw * coolingRatio;

  const waterLiters = itLoadMw * WATER_LITERS_PER_MW * (1 + ambientExcess * WATER_AMBIENT_SENSITIVITY);

  const serverTempC =
    SERVER_TEMP_BASELINE_C + ambientExcess * SERVER_TEMP_PER_AMBIENT_C + itLoadMw * SERVER_TEMP_PER_LOAD_MW;

  return { coolingPowerMw, waterLiters, serverTempC };
}

export function computeExpectedBaselineForPoint(point: TelemetryPoint): ExpectedBaseline {
  return computeExpectedBaseline(point.ambientTempC, point.itLoadMw);
}
