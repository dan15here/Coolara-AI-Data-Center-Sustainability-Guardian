import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

export function PageIntro({ eyebrow, title, children }: Readonly<{ eyebrow: string, title: string, children: React.ReactNode }>) { 
  return (
    <div className="my-[28px] mb-[24px]">
      <p className="text-[#8fa29f] tracking-[1.25px] font-bold text-[10px] m-[0_0_8px] uppercase">{eyebrow}</p>
      <h1 className="text-[27px] tracking-[-0.7px] m-[0_0_7px]">{title}</h1>
      <p className="m-0 text-content-muted">{children}</p>
    </div>
  ) 
}

export function MetricCard({ label, value, note, icon: Icon }: Readonly<{ label: string, value: string, note?: string, icon?: LucideIcon }>) { 
  return (
    <article className="p-[17px] min-h-[123px] border border-surface-line bg-surface-panel rounded-lg">
      <div className="text-content-muted flex gap-[7px] items-center text-[12px]">
        {Icon && <Icon size={16} className="text-status-teal" />}
        {label}
      </div>
      <strong className="block text-[25px] my-[16px] mb-[8px]">{value}</strong>
      {note && <span className="text-content-muted text-[11px]">{note}</span>}
    </article>
  ) 
}

const TONES = {
  neutral: 'text-[#b8c4c3] bg-[#252e32]',
  critical: 'text-[#ffb7b1] bg-status-red/20',
  healthy: 'text-[#98e1d6] bg-status-teal/20',
  warning: 'text-[#f7ce8e] bg-status-amber/20',
  high: 'text-[#ffd2a8] bg-[#f28840]/20'
}

export function Pill({ children, tone = 'neutral' }: Readonly<{ children: React.ReactNode, tone?: keyof typeof TONES }>) { 
  return (
    <span className={`inline-flex items-center gap-[5px] px-[8px] py-[4px] rounded-[4px] text-[11px] font-bold ${TONES[tone]}`}>
      {children}
    </span>
  )
}

export function TextLink({ href, children }: Readonly<{ href: string, children: React.ReactNode }>) { 
  return (
    <Link className="text-[#9be0d6] text-[12px] font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal rounded inline-flex items-center gap-1" href={href}>
      {children} <span>→</span>
    </Link> 
  )
}

export function EmptyState({ title, message }: Readonly<{ title?: string, message: string }>) {
  return (
    <div className="border border-dashed border-[#425157] rounded-lg text-content-muted p-[28px] text-center my-4">
      {title && <strong className="block mb-2 text-content-base">{title}</strong>}
      <p className="m-0 text-[13px]">{message}</p>
    </div>
  )
}

export function LoadingState({ label = 'Loading…' }: Readonly<{ label?: string }>) {
  return (
    <div className="my-[28px] border border-dashed border-[#425157] rounded-lg text-content-muted p-[28px] text-center" aria-live="polite">
      <span className="inline-block w-[8px] h-[8px] rounded-full bg-status-teal mr-[8px] animate-pulse" />
      {label}
    </div>
  )
}

export function ErrorState({ label = 'Something went wrong.', onRetry }: Readonly<{ label?: string, onRetry?: () => void }>) {
  return (
    <div className="max-w-[520px] my-[70px] mx-auto border border-dashed border-[#425157] rounded-lg text-content-muted p-[28px] text-center">
      <p className="text-[#8fa29f] tracking-[1.25px] font-bold text-[10px] m-[0_0_8px] uppercase">DATA UNAVAILABLE</p>
      <h1 className="text-content-base m-[0_0_8px] text-[24px]">{label}</h1>
      {onRetry && (
        <button 
          className="border-0 rounded-[6px] bg-status-teal text-[#10201f] font-bold inline-flex items-center justify-center gap-[7px] px-[14px] py-[11px] mt-4 hover:bg-[#5bd5c6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg" 
          onClick={onRetry}
        >
          Try again
        </button>
      )}
    </div>
  )
}
