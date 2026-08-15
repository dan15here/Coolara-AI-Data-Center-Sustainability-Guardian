import { fetchReports } from '@/lib/supabase/repository'
import { DEMO_DATA_CENTER_ID } from '@/lib/telemetry/generator'
import { getDashboardSnapshot } from '@/lib/dashboard'
import { highestSeverityFinding } from '@/lib/anomaly/rules'
import { PageIntro } from '@/components/ui'
import { ReportsView } from './ReportsView'

// Reports are an operational history, so they must reflect the latest
// server-side Supabase records rather than the data available at build time.
export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const [{ alerts, simulations }, snapshot] = await Promise.all([
    fetchReports(DEMO_DATA_CENTER_ID, 50),
    getDashboardSnapshot(DEMO_DATA_CENTER_ID),
  ])

  return (
    <>
      <PageIntro eyebrow="OPERATIONAL HISTORY" title="Reports">
        Trace anomaly and simulation events for DC-01. All data is synthetic.
      </PageIntro>
      <ReportsView
        alerts={alerts}
        simulations={simulations}
        point={snapshot.point}
        metrics={snapshot.metrics}
        activeFinding={highestSeverityFinding(snapshot.findings)}
      />
    </>
  )
}
