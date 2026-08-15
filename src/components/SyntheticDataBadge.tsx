import { FlaskConical } from 'lucide-react';

export function SyntheticDataBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
      Synthetic demo data
    </span>
  );
}
