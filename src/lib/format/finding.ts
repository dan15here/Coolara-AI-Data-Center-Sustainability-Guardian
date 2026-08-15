import type { Finding, FindingMetric, FindingSeverity } from '@/types';

export const METRIC_LABELS: Record<FindingMetric, string> = {
  coolingPower: 'Cooling power',
  waterUsage: 'Water usage',
  serverTemperature: 'Server temperature',
};

export function formatFindingValue(metric: FindingMetric, value: number): string {
  switch (metric) {
    case 'waterUsage':
      return `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} L`;
    case 'coolingPower':
      return `${value.toFixed(2)} MW`;
    case 'serverTemperature':
      return `${value.toFixed(1)}°C`;
  }
}

export function summarizeFinding(finding: Finding): string {
  const direction = finding.actual > finding.expected ? 'above' : 'below';
  return `${METRIC_LABELS[finding.metric]} is ${finding.deviationPercent.toFixed(1)}% ${direction} expected (${formatFindingValue(finding.metric, finding.actual)} vs ${formatFindingValue(finding.metric, finding.expected)}).`;
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
