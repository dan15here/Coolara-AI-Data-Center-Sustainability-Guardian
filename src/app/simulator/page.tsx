import { getCurrentTelemetryPoint } from '@/lib/telemetry/current'
import { DEMO_DATA_CENTER_ID } from '@/lib/telemetry/generator'
import { FACILITY_MAX_IT_LOAD_MW, REFERENCE_SETPOINT_C } from '@/lib/simulator/thresholds'
import { PageIntro } from '@/components/ui'
import { SimulatorView } from './SimulatorView'
import type { SimulationInput } from '@/types'

export default async function SimulatorPage() {
  const point = await getCurrentTelemetryPoint(DEMO_DATA_CENTER_ID)

  const initialInput: SimulationInput = {
    coolingSetpointC: REFERENCE_SETPOINT_C,
    workloadPercent: Math.round((point.itLoadMw / FACILITY_MAX_IT_LOAD_MW) * 100),
    ambientTempC: Math.round(point.ambientTempC),
  }

  return (
    <>
      <PageIntro eyebrow="DECISION SUPPORT" title="What-if simulator">
        Test a scenario before recommending an operational change. Estimates are deterministic and synthetic.
      </PageIntro>
      <SimulatorView initialInput={initialInput} />
    </>
  )
}
