import { getCurrentTelemetryPoint } from '@/lib/telemetry/current'
import { DEMO_DATA_CENTER_ID } from '@/lib/telemetry/generator'
import { FACILITY_MAX_IT_LOAD_MW, REFERENCE_SETPOINT_C } from '@/lib/simulator/thresholds'
import { deriveDashboardMetrics } from '@/lib/calculations/metrics'
import { computeTypicalDailyOperatingCostIdr } from '@/lib/calculations/cost'
import { isGeminiConfigured } from '@/lib/ai/gemini'
import { isValidFinding } from '@/lib/validation/finding'
import { PageIntro } from '@/components/ui'
import { SimulatorView } from './SimulatorView'
import type { Finding, SimulationInput } from '@/types'

export default async function SimulatorPage({
  searchParams,
}: {
  searchParams: Promise<{ finding?: string }>
}) {
  const { finding: findingParam } = await searchParams
  const point = await getCurrentTelemetryPoint(DEMO_DATA_CENTER_ID)

  const initialInput: SimulationInput = {
    coolingSetpointC: REFERENCE_SETPOINT_C,
    workloadPercent: Math.round((point.itLoadMw / FACILITY_MAX_IT_LOAD_MW) * 100),
    ambientTempC: Math.round(point.ambientTempC),
  }

  const currentMetrics = deriveDashboardMetrics(point)
  const typicalDailyOperatingCostIdr = computeTypicalDailyOperatingCostIdr(point)

  let originatingFinding: Finding | null = null
  if (findingParam) {
    try {
      const parsed: unknown = JSON.parse(findingParam)
      if (isValidFinding(parsed)) originatingFinding = parsed
    } catch {
      // malformed/tampered query param — degrade silently to a standalone simulation
    }
  }

  return (
    <>
      <PageIntro eyebrow="DECISION SUPPORT" title="What-if simulator">
        Test a scenario before recommending an operational change. Estimates are deterministic and synthetic.
      </PageIntro>
      <SimulatorView
        initialInput={initialInput}
        currentMetrics={currentMetrics}
        typicalDailyOperatingCostIdr={typicalDailyOperatingCostIdr}
        originatingFinding={originatingFinding}
        geminiConfigured={isGeminiConfigured()}
      />
    </>
  )
}
