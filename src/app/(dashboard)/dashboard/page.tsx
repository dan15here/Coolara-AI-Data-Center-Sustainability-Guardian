import { DEMO_DATA_CENTER_ID } from '@/lib/telemetry/generator'
import { getDashboardSnapshot } from '@/lib/dashboard'
import { PageIntro } from '@/components/ui'
import { DashboardView } from './DashboardView'

export default async function DashboardPage() {
  const { point, metrics, findings, activity } = await getDashboardSnapshot(DEMO_DATA_CENTER_ID, 'nominal')

  return (
    <>
      <PageIntro eyebrow="FACILITY SNAPSHOT" title="Executive operations overview">
        DC-01 Nongsa, Batam · <span className="synthetic-inline">● Synthetic demo telemetry</span>
      </PageIntro>
      <DashboardView
        initialData={{ scenario: 'nominal', point, latestMetrics: metrics, findings }}
        activity={activity}
      />
    </>
  )
}
