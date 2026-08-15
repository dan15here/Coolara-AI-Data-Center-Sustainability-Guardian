import { describe, expect, it } from 'vitest';
import { runSimulation } from '../engine';
import type { TelemetryPoint } from '@/types';

const baseline: TelemetryPoint = {
  timestamp: '2026-01-01T00:00:00.000Z',
  dataCenterId: 'dc-01',
  itLoadMw: 10,
  itPowerMw: 10.5,
  coolingPowerMw: 3.5,
  waterLiters: 9000,
  ambientTempC: 25,
  serverTempC: 23,
};

describe('runSimulation — safe scenario', () => {
  it('passes the safety gate at the reference setpoint with a moderate workload', () => {
    const result = runSimulation(
      { coolingSetpointC: 22, workloadPercent: 65, ambientTempC: 25 },
      baseline,
    );
    expect(result.safe).toBe(true);
    expect(result.predictedServerTempC).toBeLessThan(32);
    expect(result.reason).toContain('within safe operating thresholds');
  });
});

describe('runSimulation — unsafe scenario', () => {
  it('is rejected when the setpoint and workload both exceed configured limits', () => {
    const result = runSimulation(
      { coolingSetpointC: 35, workloadPercent: 150, ambientTempC: 25 },
      baseline,
    );
    expect(result.safe).toBe(false);
    expect(result.reason).toContain('Cooling setpoint');
    expect(result.reason).toContain('Workload');
  });
});

describe('runSimulation — zero workload edge case', () => {
  it('does not throw and returns zeroed efficiency metrics', () => {
    const result = runSimulation(
      { coolingSetpointC: 22, workloadPercent: 0, ambientTempC: 25 },
      baseline,
    );
    expect(result.pue).toBe(0);
    expect(result.wue).toBe(0);
  });
});
