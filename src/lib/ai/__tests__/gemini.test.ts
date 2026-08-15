import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { explainFinding, isGeminiConfigured } from '../gemini';
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
