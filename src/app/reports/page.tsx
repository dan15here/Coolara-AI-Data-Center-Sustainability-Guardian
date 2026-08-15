'use client'

import { CheckCircle2, Clock3, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { PageIntro, Pill } from '@/components/ui'

const history = [{ time: 'Today · 10:42', event: 'Cooling efficiency alert detected', source: 'Deterministic anomaly rule', severity: 'Critical', icon: ShieldAlert }, { time: 'Today · 09:56', event: 'Controlled simulation completed', source: 'What-if simulator', severity: 'Safe', icon: CheckCircle2 }, { time: 'Today · 09:55', event: 'Synthetic telemetry baseline calculated', source: 'DC-01 demo stream', severity: 'Normal', icon: Clock3 }]

export default function ReportsPage() {
  const [range, setRange] = useState('Today')
  const [eventType, setEventType] = useState('All events')
  const shown = eventType === 'All events' ? history : history.filter((item) => item.severity === eventType)
  return <><PageIntro eyebrow="OPERATIONAL HISTORY" title="Reports">Trace synthetic anomaly and simulation events for DC-01 · {range.toLowerCase()}.</PageIntro><section className="filters"><span>Date range</span>{['Today', 'Last 7 days'].map((item) => <button aria-pressed={range === item} className={range === item ? 'filter-selected' : ''} key={item} onClick={() => setRange(item)}>{item}</button>)}<span className="filter-spacer"/><span>Event type</span><select aria-label="Event type" value={eventType} onChange={(event) => setEventType(event.target.value)}><option>All events</option><option>Critical</option><option>Safe</option><option>Normal</option></select></section><section className="timeline">{shown.length ? shown.map(({ time, event, source, severity, icon: Icon }) => <article className="timeline-row" key={time}><div className="timeline-icon"><Icon size={18}/></div><div><time>{time}</time><h2>{event}</h2><p>{source}</p></div><Pill tone={severity === 'Critical' ? 'critical' : severity === 'Safe' ? 'healthy' : 'neutral'}>{severity}</Pill></article>) : <div className="empty-state">No synthetic events match this filter.</div>}</section></>
}
