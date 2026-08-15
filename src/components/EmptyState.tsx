import { Inbox } from 'lucide-react';

export function EmptyState({ label = 'Nothing to show yet.' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      <Inbox className="h-5 w-5" aria-hidden="true" />
      {label}
    </div>
  );
}
