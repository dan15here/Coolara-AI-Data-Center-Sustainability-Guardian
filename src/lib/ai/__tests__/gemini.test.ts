import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { explainFinding, isGeminiConfigured, optimizeSimulation } from '../gemini';
import type { ExplainFindingRequest, OptimizeSimulationRequest } from '../types';

const request: ExplainFindingRequest = {
  finding: {
    id: 'finding-1',
    severity: 'critical',
    metric: 'coolingPower',
    actual: 6.48,
    expected: 3.5,
    deviationPercent: 85.1,
    detectedAt: '2026-01-01T00:00:00.000Z',
    likelyFactors: ['Elevated ambient temperature', 'Reduced cooling system efficiency'],
    explanationInput: {
      dataCenterId: 'dc-01',
      timestamp: '2026-01-01T00:00:00.000Z',
      metric: 'coolingPower',
      actual: 6.48,
      expected: 3.5,
      deviationPercent: 85.1,
      ambientTempC: 34.2,
      itLoadMw: 10,
    },
  },
};

describe('explainFinding without GEMINI_API_KEY', () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it('reports as unconfigured', () => {
    expect(isGeminiConfigured()).toBe(false);
  });

  it('returns a non-empty fallback explanation and never throws', async () => {
    const result = await explainFinding(request);
    expect(result.source).toBe('fallback');
    expect(result.explanation.length).toBeGreaterThan(0);
  });

  it('fallback explanation is Markdown-ish (bold summary + bullets)', async () => {
    const result = await explainFinding(request);
    expect(result.explanation).toContain('**');
    expect(result.explanation).toContain('- ');
  });
});

const optimizeRequest: OptimizeSimulationRequest = {
  input: { coolingSetpointC: 27, workloadPercent: 100, ambientTempC: 40 },
  result: {
    safe: false,
    reason: 'Predicted server temperature 33.5 C exceeds the maximum safe threshold of 32 C.',
    predictedServerTempC: 33.5,
    estimatedEnergyDeltaMwh: 9.46,
    estimatedWaterDeltaLiters: 6977.91,
    estimatedCostDeltaIdr: 14322165.25,
    pue: 1.57,
    wue: 1054.0,
  },
  finding: request.finding,
};

describe('optimizeSimulation without GEMINI_API_KEY', () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it('returns a non-empty fallback narrative and never throws', async () => {
    const result = await optimizeSimulation(optimizeRequest);
    expect(result.source).toBe('fallback');
    expect(result.narrative.length).toBeGreaterThan(0);
  });

  it('fallback narrative is Markdown-ish (bold summary + bullets)', async () => {
    const result = await optimizeSimulation(optimizeRequest);
    expect(result.narrative).toContain('**');
    expect(result.narrative).toContain('- ');
  });

  it('never uses bare imperative language, even in the fallback path (guardrail regression test)', async () => {
    const result = await optimizeSimulation(optimizeRequest);
    expect(result.narrative).not.toMatch(/\b(must|should)\b/i);
  });

  it('never mentions a specific new setpoint/workload value to apply', async () => {
    const result = await optimizeSimulation(optimizeRequest);
    // The fallback must describe directions qualitatively, not restate the rejected input's own numbers as a suggestion.
    expect(result.narrative).not.toContain(`${optimizeRequest.input.coolingSetpointC}`);
  });

  it('handles a standalone simulation with no originating finding', async () => {
    const result = await optimizeSimulation({ ...optimizeRequest, finding: null });
    expect(result.source).toBe('fallback');
    expect(result.narrative.length).toBeGreaterThan(0);
  });
});
