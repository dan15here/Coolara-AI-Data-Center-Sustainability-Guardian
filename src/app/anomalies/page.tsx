import { generateTelemetryPoint } from '@/lib/telemetry/generator'
import { detectFindings } from '@/lib/anomaly/rules'
import { PageIntro } from '@/components/ui'
import { AnomaliesView } from './AnomaliesView'

export default function AnomaliesPage() {
  const point = generateTelemetryPoint('nominal')
  const findings = detectFindings(point)

  return (
    <>
      <PageIntro eyebrow="DETECTION & EXPLANATION" title="Anomaly detection">
        Findings requiring operational review. All measurements are synthetic.
      </PageIntro>
      <AnomaliesView initialData={{ scenario: 'nominal', findings }} />
    </>
  )
}
