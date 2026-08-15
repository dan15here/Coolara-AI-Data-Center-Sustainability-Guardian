import type { LucideIcon } from 'lucide-react';
import type { FindingSeverity } from '@/types';

const SEVERITY_ACCENT: Record<FindingSeverity, string> = {
  low: 'border-sky-200 dark:border-sky-900',
  medium: 'border-amber-300 dark:border-amber-800',
  high: 'border-orange-300 dark:border-orange-800',
  critical: 'border-red-300 dark:border-red-800',
};

export function MetricTile({
  label,
  value,
  unit,
  icon: Icon,
  severity,
  hint,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  severity?: FindingSeverity;
  hint?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border bg-white p-4 shadow-sm dark:bg-slate-900 ${
        severity ? SEVERITY_ACCENT[severity] : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">{value}</span>
        {unit ? <span className="text-sm text-slate-500 dark:text-slate-400">{unit}</span> : null}
      </div>
      {hint ? <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </div>
  );
}
