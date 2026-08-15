import Link from 'next/link'
import { FolderOpen, HelpCircle, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export function PageIntro({ eyebrow, title, children }: Readonly<{ eyebrow: string, title: string, children: React.ReactNode }>) {
  return (
    <div className="mb-[24px]">
      <p className="text-teal-700 dark:text-[#8fa29f] tracking-[1.25px] font-bold text-[10px] m-[0_0_8px] uppercase">{eyebrow}</p>
      <h1 className="text-[27px] tracking-[-0.7px] m-[0_0_7px]">{title}</h1>
      <p className="m-0 text-content-muted">{children}</p>
    </div>
  )
}

export function MetricCard({ label, value, note, icon: Icon, help }: Readonly<{ label: string, value: string, note?: string, icon?: LucideIcon, help?: string }>) {
  return (
    <article className="p-[17px] min-h-[123px] border border-surface-line bg-surface-panel rounded-lg">
      <div className="text-content-muted flex gap-[7px] items-center text-[12px]">
        {Icon && <Icon size={16} className="text-status-teal" />}
        {label}
        {help && (
          <span className="relative inline-flex group ml-auto">
            <HelpCircle
              size={13}
              tabIndex={0}
              className="text-content-muted/70 hover:text-status-teal focus-visible:text-status-teal cursor-help outline-none"
              aria-label={help}
            />
            <span
              role="tooltip"
              className="pointer-events-none absolute z-20 bottom-full right-0 mb-[8px] w-[200px] p-[10px_12px] rounded-[7px] bg-slate-900 dark:bg-[#20292d] border border-slate-700 dark:border-[#3a4a50] text-slate-50 dark:text-content-base text-[11px] leading-[1.5] font-normal normal-case tracking-normal opacity-0 scale-95 origin-bottom-right transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 shadow-lg"
            >
              {help}
            </span>
          </span>
        )}
      </div>
      <strong className="block text-[25px] my-[16px] mb-[8px]">{value}</strong>
      {note && <span className="text-content-muted text-[11px]">{note}</span>}
    </article>
  )
}

const TONES = {
  healthy: 'text-emerald-700 bg-emerald-100 dark:text-[#88dbcd] dark:bg-[#203734]',
  neutral: 'text-slate-600 bg-slate-200 dark:text-[#b8c4c3] dark:bg-[#252e32]',
  critical: 'text-red-700 bg-red-100 dark:text-[#ffa7a0] dark:bg-[#251515]',
  warning: 'text-amber-700 bg-amber-100 dark:text-[#f7ce8e] dark:bg-[#2a2318]',
  high: 'text-orange-700 bg-orange-100 dark:text-[#ffd2a8] dark:bg-[#3d2414]'
}

export function Pill({ children, tone = 'neutral' }: Readonly<{ children: React.ReactNode, tone?: keyof typeof TONES }>) { 
  const base = "inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full text-[10px] font-bold border"
  const variants = {
    healthy: "text-emerald-700 border-emerald-300 bg-emerald-50 dark:text-[#90e6d8] dark:border-[#274641] dark:bg-[#192b29]",
    critical: "text-red-700 border-red-300 bg-red-50 dark:text-[#ffa7a0] dark:border-[#582e2c] dark:bg-[#251515]",
    warning: "text-amber-700 border-amber-300 bg-amber-50 dark:text-[#f7ce8e] dark:border-[#4d3d23] dark:bg-[#2a2318]",
    neutral: "text-slate-600 border-slate-300 bg-slate-100 dark:text-[#b8c4c3] dark:border-[#39454a] dark:bg-[#1a2226]",
    high: 'text-orange-700 border-orange-300 bg-orange-50 dark:text-[#ffd2a8] dark:border-[#673b1e] dark:bg-[#f28840]/10'
  }
  return (
    <span className={`${base} ${variants[tone as keyof typeof variants]}`}>
      {children}
    </span>
  )
}

export function TextLink({ href, children }: Readonly<{ href: string, children: React.ReactNode }>) { 
  return (
    <Link className="text-teal-700 dark:text-[#9be0d6] text-[12px] font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal rounded inline-flex items-center gap-1" href={href}>
      {children} <span>→</span>
    </Link> 
  )
}

export function EmptyState({ title, message }: Readonly<{ title?: string, message: string }>) {
  return (
    <div className="flex flex-col items-center justify-center p-[40px] text-content-muted border border-surface-line rounded-lg bg-slate-50 dark:bg-transparent border-dashed my-4">
      <FolderOpen className="mb-[12px] opacity-50 text-status-teal" size={24} />
      {title && <strong className="block mb-2 text-content-base">{title}</strong>}
      <p className="m-0 text-[13px]">{message}</p>
    </div>
  )
}

export function LoadingState({ label = 'Loading…' }: Readonly<{ label?: string }>) {
  return (
    <div className="my-[28px] border border-dashed border-surface-line rounded-lg text-content-muted p-[28px] text-center" aria-live="polite">
      <span className="inline-block w-[8px] h-[8px] rounded-full bg-status-teal mr-[8px] animate-pulse" />
      {label}
    </div>
  )
}

export function ErrorState({ label = 'Something went wrong.', onRetry }: Readonly<{ label?: string, onRetry?: () => void }>) {
  return (
    <div className="flex flex-col items-center justify-center max-w-[520px] my-[70px] mx-auto border border-dashed border-surface-line rounded-lg text-content-muted p-[28px] text-center">
      <Loader2 className="animate-spin mb-[12px] text-status-teal" size={24} />
      <p className="text-teal-700 dark:text-[#8fa29f] tracking-[1.25px] font-bold text-[10px] m-[0_0_8px] uppercase">DATA UNAVAILABLE</p>
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
