import { AlertOctagon, CheckCircle2 } from 'lucide-react';

export function SafetyStatusBanner({ safe, reason }: { safe: boolean; reason: string }) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border p-4 ${
        safe
          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950'
          : 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950'
      }`}
    >
      <div
        className={`flex items-center gap-2 text-sm font-semibold ${
          safe ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'
        }`}
      >
        {safe ? (
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        ) : (
          <AlertOctagon className="h-5 w-5" aria-hidden="true" />
        )}
        {safe ? 'Safe: scenario passes the thermal/reliability gate' : 'Rejected: scenario fails the safety gate'}
      </div>
      <p className={`text-sm ${safe ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
        {reason}
      </p>
    </div>
  );
}
