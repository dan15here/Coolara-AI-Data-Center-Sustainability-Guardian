'use client'

import { scenarioPresets, type ScenarioId } from '@/lib/telemetry/generator'

export function ScenarioControl({
  scenario,
  onChange,
}: Readonly<{ scenario: ScenarioId; onChange: (scenario: ScenarioId) => void }>) {
  return (
    <div className="flex flex-wrap gap-[6px] mb-[18px]">
      {Object.values(scenarioPresets).map((preset) => (
        <button
          key={preset.id}
          type="button"
          title={preset.description}
          aria-pressed={scenario === preset.id}
          className={`border rounded-full px-[12px] py-[6px] text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal ${
            scenario === preset.id 
              ? 'text-slate-50 bg-slate-900 border-slate-700 dark:text-content-base dark:bg-[#2a3539] dark:border-[#3a4a50]' 
              : 'border-surface-line bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-[#20292d] dark:text-content-muted dark:hover:bg-[#253035] dark:hover:text-slate-50'
          }`}
          onClick={() => onChange(preset.id)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
