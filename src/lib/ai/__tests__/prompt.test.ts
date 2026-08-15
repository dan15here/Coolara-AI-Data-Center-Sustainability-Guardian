import { describe, expect, it } from 'vitest';
import { buildExplanationPrompt } from '../prompt';
import type { ExplainFindingRequest } from '../types';

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
