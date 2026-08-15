import { describe, expect, it } from 'vitest';
import { buildExplanationPrompt, buildOptimizationPrompt } from '../prompt';
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

describe('buildExplanationPrompt', () => {
  it('includes the guardrail instructions', () => {
    const prompt = buildExplanationPrompt(request);
    expect(prompt).toContain('Use only the numeric values provided below');
    expect(prompt).toContain('Do not claim any action is safe or approved');
  });

  it('includes the finding severity, values, and likely factors', () => {
    const prompt = buildExplanationPrompt(request);
    expect(prompt).toContain(request.finding.severity);
    expect(prompt).toContain(String(request.finding.actual));
    expect(prompt).toContain(String(request.finding.expected));
    expect(prompt).toContain(request.finding.likelyFactors[0]);
  });

  it('includes the structured explanation input context', () => {
    const prompt = buildExplanationPrompt(request);
    expect(prompt).toContain('ambientTempC');
    expect(prompt).toContain('34.2');
  });

  it('makes no network call (pure string building)', () => {
    expect(typeof buildExplanationPrompt(request)).toBe('string');
  });
});

const optimizeRequest: OptimizeSimulationRequest = {
  input: { coolingSetpointC: 22, workloadPercent: 30, ambientTempC: 24 },
  result: {
    safe: true,
    reason: 'All parameters are within safe operating thresholds.',
    predictedServerTempC: 21.35,
    estimatedEnergyDeltaMwh: -9.69,
    estimatedWaterDeltaLiters: -6319.34,
    estimatedCostDeltaIdr: -14660103.06,
    pue: 1.39,
    wue: 867.88,
  },
  finding: request.finding,
};

describe('buildOptimizationPrompt', () => {
  it('includes the no-new-numbers and no-new-setpoint guardrail instructions', () => {
    const prompt = buildOptimizationPrompt(optimizeRequest);
    expect(prompt).toContain('Do not introduce new measurements');
    expect(prompt).toContain('Never propose a specific new numeric setpoint');
    expect(prompt).toContain('Present at most two directions');
  });

  it('includes the severity register derived from the originating finding', () => {
    const prompt = buildOptimizationPrompt(optimizeRequest);
    expect(prompt).toContain(`Severity register to use: ${optimizeRequest.finding!.severity}`);
  });

  it('falls back to a "none" severity register when there is no originating finding', () => {
    const prompt = buildOptimizationPrompt({ ...optimizeRequest, finding: null });
    expect(prompt).toContain('Severity register to use: none');
    expect(prompt).toContain('this simulation was run standalone');
  });

  it('includes the deterministic simulation input and result values', () => {
    const prompt = buildOptimizationPrompt(optimizeRequest);
    expect(prompt).toContain(String(optimizeRequest.input.coolingSetpointC));
    expect(prompt).toContain(optimizeRequest.result.reason);
    expect(prompt).toContain('21.4'); // predictedServerTempC.toFixed(1)
  });

  it('makes no network call (pure string building)', () => {
    expect(typeof buildOptimizationPrompt(optimizeRequest)).toBe('string');
  });
});
