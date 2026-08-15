import { AppShell } from '@/components/app-shell'
import { fetchLatestTelemetryPoint } from '@/lib/supabase/repository'
import { DEMO_DATA_CENTER_ID } from '@/lib/telemetry/generator'
import { countCurrentDemoFindings } from '@/lib/anomaly/demo'

// The badge represents the deterministic findings visible in the default
// Anomalies view, so cache it briefly alongside the latest telemetry timestamp.
export const revalidate = 60

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const latestTelemetry = await fetchLatestTelemetryPoint(DEMO_DATA_CENTER_ID)
  const anomaliesCount = countCurrentDemoFindings()
  
  return (
    <AppShell anomaliesCount={anomaliesCount} latestTelemetryTimestamp={latestTelemetry?.timestamp}>
      {children}
    </AppShell>
  )
}
