import { generateTelemetryPoint } from '@/lib/telemetry/generator'
import { detectFindings } from '@/lib/anomaly/rules'
import { isGeminiConfigured } from '@/lib/ai/gemini'
import { isValidFinding } from '@/lib/validation/finding'
import { PageIntro } from '@/components/ui'
import { AnomaliesView } from './AnomaliesView'
import { ANOMALY_SCENARIOS, type AnomalyScenarioFilter } from './scenarios'
import type { Finding } from '@/types'

export default async function AnomaliesPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string; finding?: string }>
}) {
  const { scenario: scenarioParam, finding: findingParam } = await searchParams
  const scenario: AnomalyScenarioFilter = (ANOMALY_SCENARIOS as readonly string[]).includes(scenarioParam ?? '')
    ? (scenarioParam as AnomalyScenarioFilter)
    : 'all'

  const findings =
    scenario === 'all'
      ? ANOMALY_SCENARIOS.flatMap((id) => detectFindings(generateTelemetryPoint(id)))
      : detectFindings(generateTelemetryPoint(scenario))

  // Deep-linked from Dashboard's "View anomaly details" — carries the exact finding
  // that was on screen there, since a fresh scenario draw would otherwise regenerate
  // different actual/expected numbers than what the user just saw.
  if (findingParam) {
    try {
      const parsed: unknown = JSON.parse(findingParam)
      if (isValidFinding(parsed) && !findings.some((f) => f.id === parsed.id)) {
        findings.unshift(parsed as Finding)
      }
    } catch {
      // malformed/tampered query param — degrade silently to the scenario's own findings
    }
  }

  return (
    <>
      <PageIntro eyebrow="DETECTION & EXPLANATION" title="Anomaly detection">
        Findings requiring operational review. All measurements are synthetic.
      </PageIntro>
      <AnomaliesView initialData={{ scenario, findings }} geminiConfigured={isGeminiConfigured()} />
    </>
  )
}
