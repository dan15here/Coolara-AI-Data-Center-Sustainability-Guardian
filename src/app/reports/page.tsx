import { fetchReports } from '@/lib/supabase/repository'
import { DEMO_DATA_CENTER_ID } from '@/lib/telemetry/generator'
import { PageIntro } from '@/components/ui'
import { ReportsView } from './ReportsView'

export default async function ReportsPage() {
  const { alerts, simulations } = await fetchReports(DEMO_DATA_CENTER_ID, 50)

  return (
    <>
      <PageIntro eyebrow="OPERATIONAL HISTORY" title="Reports">
        Trace anomaly and simulation events for DC-01. All data is synthetic.
      </PageIntro>
      <ReportsView alerts={alerts} simulations={simulations} />
    </>
  )
}
