'use client'

import { ArrowUpRight, Droplets, Gauge, ShieldCheck, Thermometer, Zap } from 'lucide-react'
import { useState } from 'react'
import { EmptyState, ErrorState, LoadingState, MetricCard, Pill, TextLink } from '@/components/ui'
import { ScenarioControl } from '@/components/scenario-control'
import { highestSeverityFinding } from '@/lib/anomaly/rules'
import { METRIC_LABELS, severityLabel, severityTone, summarizeFinding } from '@/lib/format/finding'
import { formatJakartaTime } from '@/lib/format/time'
import type { ScenarioId } from '@/lib/telemetry/generator'
import type { ActivityEvent, DashboardMetrics, Finding, FindingSeverity, TelemetryPoint } from '@/types'

const TARGET_PUE = 1.3
// calculateWue() returns liters per MW of IT power (hundreds, not the L/kWh
// convention its name suggests), so the target must be calibrated to that
// same scale — ~900 is the nominal-scenario baseline center, not a
// dimensionless industry figure.
const TARGET_WUE = 900

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

// Bounded, severity-driven reliability score. Deliberately not "100 - deviationPercent":
// that formula has no floor and collapses to a flat, meaningless-looking 0% for any
// finding past 100% deviation (easily reached, e.g. by the water-stress scenario).
const RELIABILITY_BY_SEVERITY: Record<FindingSeverity, number> = { low: 85, medium: 65, high: 40, critical: 15 }

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

  const reliability = activeFinding ? RELIABILITY_BY_SEVERITY[activeFinding.severity] : 100
  const energy = Math.round(clamp((TARGET_PUE / data.latestMetrics.pue) * 100, 0, 100))
  const water = Math.round(clamp((TARGET_WUE / data.latestMetrics.wue) * 100, 0, 100))

  const FindingIcon = activeFinding ? METRIC_ICONS[activeFinding.metric] : ShieldCheck

  return (
    <>
      <ScenarioControl scenario={data.scenario} onChange={loadScenario} />

      <section className="border border-[#394348] bg-[#192426] rounded-[9px] p-[16px_19px] flex flex-col sm:flex-row sm:items-center justify-between gap-[20px] items-start">
        <div>
          <Pill tone={activeFinding ? severityTone(activeFinding.severity) : 'healthy'}>
            {activeFinding ? 'Attention required' : 'Nominal'}
          </Pill>
          <strong className="block my-[9px] mb-[3px] text-[15px]">
            {activeFinding
              ? `${METRIC_LABELS[activeFinding.metric]} is above the expected operating baseline.`
              : 'All systems are operating within the expected baseline.'}
          </strong>
          <p className="text-content-muted m-0 text-[12px]">
            {activeFinding
              ? `One ${severityLabel(activeFinding.severity).toLowerCase()} condition needs a review before an operational response.`
              : 'No anomalies detected for the current scenario.'}
          </p>
        </div>
        <div className="flex gap-[22px] self-stretch justify-around sm:self-auto">
          {[
            ['Reliability', reliability, 'var(--color-status-teal)'],
            ['Energy', energy, 'var(--color-status-amber)'],
            ['Water', water, 'var(--color-status-teal)'],
          ].map(([name, value, colorStr]) => (
            <div className="text-center" key={name as string}>
              <span 
                className="w-[43px] h-[43px] grid place-items-center rounded-full text-[10px] font-bold mx-auto"
                style={{ 
                  background: `radial-gradient(circle,#192326 59%,transparent 61%),conic-gradient(${colorStr} ${value}%,#344045 0)`
                }}
              >
                {value}%
              </span>
              <small className="text-content-muted block text-[10px] mt-[5px]">{name}</small>
            </div>
          ))}
        </div>
      </section>

      {state.status === 'loading' && <LoadingState label="Loading scenario…" />}
      {state.status === 'error' && <ErrorState label="Could not load telemetry." onRetry={() => loadScenario(data.scenario)} />}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px] mt-6">
        <MetricCard label="Total power" value={`${data.latestMetrics.totalPowerMw.toFixed(2)} MW`} icon={Zap} />
        <MetricCard
          label="PUE"
          value={data.latestMetrics.pue.toFixed(2)}
          note={`Target ≤ ${TARGET_PUE.toFixed(2)}`}
          icon={Gauge}
        />
        <MetricCard
          label="WUE"
          value={`${data.latestMetrics.wue.toFixed(2)} L/MW`}
          note={`Target ≤ ${TARGET_WUE.toFixed(0)}`}
          icon={Droplets}
        />
        <MetricCard label="Peak server temperature" value={`${data.latestMetrics.peakServerTempC.toFixed(1)}°C`} icon={Thermometer} />
      </section>

      <section className="mt-[38px] mb-[13px] flex items-end justify-between">
        <div>
          <p className="text-[#8fa29f] tracking-[1.25px] font-bold text-[10px] m-[0_0_8px] uppercase">ACTIVE PRIORITY FINDING</p>
          <h2 className="m-0 text-[18px]">Decision-ready anomaly</h2>
        </div>
        {activeFinding && <Pill tone={severityTone(activeFinding.severity)}>{severityLabel(activeFinding.severity)}</Pill>}
      </section>

      {activeFinding ? (
        <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] border border-[#4c3b3a] rounded-[9px] bg-surface-panel overflow-hidden">
          <div className="flex gap-[15px] p-[22px] flex-col sm:flex-row sm:items-start">
            <div className="min-w-[40px] h-[40px] grid place-items-center rounded-[9px] bg-status-red/20 text-status-red shrink-0">
              <FindingIcon size={22} />
            </div>
            <div>
              <h3 className="m-[1px_0_7px] text-[16px]">{METRIC_LABELS[activeFinding.metric]} exceeds expected demand</h3>
              <p className="text-content-muted leading-[1.45] m-0 text-[12px]">{summarizeFinding(activeFinding)}</p>
              <div className="flex flex-wrap gap-[6px] mt-[15px]">
                {activeFinding.likelyFactors.slice(0, 3).map((factor) => (
                  <span className="text-[#bbcac8] bg-[#242d31] p-[5px_8px] text-[11px] rounded-[4px]" key={factor}>{factor}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t lg:border-t-0 lg:border-l border-surface-line grid grid-cols-3 items-center p-[16px] lg:p-[0_17px] gap-[10px]">
            <div>
              <span className="block text-content-muted text-[11px]">Actual</span>
              <strong className="block mt-[5px] text-[15px]">{activeFinding.actual.toFixed(2)}</strong>
            </div>
            <div>
              <span className="block text-content-muted text-[11px]">Expected</span>
              <strong className="block mt-[5px] text-[15px]">{activeFinding.expected.toFixed(2)}</strong>
            </div>
            <div>
              <span className="block text-content-muted text-[11px]">Deviation</span>
              <strong className="block mt-[5px] text-[15px] text-[#ff9b93]">
                {activeFinding.deviationPercent >= 0 ? '+' : ''}
                {activeFinding.deviationPercent.toFixed(1)}%
              </strong>
            </div>
          </div>
          <div className="col-span-full p-[12px_22px] bg-[#141a1d] border-t border-surface-line flex flex-wrap gap-[25px]">
            <TextLink href="/anomalies">View anomaly details</TextLink>
            <TextLink href="/simulator">Simulate response</TextLink>
          </div>
        </section>
      ) : (
        <EmptyState message="No findings detected for this scenario — cooling, water, and thermal signals are within baseline." />
      )}

      <section className="mt-[18px] p-[20px] border border-[#2e5552] bg-[#162423] rounded-[8px] flex flex-col sm:flex-row items-start sm:items-center gap-[14px]">
        <div className="w-[44px] h-[44px] grid place-items-center rounded-[9px] bg-status-teal/20 text-status-teal shrink-0">
          <ShieldCheck size={23} />
        </div>
        <div>
          <p className="text-[#8fa29f] tracking-[1.25px] font-bold text-[10px] m-[0_0_8px] uppercase">DECISION SUPPORT</p>
          <h2 className="m-0 text-[18px] mb-2 sm:mb-0">Simulate before recommending action</h2>
          <p className="text-content-muted leading-[1.45] m-0 text-[12px]">Evaluate energy, water, and thermal trade-offs with a deterministic safety gate.</p>
        </div>
        <div className="sm:ml-auto shrink-0 mt-2 sm:mt-0">
          <TextLink href="/simulator">Open What-if Simulator</TextLink>
        </div>
      </section>

      <section className="mt-[38px] mb-[13px] flex items-end justify-between">
        <div>
          <p className="text-[#8fa29f] tracking-[1.25px] font-bold text-[10px] m-[0_0_8px] uppercase">RECENT OPERATIONAL EVENTS</p>
          <h2 className="m-0 text-[18px]">Activity at a glance</h2>
        </div>
        <TextLink href="/reports">View activity log</TextLink>
      </section>

      {activity.length > 0 ? (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
          {activity.map((event) => (
            <article className="border-t border-surface-line py-[13px] grid gap-[6px]" key={event.id}>
              <time className="text-content-muted text-[11px]">{formatJakartaTime(event.occurredAt)} WIB</time>
              <strong className="text-[13px]">{event.summary}</strong>
              <span className={`text-[11px] flex items-center gap-[4px] ${event.type === 'alert' ? 'text-[#ff9b93]' : 'text-content-muted'}`}>
                {event.type === 'alert' ? 'Alert' : 'Simulation'} <ArrowUpRight size={13} />
              </span>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState message="No recent activity recorded yet. Activity requires Supabase persistence — configure it to retain history across sessions." />
      )}

      <p className="text-[#a6d6cb] text-[12px]" style={{ marginTop: 8 }}>
        Latest reading: {latest.itLoadMw.toFixed(2)} MW IT load · {latest.ambientTempC.toFixed(1)}°C ambient
      </p>
    </>
  )
}
