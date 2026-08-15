import { generateTelemetrySeries } from '@/lib/telemetry/generator'
import { PageIntro } from '@/components/ui'
import { TelemetryView } from './TelemetryView'

export default function TelemetryPage() {
  const points = generateTelemetrySeries('nominal', 96)

  return (
    <>
      <PageIntro eyebrow="LIVE TELEMETRY" title="Telemetry overview">
        Track energy demand and thermal conditions across synthetic DC-01 data.
      </PageIntro>
      <TelemetryView initialData={{ scenario: 'nominal', range: '24h', points }} />
    </>
  )
}
