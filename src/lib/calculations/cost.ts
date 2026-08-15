import { deriveDashboardMetrics } from './metrics';
import { ENERGY_COST_IDR_PER_MWH, WATER_COST_IDR_PER_LITER } from '@/lib/simulator/thresholds';
import type { TelemetryPoint } from '@/types';

const HOURS_PER_DAY = 24;

/**
 * "Typical daily operating cost" baseline: the current telemetry point's total power
 * and water draw, held constant for 24h, priced at the same illustrative tariffs
 * runSimulation's cost delta uses. Mirrors the engine's implicit hourly-rate
 * convention (a Mw/Liter delta treated as one hour) so the two figures stay
 * directly comparable.
 */
export function computeTypicalDailyOperatingCostIdr(baseline: TelemetryPoint): number {
  const metrics = deriveDashboardMetrics(baseline);
  const dailyEnergyCostIdr = metrics.totalPowerMw * HOURS_PER_DAY * ENERGY_COST_IDR_PER_MWH;
  const dailyWaterCostIdr = baseline.waterLiters * HOURS_PER_DAY * WATER_COST_IDR_PER_LITER;
  return dailyEnergyCostIdr + dailyWaterCostIdr;
}

/** Pure percentage calculator so client code doesn't need a TelemetryPoint. */
export function computeCostDeltaAsPercentOfDaily(
  estimatedCostDeltaIdr: number,
  typicalDailyOperatingCostIdr: number,
): number {
  if (typicalDailyOperatingCostIdr <= 0) return 0;
  return (estimatedCostDeltaIdr / typicalDailyOperatingCostIdr) * 100;
}
