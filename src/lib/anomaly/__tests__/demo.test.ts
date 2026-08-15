import { describe, expect, it } from 'vitest'
import { countCurrentDemoFindings, DEMO_ANOMALY_SCENARIOS } from '../demo'
import { detectFindings } from '../rules'
import { generateTelemetryPoint } from '@/lib/telemetry/generator'

describe('countCurrentDemoFindings', () => {
  it('matches the total shown by the default All anomalies view', () => {
    const expected = DEMO_ANOMALY_SCENARIOS.reduce(
      (count, scenario) => count + detectFindings(generateTelemetryPoint(scenario)).length,
      0,
    )

    expect(countCurrentDemoFindings()).toBe(expected)
  })
})
