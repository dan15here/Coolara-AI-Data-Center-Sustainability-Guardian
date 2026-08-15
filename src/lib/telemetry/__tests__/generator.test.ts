import { describe, expect, it } from 'vitest';
import { generateTelemetryPoint, generateTelemetrySeries } from '../generator';

const FIXED_DATE = new Date('2026-01-01T00:00:00.000Z');

describe('generateTelemetryPoint', () => {
  it('is deterministic for the same seed, scenario, and timestamp', () => {
    const a = generateTelemetryPoint('nominal', { seed: 42, at: FIXED_DATE });
    const b = generateTelemetryPoint('nominal', { seed: 42, at: FIXED_DATE });
    expect(a).toEqual(b);
  });

  it('produces different values for different seeds', () => {
    const a = generateTelemetryPoint('nominal', { seed: 1, at: FIXED_DATE });
    const b = generateTelemetryPoint('nominal', { seed: 2, at: FIXED_DATE });
    expect(a.itLoadMw).not.toBeCloseTo(b.itLoadMw, 5);
  });

  it('keeps nominal scenario values within documented ranges', () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const point = generateTelemetryPoint('nominal', { seed, at: FIXED_DATE });
      expect(point.itLoadMw).toBeGreaterThanOrEqual(8);
      expect(point.itLoadMw).toBeLessThanOrEqual(12);
      expect(point.ambientTempC).toBeGreaterThanOrEqual(22);
      expect(point.ambientTempC).toBeLessThanOrEqual(28);
      expect(point.itPowerMw).toBeGreaterThan(point.itLoadMw);
    }
  });

  it('drives server temperature clearly higher for coolingInefficiency than nominal at full drift', () => {
    const nominal = generateTelemetryPoint('nominal', { seed: 7, at: FIXED_DATE, progress: 1 });
    const degraded = generateTelemetryPoint('coolingInefficiency', { seed: 7, at: FIXED_DATE, progress: 1 });
    expect(degraded.serverTempC).toBeGreaterThan(nominal.serverTempC);
  });

  it('drives water usage clearly higher for waterStress than nominal at full drift', () => {
    const nominal = generateTelemetryPoint('nominal', { seed: 7, at: FIXED_DATE, progress: 1 });
    const stressed = generateTelemetryPoint('waterStress', { seed: 7, at: FIXED_DATE, progress: 1 });
    expect(stressed.waterLiters).toBeGreaterThan(nominal.waterLiters * 1.5);
  });
});

describe('generateTelemetrySeries', () => {
  it('produces the requested number of points ending at the given time', () => {
    const series = generateTelemetrySeries('nominal', 10, { seed: 3, endAt: FIXED_DATE, intervalMinutes: 15 });
    expect(series).toHaveLength(10);
    expect(series[series.length - 1].timestamp).toBe(FIXED_DATE.toISOString());
  });

  it('orders points chronologically', () => {
    const series = generateTelemetrySeries('nominal', 5, { seed: 3, endAt: FIXED_DATE, intervalMinutes: 15 });
    const times = series.map((p) => new Date(p.timestamp).getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });
});
