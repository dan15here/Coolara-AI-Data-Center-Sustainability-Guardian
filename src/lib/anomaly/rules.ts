import { computeExpectedBaselineForPoint } from '@/lib/calculations/baseline';
import type { Finding, FindingMetric, FindingSeverity, TelemetryPoint } from '@/types';

/** Deviation-percent bands (adverse/above-expected direction only), illustrative for the demo. */
const CRITICAL_THRESHOLD = 80;
const HIGH_THRESHOLD = 50;
const MEDIUM_THRESHOLD = 30;
const LOW_THRESHOLD = 15;

const LIKELY_FACTORS: Record<FindingMetric, string[]> = {
  coolingPower: [
    'Elevated ambient temperature',
    'Reduced cooling system efficiency',
    'Increased IT workload',
  ],
  waterUsage: [
    'Cooling tower drift or leak',
    'Elevated ambient temperature increasing evaporative cooling demand',
    'Water treatment or makeup system issue',
  ],
  serverTemperature: [
    'Cooling system unable to keep pace with heat output',
    'Elevated ambient temperature',
    'Sudden increase in IT workload',
  ],
};

function severityFor(deviationPercent: number): FindingSeverity | null {
  if (deviationPercent >= CRITICAL_THRESHOLD) return 'critical';
  if (deviationPercent >= HIGH_THRESHOLD) return 'high';
  if (deviationPercent >= MEDIUM_THRESHOLD) return 'medium';
  if (deviationPercent >= LOW_THRESHOLD) return 'low';
  return null;
}

function buildFinding(
  point: TelemetryPoint,
  metric: FindingMetric,
  actual: number,
  expected: number,
): Finding | null {
  const deviationPercent = ((actual - expected) / expected) * 100;
  const severity = severityFor(deviationPercent);
  if (!severity) return null;

  return {
    id: crypto.randomUUID(),
    severity,
    metric,
    actual,
    expected,
    deviationPercent,
    detectedAt: point.timestamp,
    likelyFactors: LIKELY_FACTORS[metric],
    explanationInput: {
      dataCenterId: point.dataCenterId,
      timestamp: point.timestamp,
      metric,
      actual: Number(actual.toFixed(2)),
      expected: Number(expected.toFixed(2)),
      deviationPercent: Number(deviationPercent.toFixed(1)),
      ambientTempC: Number(point.ambientTempC.toFixed(1)),
      itLoadMw: Number(point.itLoadMw.toFixed(2)),
    },
  };
}

export function detectFindings(point: TelemetryPoint): Finding[] {
  const expected = computeExpectedBaselineForPoint(point);
  const findings: Finding[] = [];

  const coolingPower = buildFinding(point, 'coolingPower', point.coolingPowerMw, expected.coolingPowerMw);
  if (coolingPower) findings.push(coolingPower);

  const waterUsage = buildFinding(point, 'waterUsage', point.waterLiters, expected.waterLiters);
  if (waterUsage) findings.push(waterUsage);

  const serverTemperature = buildFinding(point, 'serverTemperature', point.serverTempC, expected.serverTempC);
  if (serverTemperature) findings.push(serverTemperature);

  return findings;
}

const SEVERITY_RANK: Record<FindingSeverity, number> = { low: 0, medium: 1, high: 2, critical: 3 };

export function highestSeverityFinding(findings: Finding[]): Finding | null {
  if (findings.length === 0) return null;
  return findings.reduce((top, f) => (SEVERITY_RANK[f.severity] > SEVERITY_RANK[top.severity] ? f : top));
}
