'use client';

import type { SimulationInput } from '@/types';

export function SimulatorForm({
  input,
  onChange,
  disabled,
}: {
  input: SimulationInput;
  onChange: (next: SimulationInput) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Cooling setpoint (C)</span>
        <input
          type="number"
          step="0.5"
          value={input.coolingSetpointC}
          disabled={disabled}
          onChange={(e) => onChange({ ...input, coolingSetpointC: Number(e.target.value) })}
          className="rounded-md border border-slate-300 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Workload (%)</span>
        <input
          type="number"
          step="5"
          value={input.workloadPercent}
          disabled={disabled}
          onChange={(e) => onChange({ ...input, workloadPercent: Number(e.target.value) })}
          className="rounded-md border border-slate-300 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Ambient temperature (C)</span>
        <input
          type="number"
          step="0.5"
          value={input.ambientTempC}
          disabled={disabled}
          onChange={(e) => onChange({ ...input, ambientTempC: Number(e.target.value) })}
          className="rounded-md border border-slate-300 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
    </div>
  );
}
