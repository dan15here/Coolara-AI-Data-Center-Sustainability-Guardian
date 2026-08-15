import { detectFindings } from './rules'
import { generateTelemetryPoint, type ScenarioId } from '@/lib/telemetry/generator'

/** The curated synthetic scenarios exposed by the Anomalies screen. */
export const DEMO_ANOMALY_SCENARIOS = ['coolingInefficiency', 'waterStress', 'workloadSpike'] as const satisfies readonly ScenarioId[]

/**
 * Counts the current deterministic demo findings, not persisted alert history.
 * This keeps the sidebar badge aligned with the default “All” Anomalies view.
 */
export function countCurrentDemoFindings(): number {
  return DEMO_ANOMALY_SCENARIOS.reduce(
    (count, scenario) => count + detectFindings(generateTelemetryPoint(scenario)).length,
    0,
  )
}
