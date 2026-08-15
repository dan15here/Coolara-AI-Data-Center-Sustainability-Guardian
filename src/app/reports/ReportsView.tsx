'use client'

import { CheckCircle2, ShieldAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState, Pill } from '@/components/ui'
import { severityLabel, severityTone, summarizeFinding } from '@/lib/format/finding'
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
      <section className="filters">
        <span>Date range</span>
        {DATE_RANGES.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={range === item}
            className={range === item ? 'filter-selected' : ''}
            onClick={() => setRange(item)}
          >
            {item}
          </button>
        ))}
        <span className="filter-spacer" />
        <span>Event type</span>
        <select aria-label="Event type" value={eventType} onChange={(event) => setEventType(event.target.value as EventType)}>
          {EVENT_TYPES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </section>

      <section className="timeline">
        {shown.length > 0 ? (
          shown.map((entry) =>
            entry.kind === 'alert' ? (
              <article className="timeline-row" key={entry.finding.id}>
                <div className="timeline-icon">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <time>{new Date(entry.timestamp).toLocaleString()}</time>
                  <h2>{summarizeFinding(entry.finding)}</h2>
                  <p>Deterministic anomaly rule</p>
                </div>
                <Pill tone={severityTone(entry.finding.severity)}>{severityLabel(entry.finding.severity)}</Pill>
              </article>
            ) : (
              <article className="timeline-row" key={entry.simulation.id}>
                <div className="timeline-icon">
                  {entry.simulation.safe ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                </div>
                <div>
                  <time>{new Date(entry.timestamp).toLocaleString()}</time>
                  <h2>
                    Simulation {entry.simulation.safe ? 'approved' : 'rejected'}: {entry.simulation.predictedServerTempC.toFixed(1)}°C
                  </h2>
                  <p>What-if simulator</p>
                </div>
                <Pill tone={entry.simulation.safe ? 'healthy' : 'critical'}>{entry.simulation.safe ? 'Safe' : 'Rejected'}</Pill>
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
