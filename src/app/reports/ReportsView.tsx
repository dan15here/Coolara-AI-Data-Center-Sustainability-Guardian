'use client'

import { CheckCircle2, ShieldAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState, Pill } from '@/components/ui'
import { severityLabel, severityTone, summarizeFinding } from '@/lib/format/finding'
import { formatJakartaDateTime } from '@/lib/format/time'
import type { Finding, StoredSimulation } from '@/types'

const DATE_RANGES = ['Today', 'Last 7 days'] as const
type DateRange = (typeof DATE_RANGES)[number]

const EVENT_TYPES = ['All events', 'Critical', 'High', 'Medium', 'Low', 'Safe', 'Rejected'] as const
type EventType = (typeof EVENT_TYPES)[number]

type ReportEntry =
  | { kind: 'alert'; timestamp: string; finding: Finding }
  | { kind: 'simulation'; timestamp: string; simulation: StoredSimulation }

function withinRange(timestamp: string, range: DateRange): boolean {
  const occurred = new Date(timestamp).getTime()
  const now = Date.now()
  if (range === 'Today') {
    const startOfDay = new Date().setHours(0, 0, 0, 0)
    return occurred >= startOfDay
  }
  return occurred >= now - 7 * 24 * 60 * 60 * 1000
}

function matchesEventType(entry: ReportEntry, eventType: EventType): boolean {
  if (eventType === 'All events') return true
  if (entry.kind === 'alert') return severityLabel(entry.finding.severity) === eventType
  if (eventType === 'Safe') return entry.simulation.safe
  if (eventType === 'Rejected') return !entry.simulation.safe
  return false
}

export function ReportsView({
  alerts,
  simulations,
}: Readonly<{ alerts: Finding[]; simulations: StoredSimulation[] }>) {
  const [range, setRange] = useState<DateRange>('Today')
  const [eventType, setEventType] = useState<EventType>('All events')

  const entries: ReportEntry[] = useMemo(() => {
    const alertEntries: ReportEntry[] = alerts.map((finding) => ({
      kind: 'alert',
      timestamp: finding.detectedAt,
      finding,
    }))
    const simulationEntries: ReportEntry[] = simulations.map((simulation) => ({
      kind: 'simulation',
      timestamp: simulation.createdAt,
      simulation,
    }))
    return [...alertEntries, ...simulationEntries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
  }, [alerts, simulations])

  const shown = entries.filter((entry) => withinRange(entry.timestamp, range) && matchesEventType(entry, eventType))

  return (
    <>
      <section className="flex flex-wrap md:flex-nowrap items-center gap-[5px] p-[9px] text-content-muted text-[11px] border border-surface-line bg-surface-panel rounded-lg">
        <span>Date range</span>
        {DATE_RANGES.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={range === item}
            className={`border-0 text-[11px] p-[6px_8px] rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal transition-colors ${range === item ? 'text-white bg-slate-900 dark:bg-[#2a3539]' : 'text-content-muted bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
            onClick={() => setRange(item)}
          >
            {item}
          </button>
        ))}
        <span className="flex-1 hidden md:block" />
        <span className="ml-[10px] md:ml-0">Event type</span>
        <select 
          className="border border-surface-line rounded-[4px] bg-white dark:bg-[#20292d] text-slate-700 dark:text-[#d9e2e0] p-[6px_8px] text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal cursor-pointer"
          aria-label="Event type" 
          value={eventType} 
          onChange={(event) => setEventType(event.target.value as EventType)}
        >
          {EVENT_TYPES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </section>

      <section className="mt-[14px] p-[5px_13px] md:p-[5px_20px] border border-surface-line bg-surface-panel rounded-lg">
        {shown.length > 0 ? (
          shown.map((entry) =>
            entry.kind === 'alert' ? (
              <article className="flex items-center gap-[9px] md:gap-[15px] py-[18px] border-b border-surface-line last:border-b-0" key={entry.finding.id}>
                <div className="w-[35px] h-[35px] grid place-items-center rounded-[9px] bg-status-teal/20 text-status-teal shrink-0">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <time className="text-content-muted text-[11px] block">{formatJakartaDateTime(entry.timestamp)}</time>
                  <h2 className="text-[14px] m-[5px_0]">{summarizeFinding(entry.finding)}</h2>
                  <p className="text-content-muted text-[11px] m-0">Deterministic anomaly rule</p>
                </div>
                <div className="ml-auto hidden md:block">
                  <Pill tone={severityTone(entry.finding.severity)}>{severityLabel(entry.finding.severity)}</Pill>
                </div>
              </article>
            ) : (
              <article className="flex items-center gap-[9px] md:gap-[15px] py-[18px] border-b border-surface-line last:border-b-0" key={entry.simulation.id}>
                <div className="w-[35px] h-[35px] grid place-items-center rounded-[9px] bg-status-teal/20 text-status-teal shrink-0">
                  {entry.simulation.safe ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                </div>
                <div>
                  <time className="text-content-muted text-[11px] block">{formatJakartaDateTime(entry.timestamp)}</time>
                  <h2 className="text-[14px] m-[5px_0]">
                    Simulation {entry.simulation.safe ? 'approved' : 'rejected'}: {entry.simulation.predictedServerTempC.toFixed(1)}°C
                  </h2>
                  <p className="text-content-muted text-[11px] m-0">What-if simulator</p>
                </div>
                <div className="ml-auto hidden md:block">
                  <Pill tone={entry.simulation.safe ? 'healthy' : 'critical'}>{entry.simulation.safe ? 'Safe' : 'Rejected'}</Pill>
                </div>
              </article>
            ),
          )
        ) : (
          <EmptyState message="No stored alerts or simulations yet. Reports require Supabase persistence — visit Dashboard, Telemetry, or Simulator to generate activity, or configure Supabase to retain history." />
        )}
      </section>
    </>
  )
}
