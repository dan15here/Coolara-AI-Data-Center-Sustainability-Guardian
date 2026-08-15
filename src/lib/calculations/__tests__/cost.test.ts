import { describe, expect, it } from 'vitest';
import { computeCostDeltaAsPercentOfDaily, computeTypicalDailyOperatingCostIdr } from '../cost';
import { deriveDashboardMetrics } from '../metrics';
import { ENERGY_COST_IDR_PER_MWH, WATER_COST_IDR_PER_LITER } from '@/lib/simulator/thresholds';
import type { TelemetryPoint } from '@/types';

const point: TelemetryPoint = {
  timestamp: '2026-01-01T00:00:00.000Z',
  dataCenterId: 'dc-01',
  itLoadMw: 10,
  itPowerMw: 10.5,
  coolingPowerMw: 3.5,
  waterLiters: 9000,
  ambientTempC: 25,
  serverTempC: 26,
};

describe('computeTypicalDailyOperatingCostIdr', () => {
  it('prices 24h of the current total power and water draw at the illustrative tariffs', () => {
    const metrics = deriveDashboardMetrics(point);
    const expected =
      metrics.totalPowerMw * 24 * ENERGY_COST_IDR_PER_MWH + point.waterLiters * 24 * WATER_COST_IDR_PER_LITER;
    expect(computeTypicalDailyOperatingCostIdr(point)).toBeCloseTo(expected);
  });
});

describe('computeCostDeltaAsPercentOfDaily', () => {
  it('expresses a cost delta as a percentage of the daily baseline', () => {
    expect(computeCostDeltaAsPercentOfDaily(150_000, 1_500_000)).toBeCloseTo(10);
  });

  it('handles a negative delta (cost savings)', () => {
    expect(computeCostDeltaAsPercentOfDaily(-75_000, 1_500_000)).toBeCloseTo(-5);
  });

  it('returns 0 when the daily baseline is non-positive (guards divide-by-zero)', () => {
    expect(computeCostDeltaAsPercentOfDaily(1000, 0)).toBe(0);
  });
});
