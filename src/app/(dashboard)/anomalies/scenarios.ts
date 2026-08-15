import { scenarioPresets } from '@/lib/telemetry/generator'

// "Normal operation" is intentionally excluded from this page: it never produces findings,
// so landing there would leave the severity filter below with nothing to filter.
export const ANOMALY_SCENARIOS = ['coolingInefficiency', 'waterStress', 'workloadSpike'] as const
export type AnomalyScenarioFilter = 'all' | (typeof ANOMALY_SCENARIOS)[number]

export const ANOMALY_SCENARIO_TABS: { id: AnomalyScenarioFilter; label: string; description: string }[] = [
  { id: 'all', label: 'All', description: 'Findings across every anomaly scenario' },
  ...(ANOMALY_SCENARIOS.map((id) => scenarioPresets[id]) as { id: AnomalyScenarioFilter; label: string; description: string }[]),
]
