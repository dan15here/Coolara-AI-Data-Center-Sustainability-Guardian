import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

export function PageIntro({ eyebrow, title, children }: Readonly<{ eyebrow: string, title: string, children: React.ReactNode }>) { return <div className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{children}</p></div> }
export function MetricCard({ label, value, note, icon: Icon }: Readonly<{ label: string, value: string, note?: string, icon?: LucideIcon }>) { return <article className="metric-card"><div className="metric-label">{Icon && <Icon size={16} />}{label}</div><strong>{value}</strong>{note && <span>{note}</span>}</article> }
export function Pill({ children, tone = 'neutral' }: Readonly<{ children: React.ReactNode, tone?: 'neutral' | 'critical' | 'healthy' | 'warning' | 'high' }>) { return <span className={`pill ${tone}`}>{children}</span> }
export function TextLink({ href, children }: Readonly<{ href: string, children: React.ReactNode }>) { return <Link className="text-link" href={href}>{children} <span>→</span></Link> }

export function EmptyState({ title, message }: Readonly<{ title?: string, message: string }>) {
  return <div className="empty-state">{title && <strong>{title}</strong>}<p>{message}</p></div>
}

export function LoadingState({ label = 'Loading…' }: Readonly<{ label?: string }>) {
  return <div className="loading-state" aria-live="polite"><span className="loading-dot" />{label}</div>
}

export function ErrorState({ label = 'Something went wrong.', onRetry }: Readonly<{ label?: string, onRetry?: () => void }>) {
  return <div className="error-state"><p className="eyebrow">DATA UNAVAILABLE</p><h1>{label}</h1>{onRetry && <button className="button" onClick={onRetry}>Try again</button>}</div>
}
