import { AlertOctagon } from 'lucide-react';

export function ErrorState({
  label = 'Something went wrong.',
  onRetry,
}: {
  label?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      <AlertOctagon className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-900"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
