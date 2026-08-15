import type { Finding, FindingMetric } from '@/types';
import { SeverityBadge } from '@/components/SeverityBadge';
import { EmptyState } from '@/components/EmptyState';
import { FindingExplanationPanel } from './FindingExplanationPanel';

const METRIC_LABELS: Record<FindingMetric, string> = {
  coolingPower: 'Cooling power',
  waterUsage: 'Water usage',
  serverTemperature: 'Server temperature',
};

function summarize(finding: Finding): string {
  const direction = finding.actual > finding.expected ? 'above' : 'below';
  return `${METRIC_LABELS[finding.metric]} is ${finding.deviationPercent.toFixed(1)}% ${direction} expected (${finding.actual.toFixed(2)} vs ${finding.expected.toFixed(2)}).`;
}

export function FindingsList({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return <EmptyState label="No anomalies detected for the current scenario." />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {findings.map((finding) => (
        <li
          key={finding.id}
          className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SeverityBadge severity={finding.severity} />
            <span className="text-xs text-slate-400">{new Date(finding.detectedAt).toLocaleTimeString()}</span>
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200">{summarize(finding)}</p>
          <div>
            <FindingExplanationPanel finding={finding} />
          </div>
        </li>
      ))}
    </ul>
  );
}
