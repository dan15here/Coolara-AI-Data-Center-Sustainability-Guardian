import { describe, expect, it } from 'vitest';
import { detectFindings, highestSeverityFinding } from '../rules';
import type { TelemetryPoint } from '@/types';

// ambientTempC=25 is the reference ambient (no excess), itLoadMw=10, so expected
// coolingPowerMw=3.5, waterLiters=9000, serverTempC=23 (see baseline.ts formulas).
function buildPoint(overrides: Partial<TelemetryPoint> = {}): TelemetryPoint {
  return {
    timestamp: '2026-01-01T00:00:00.000Z',
    dataCenterId: 'dc-01',
    itLoadMw: 10,
    itPowerMw: 10.5,
    coolingPowerMw: 3.5,
    waterLiters: 9000,
    ambientTempC: 25,
    serverTempC: 23,
    ...overrides,
  };
}

describe('detectFindings — coolingPower', () => {
  it('does not fire below the low threshold (10% deviation)', () => {
    const point = buildPoint({ coolingPowerMw: 3.5 * 1.1 });
    const findings = detectFindings(point);
    expect(findings.find((f) => f.metric === 'coolingPower')).toBeUndefined();
  });

  it('fires as low just above the low threshold (20% deviation)', () => {
    const point = buildPoint({ coolingPowerMw: 3.5 * 1.2 });
    const finding = detectFindings(point).find((f) => f.metric === 'coolingPower');
    expect(finding?.severity).toBe('low');
  });

  it('fires as medium at 35% deviation', () => {
    const point = buildPoint({ coolingPowerMw: 3.5 * 1.35 });
    const finding = detectFindings(point).find((f) => f.metric === 'coolingPower');
    expect(finding?.severity).toBe('medium');
  });

  it('fires as high at 55% deviation', () => {
    const point = buildPoint({ coolingPowerMw: 3.5 * 1.55 });
    const finding = detectFindings(point).find((f) => f.metric === 'coolingPower');
    expect(finding?.severity).toBe('high');
  });

  it('fires as critical at 85% deviation and includes deterministic factors + explanation input', () => {
    const point = buildPoint({ coolingPowerMw: 3.5 * 1.85 });
    const finding = detectFindings(point).find((f) => f.metric === 'coolingPower');
    expect(finding?.severity).toBe('critical');
    expect(finding?.likelyFactors.length).toBeGreaterThan(0);
    expect(finding?.explanationInput.metric).toBe('coolingPower');
  });
});

describe('detectFindings — waterUsage and serverTemperature', () => {
  it('fires critical waterUsage finding on a large water spike', () => {
    const point = buildPoint({ waterLiters: 9000 * 2.5 });
    const finding = detectFindings(point).find((f) => f.metric === 'waterUsage');
    expect(finding?.severity).toBe('critical');
  });

  it('fires a serverTemperature finding when temperature is far above expected', () => {
    const point = buildPoint({ serverTempC: 23 * 1.85 });
    const finding = detectFindings(point).find((f) => f.metric === 'serverTemperature');
    expect(finding?.severity).toBe('critical');
  });
});

describe('highestSeverityFinding', () => {
  it('returns null for an empty list', () => {
    expect(highestSeverityFinding([])).toBeNull();
  });

  it('picks the most severe finding among several', () => {
    const point = buildPoint({ coolingPowerMw: 3.5 * 1.2, waterLiters: 9000 * 2.5 });
    const findings = detectFindings(point);
    const top = highestSeverityFinding(findings);
    expect(top?.metric).toBe('waterUsage');
    expect(top?.severity).toBe('critical');
  });
});
