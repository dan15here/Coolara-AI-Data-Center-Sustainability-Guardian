import { describe, expect, it } from 'vitest';
import { computeExpectedBaseline } from '../baseline';

describe('computeExpectedBaseline', () => {
  it('scales cooling power and water use with IT load at the reference ambient', () => {
    const low = computeExpectedBaseline(25, 8);
    const high = computeExpectedBaseline(25, 12);
    expect(high.coolingPowerMw).toBeGreaterThan(low.coolingPowerMw);
    expect(high.waterLiters).toBeGreaterThan(low.waterLiters);
    expect(high.serverTempC).toBeGreaterThan(low.serverTempC);
  });

  it('increases cooling power, water use, and server temp as ambient rises above the reference', () => {
    const cool = computeExpectedBaseline(25, 10);
    const hot = computeExpectedBaseline(35, 10);
    expect(hot.coolingPowerMw).toBeGreaterThan(cool.coolingPowerMw);
    expect(hot.waterLiters).toBeGreaterThan(cool.waterLiters);
    expect(hot.serverTempC).toBeGreaterThan(cool.serverTempC);
  });

  it('does not reward ambient temperatures below the reference with negative cooling power', () => {
    const result = computeExpectedBaseline(10, 10);
    expect(result.coolingPowerMw).toBeGreaterThan(0);
  });
});
