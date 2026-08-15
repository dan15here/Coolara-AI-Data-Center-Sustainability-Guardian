'use client';

import { scenarioPresets, type ScenarioId } from '@/lib/telemetry/generator';

const SCENARIO_ORDER: ScenarioId[] = ['nominal', 'coolingInefficiency', 'waterStress', 'workloadSpike'];

export function ScenarioSelector({
  selected,
  onSelect,
  disabled,
}: {
  selected: ScenarioId;
  onSelect: (scenario: ScenarioId) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SCENARIO_ORDER.map((id) => {
        const preset = scenarioPresets[id];
        const active = id === selected;
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(id)}
            title={preset.description}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
              active
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
            }`}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
