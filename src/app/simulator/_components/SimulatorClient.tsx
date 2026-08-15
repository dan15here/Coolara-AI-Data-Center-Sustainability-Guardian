'use client';

import { useState } from 'react';
import { Play, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { SimulationInput, SimulationResult } from '@/types';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { SimulatorForm } from './SimulatorForm';
import { SimulationResultPanel } from './SimulationResultPanel';

function unsafePreset(input: SimulationInput): SimulationInput {
  return { ...input, coolingSetpointC: 35, workloadPercent: 150 };
}

export function SimulatorClient({ initialInput }: { initialInput: SimulationInput }) {
  const [input, setInput] = useState<SimulationInput>(initialInput);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  async function runSimulation(next: SimulationInput) {
    setInput(next);
    setStatus('loading');
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (!response.ok) throw new Error('Request failed');
      const data: SimulationResult = await response.json();
      setResult(data);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runSimulation(initialInput)}
            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Try a safe scenario
          </button>
          <button
            type="button"
            onClick={() => runSimulation(unsafePreset(initialInput))}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          >
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            Try an unsafe scenario
          </button>
        </div>
        <SimulatorForm input={input} onChange={setInput} disabled={status === 'loading'} />
        <button
          type="button"
          onClick={() => runSimulation(input)}
          disabled={status === 'loading'}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          Run simulation
        </button>
      </div>

      {status === 'error' ? (
        <ErrorState label="Could not run the simulation." onRetry={() => runSimulation(input)} />
      ) : status === 'loading' ? (
        <LoadingState label="Running simulation..." />
      ) : result ? (
        <SimulationResultPanel result={result} />
      ) : null}
    </div>
  );
}
