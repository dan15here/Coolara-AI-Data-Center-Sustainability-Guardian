import { AlertOctagon, AlertTriangle, Info } from 'lucide-react';
import type { FindingSeverity } from '@/types';

const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { label: string; icon: typeof Info; className: string }
> = {
  low: {
    label: 'Low',
    icon: Info,
    className: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300',
  },
  medium: {
    label: 'Medium',
    icon: AlertTriangle,
    className:
      'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  high: {
    label: 'High',
    icon: AlertTriangle,
    className:
      'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300',
  },
  critical: {
    label: 'Critical',
    icon: AlertOctagon,
    className: 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
  },
};

export function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
