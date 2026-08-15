import type { Metadata } from 'next'
import './globals.css'
import './ui-states.css'
import { AppShell } from '@/components/app-shell'

export const metadata: Metadata = {
  title: 'Coolara | Sustainability Guardian',
  description: 'Synthetic data-center sustainability decision support.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AppShell>{children}</AppShell></body></html>
}
