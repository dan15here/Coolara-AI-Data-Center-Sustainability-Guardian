import { describe, expect, it } from 'vitest';
import { calculatePue, calculateWue, deriveDashboardMetrics } from '../metrics';
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

describe('calculatePue', () => {
  it('includes IT power, cooling power, and a default overhead ratio', () => {
    // total = 10.5 + 3.5 + 10.5*0.05 = 14.525; pue = 14.525 / 10.5
    expect(calculatePue(10.5, 3.5)).toBeCloseTo(14.525 / 10.5);
  });

  it('accepts an explicit overhead override', () => {
    expect(calculatePue(10, 4, 0)).toBeCloseTo(1.4);
  });

  it('throws for zero or negative IT power', () => {
    expect(() => calculatePue(0, 3.5)).toThrow(RangeError);
    expect(() => calculatePue(-1, 3.5)).toThrow(RangeError);
  });
});

describe('calculateWue', () => {
  it('computes liters per Mw of IT power', () => {
    expect(calculateWue(9000, 10)).toBeCloseTo(900);
  });

  it('throws for zero or negative IT power', () => {
    expect(() => calculateWue(9000, 0)).toThrow(RangeError);
  });
});

describe('deriveDashboardMetrics', () => {
  it('composes total power, pue, wue, and peak server temp', () => {
    const metrics = deriveDashboardMetrics(point);
    expect(metrics.totalPowerMw).toBeCloseTo(10.5 + 3.5 + 10.5 * 0.05);
    expect(metrics.pue).toBeCloseTo(calculatePue(point.itPowerMw, point.coolingPowerMw));
    expect(metrics.wue).toBeCloseTo(calculateWue(point.waterLiters, point.itPowerMw));
    expect(metrics.peakServerTempC).toBe(26);
  });
});
