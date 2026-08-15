'use client'

import { scenarioPresets, type ScenarioId } from '@/lib/telemetry/generator'

export function ScenarioControl({
  scenario,
  onChange,
}: Readonly<{ scenario: ScenarioId; onChange: (scenario: ScenarioId) => void }>) {
  return (
    <div className="scenario-control">
      {Object.values(scenarioPresets).map((preset) => (
        <button
          key={preset.id}
          type="button"
          title={preset.description}
          aria-pressed={scenario === preset.id}
          className={scenario === preset.id ? 'selected' : ''}
          onClick={() => onChange(preset.id)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
