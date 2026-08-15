import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/app-shell'
import { ThemeProvider } from '@/components/theme-provider'
import { countRecentAlerts } from '@/lib/supabase/repository'
import { DEMO_DATA_CENTER_ID } from '@/lib/telemetry/generator'

export const metadata: Metadata = {
  title: 'Coolara | Sustainability Guardian',
  description: 'Synthetic data-center sustainability decision support.',
}

// The badge count doesn't need to be second-by-second accurate, so time-cache
// it aggressively (60 seconds) to avoid database hammering on every navigation.
export const revalidate = 60

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const badgeCount = await countRecentAlerts(DEMO_DATA_CENTER_ID, 24)
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AppShell badgeCount={badgeCount}>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
