'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { DashboardMetrics as DashboardMetricsType, Finding, TelemetryPoint } from '@/types';
import type { ScenarioId } from '@/lib/telemetry/generator';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { ScenarioSelector } from './ScenarioSelector';
import { DashboardMetrics } from './DashboardMetrics';
import { TelemetryChart } from './TelemetryChart';
import { FindingsList } from './FindingsList';

interface TelemetryResponse {
  points: TelemetryPoint[];
  latestMetrics: DashboardMetricsType;
  findings: Finding[];
}

export function DashboardClient({ initialData }: { initialData: TelemetryResponse & { scenario: ScenarioId } }) {
  const [scenario, setScenario] = useState<ScenarioId>(initialData.scenario);
  const [data, setData] = useState<TelemetryResponse>(initialData);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  async function loadScenario(next: ScenarioId) {
    setStatus('loading');
    try {
      const response = await fetch(`/api/telemetry?scenario=${next}&points=24`);
      if (!response.ok) throw new Error('Request failed');
      const result: TelemetryResponse = await response.json();
      setScenario(next);
      setData(result);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  const latest = data.points[data.points.length - 1];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ScenarioSelector selected={scenario} onSelect={loadScenario} disabled={status === 'loading'} />
        <button
          type="button"
          onClick={() => loadScenario(scenario)}
          disabled={status === 'loading'}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-emerald-400 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
        >
          <RefreshCw className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {status === 'error' ? (
        <ErrorState label="Could not load telemetry." onRetry={() => loadScenario(scenario)} />
      ) : status === 'loading' && !latest ? (
        <LoadingState label="Loading telemetry..." />
      ) : (
        <>
          <DashboardMetrics point={latest} metrics={data.latestMetrics} />
          <TelemetryChart points={data.points} />
          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-50">Detected findings</h2>
            <FindingsList findings={data.findings} />
          </div>
        </>
      )}
    </div>
  );
}
