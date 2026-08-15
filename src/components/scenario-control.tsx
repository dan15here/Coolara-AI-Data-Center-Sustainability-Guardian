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
              ? 'text-content-base bg-[#2a3539] border-[#3a4a50]' 
              : 'border-surface-line bg-[#20292d] text-content-muted hover:bg-[#253035] hover:text-white'
          }`}
          onClick={() => onChange(preset.id)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
