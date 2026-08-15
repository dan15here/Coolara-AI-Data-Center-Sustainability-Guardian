import type { Finding, FindingMetric, FindingSeverity } from '@/types';

export const METRIC_LABELS: Record<FindingMetric, string> = {
  coolingPower: 'Cooling power',
  waterUsage: 'Water usage',
  serverTemperature: 'Server temperature',
};

export function summarizeFinding(finding: Finding): string {
  const direction = finding.actual > finding.expected ? 'above' : 'below';
  return `${METRIC_LABELS[finding.metric]} is ${finding.deviationPercent.toFixed(1)}% ${direction} expected (${finding.actual.toFixed(2)} vs ${finding.expected.toFixed(2)}).`;
}

export function severityTone(severity: FindingSeverity): 'neutral' | 'warning' | 'high' | 'critical' {
  switch (severity) {
    case 'low':
      return 'neutral';
    case 'medium':
      return 'warning';
    case 'high':
      return 'high';
    case 'critical':
      return 'critical';
  }
}

export function severityLabel(severity: FindingSeverity): string {
  switch (severity) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    case 'critical':
      return 'Critical';
  }
}
