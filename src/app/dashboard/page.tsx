import { DEMO_DATA_CENTER_ID, generateTelemetrySeries } from '@/lib/telemetry/generator'
import { deriveDashboardMetrics } from '@/lib/calculations/metrics'
import { detectFindings } from '@/lib/anomaly/rules'
import { fetchRecentActivity } from '@/lib/supabase/repository'
import { PageIntro } from '@/components/ui'
import { DashboardView } from './DashboardView'

export default async function DashboardPage() {
  const points = generateTelemetrySeries('nominal', 24)
  const latest = points[points.length - 1]
  const latestMetrics = deriveDashboardMetrics(latest)
  const findings = detectFindings(latest)
  const activity = await fetchRecentActivity(DEMO_DATA_CENTER_ID, 3)

  return (
    <>
      <PageIntro eyebrow="FACILITY SNAPSHOT" title="Executive operations overview">
        DC-01 Jakarta · <span className="synthetic-inline">● Synthetic demo telemetry</span>
      </PageIntro>
      <DashboardView
        initialData={{ scenario: 'nominal', points, latestMetrics, findings }}
        activity={activity}
      />
    </>
  )
}
