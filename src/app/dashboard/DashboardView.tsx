'use client'

import { ArrowUpRight, Droplets, Gauge, ShieldCheck, Thermometer, Zap } from 'lucide-react'
import { useState } from 'react'
import { EmptyState, ErrorState, LoadingState, MetricCard, Pill, TextLink } from '@/components/ui'
import { ScenarioControl } from '@/components/scenario-control'
import { highestSeverityFinding } from '@/lib/anomaly/rules'
import { METRIC_LABELS, severityLabel, severityTone, summarizeFinding } from '@/lib/format/finding'
import type { ScenarioId } from '@/lib/telemetry/generator'
import type { ActivityEvent, DashboardMetrics, Finding, TelemetryPoint } from '@/types'

const TARGET_PUE = 1.3
const TARGET_WUE = 1.45

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

const METRIC_ICONS = { coolingPower: Gauge, waterUsage: Droplets, serverTemperature: Thermometer }

type DashboardData = { scenario: ScenarioId; point: TelemetryPoint; latestMetrics: DashboardMetrics; findings: Finding[] }
type Status = { status: 'idle' } | { status: 'loading' } | { status: 'error' }

export function DashboardView({
  initialData,
  activity,
}: Readonly<{ initialData: DashboardData; activity: ActivityEvent[] }>) {
  const [data, setData] = useState(initialData)
  const [state, setState] = useState<Status>({ status: 'idle' })

  async function loadScenario(scenario: ScenarioId) {
    setState({ status: 'loading' })
    try {
      const response = await fetch(`/api/telemetry?scenario=${scenario}&points=1`)
      if (!response.ok) throw new Error('Request failed')
      const body: { points: TelemetryPoint[]; latestMetrics: DashboardMetrics; findings: Finding[] } = await response.json()
      const point = body.points[body.points.length - 1]
      setData({ scenario, point, latestMetrics: body.latestMetrics, findings: body.findings })
      setState({ status: 'idle' })
    } catch {
      setState({ status: 'error' })
    }
  }

  const activeFinding = highestSeverityFinding(data.findings)
  const latest = data.point

  const reliability = Math.round(clamp(100 - (activeFinding?.deviationPercent ?? 0), 0, 100))
  const energy = Math.round(clamp((TARGET_PUE / data.latestMetrics.pue) * 100, 0, 100))
  const water = Math.round(clamp((TARGET_WUE / data.latestMetrics.wue) * 100, 0, 100))

  const FindingIcon = activeFinding ? METRIC_ICONS[activeFinding.metric] : ShieldCheck

  return (
    <>
      <ScenarioControl scenario={data.scenario} onChange={loadScenario} />

      <section className="posture">
        <div>
          <Pill tone={activeFinding ? severityTone(activeFinding.severity) : 'healthy'}>
            {activeFinding ? 'Attention required' : 'Nominal'}
          </Pill>
          <strong>
            {activeFinding
              ? `${METRIC_LABELS[activeFinding.metric]} is above the expected operating baseline.`
              : 'All systems are operating within the expected baseline.'}
          </strong>
          <p>
            {activeFinding
              ? `One ${severityLabel(activeFinding.severity).toLowerCase()} condition needs a review before an operational response.`
              : 'No anomalies detected for the current scenario.'}
          </p>
        </div>
        <div className="health-list">
          {[
            ['Reliability', reliability],
            ['Energy', energy],
            ['Water', water],
          ].map(([name, value]) => (
            <div className="health" key={name as string}>
              <span style={{ '--progress': `${value}%` } as React.CSSProperties}>{value}%</span>
              <small>{name}</small>
            </div>
          ))}
        </div>
      </section>

      {state.status === 'loading' && <LoadingState label="Loading scenario…" />}
      {state.status === 'error' && <ErrorState label="Could not load telemetry." onRetry={() => loadScenario(data.scenario)} />}

      <section className="metrics-grid">
        <MetricCard label="Total power" value={`${data.latestMetrics.totalPowerMw.toFixed(2)} MW`} icon={Zap} />
        <MetricCard
          label="PUE"
          value={data.latestMetrics.pue.toFixed(2)}
          note={`Target ≤ ${TARGET_PUE.toFixed(2)}`}
          icon={Gauge}
        />
        <MetricCard
          label="WUE"
          value={`${data.latestMetrics.wue.toFixed(2)} L/kWh`}
          note={`Target ≤ ${TARGET_WUE.toFixed(2)}`}
          icon={Droplets}
        />
        <MetricCard label="Peak server temperature" value={`${data.latestMetrics.peakServerTempC.toFixed(1)}°C`} icon={Thermometer} />
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">ACTIVE PRIORITY FINDING</p>
          <h2>Decision-ready anomaly</h2>
        </div>
        {activeFinding && <Pill tone={severityTone(activeFinding.severity)}>{severityLabel(activeFinding.severity)}</Pill>}
      </section>

      {activeFinding ? (
        <section className="finding-card">
          <div className="finding-main">
            <div className="finding-icon">
              <FindingIcon size={22} />
            </div>
            <div>
              <h3>{METRIC_LABELS[activeFinding.metric]} exceeds expected demand</h3>
              <p>{summarizeFinding(activeFinding)}</p>
              <div className="chips">
                {activeFinding.likelyFactors.slice(0, 3).map((factor) => (
                  <span key={factor}>{factor}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="comparison">
            <div>
              <span>Actual</span>
              <strong>{activeFinding.actual.toFixed(2)}</strong>
            </div>
            <div>
              <span>Expected</span>
              <strong>{activeFinding.expected.toFixed(2)}</strong>
            </div>
            <div>
              <span>Deviation</span>
              <strong className="critical-text">
                {activeFinding.deviationPercent >= 0 ? '+' : ''}
                {activeFinding.deviationPercent.toFixed(1)}%
              </strong>
            </div>
          </div>
          <div className="finding-actions">
            <TextLink href="/anomalies">View anomaly details</TextLink>
            <TextLink href="/simulator">Simulate response</TextLink>
          </div>
        </section>
      ) : (
        <EmptyState message="No findings detected for this scenario — cooling, water, and thermal signals are within baseline." />
      )}

      <section className="support-banner">
        <div className="support-icon">
          <ShieldCheck size={23} />
        </div>
        <div>
          <p className="eyebrow">DECISION SUPPORT</p>
          <h2>Simulate before recommending action</h2>
          <p>Evaluate energy, water, and thermal trade-offs with a deterministic safety gate.</p>
        </div>
        <TextLink href="/simulator">Open What-if Simulator</TextLink>
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">RECENT OPERATIONAL EVENTS</p>
          <h2>Activity at a glance</h2>
        </div>
        <TextLink href="/reports">View activity log</TextLink>
      </section>

      {activity.length > 0 ? (
        <section className="events-grid">
          {activity.map((event) => (
            <article className="event" key={event.id}>
              <time>{new Date(event.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
              <strong>{event.summary}</strong>
              <span className={event.type === 'alert' ? 'critical-text' : ''}>
                {event.type === 'alert' ? 'Alert' : 'Simulation'} <ArrowUpRight size={13} />
              </span>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState message="No recent activity recorded yet. Activity requires Supabase persistence — configure it to retain history across sessions." />
      )}

      <p className="synthetic-inline" style={{ marginTop: 8 }}>
        Latest reading: {latest.itLoadMw.toFixed(2)} MW IT load · {latest.ambientTempC.toFixed(1)}°C ambient
      </p>
    </>
  )
}
