import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/app-shell'
import { countRecentAlerts } from '@/lib/supabase/repository'
import { DEMO_DATA_CENTER_ID } from '@/lib/telemetry/generator'

export const metadata: Metadata = {
  title: 'Coolara | Sustainability Guardian',
  description: 'Synthetic data-center sustainability decision support.',
}

// The badge count doesn't need to be second-by-second accurate, so time-cache
// it rather than querying Supabase fresh on every single request app-wide.
export const revalidate = 60

const RECENT_ALERT_WINDOW_HOURS = 24

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const anomaliesCount = await countRecentAlerts(DEMO_DATA_CENTER_ID, RECENT_ALERT_WINDOW_HOURS)

  return (
    <html lang="en">
      <body>
        <AppShell anomaliesCount={anomaliesCount}>{children}</AppShell>
      </body>
    </html>
  )
}
