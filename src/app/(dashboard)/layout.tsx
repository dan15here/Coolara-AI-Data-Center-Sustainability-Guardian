import { AppShell } from '@/components/app-shell'
import { countRecentAlerts, fetchLatestTelemetryPoint } from '@/lib/supabase/repository'
import { DEMO_DATA_CENTER_ID } from '@/lib/telemetry/generator'

// The badge count doesn't need to be second-by-second accurate, so time-cache
// it aggressively (60 seconds) to avoid database hammering on every navigation.
export const revalidate = 60

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [anomaliesCount, latestTelemetry] = await Promise.all([
    countRecentAlerts(DEMO_DATA_CENTER_ID, 24),
    fetchLatestTelemetryPoint(DEMO_DATA_CENTER_ID),
  ])
  
  return (
    <AppShell anomaliesCount={anomaliesCount} latestTelemetryTimestamp={latestTelemetry?.timestamp}>
      {children}
    </AppShell>
  )
}
