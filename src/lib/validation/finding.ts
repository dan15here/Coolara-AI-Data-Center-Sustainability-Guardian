import type { Finding } from '@/types';

export function isValidFinding(value: unknown): value is Finding {
  if (!value || typeof value !== 'object') return false;
  const f = value as Record<string, unknown>;
  return (
    typeof f.id === 'string' &&
    (f.severity === 'low' || f.severity === 'medium' || f.severity === 'high' || f.severity === 'critical') &&
    (f.metric === 'coolingPower' || f.metric === 'waterUsage' || f.metric === 'serverTemperature') &&
    typeof f.actual === 'number' &&
    typeof f.expected === 'number' &&
    typeof f.deviationPercent === 'number' &&
    typeof f.detectedAt === 'string' &&
    Array.isArray(f.likelyFactors) &&
    typeof f.explanationInput === 'object' &&
    f.explanationInput !== null
  );
}
