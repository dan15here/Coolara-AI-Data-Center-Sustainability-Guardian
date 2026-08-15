'use client'

import { Check, ClipboardList, Copy } from 'lucide-react'
import { useState } from 'react'
import { Pill } from '@/components/ui'
import { METRIC_LABELS, severityLabel, severityTone, summarizeFinding } from '@/lib/format/finding'
import { formatJakartaDateTime } from '@/lib/format/time'
import type { DashboardMetrics, Finding, FindingSeverity, StoredSimulation, TelemetryPoint } from '@/types'

const SHIFT_WINDOW_HOURS = 12

function withinWindow(timestamp: string, hours: number): boolean {
  return new Date(timestamp).getTime() >= Date.now() - hours * 60 * 60 * 1000
}

const SEVERITY_ORDER: FindingSeverity[] = ['critical', 'high', 'medium', 'low']

function buildHandoffText(params: {
  point: TelemetryPoint
  metrics: DashboardMetrics
  activeFinding: Finding | null
  alertsInWindow: Finding[]
  safeCount: number
  rejectedCount: number
}): string {
  const { point, metrics, activeFinding, alertsInWindow, safeCount, rejectedCount } = params
  const lines = [
    `Coolara shift handoff — DC-01 Nongsa, Batam`,
    `Generated ${formatJakartaDateTime(new Date().toISOString())}`,
    ``,
    `Current posture: ${activeFinding ? `Attention required (${severityLabel(activeFinding.severity)})` : 'Nominal'}`,
    `Total power ${metrics.totalPowerMw.toFixed(2)} MW · PUE ${metrics.pue.toFixed(2)} · WUE ${metrics.wue.toFixed(2)} L/MW · Peak server temp ${metrics.peakServerTempC.toFixed(1)}°C`,
    `Latest reading: ${point.itLoadMw.toFixed(2)} MW IT load · ${point.ambientTempC.toFixed(1)}°C ambient`,
    ``,
    activeFinding
      ? `Active finding: ${summarizeFinding(activeFinding)}`
      : `Active finding: none — all monitored metrics within expected baseline.`,
    ``,
    `Last ${SHIFT_WINDOW_HOURS}h: ${alertsInWindow.length} alert(s), ${safeCount + rejectedCount} simulation(s) run (${safeCount} safe / ${rejectedCount} rejected).`,
  ]

  if (alertsInWindow.length > 0) {
    lines.push(``, `Alerts:`)
    for (const alert of alertsInWindow) {
      lines.push(`- [${severityLabel(alert.severity)}] ${METRIC_LABELS[alert.metric]} — ${summarizeFinding(alert)}`)
    }
  }

  return lines.join('\n')
}

export function ShiftHandoffPanel({
  point,
  metrics,
  activeFinding,
  alerts,
  simulations,
}: Readonly<{
  point: TelemetryPoint
  metrics: DashboardMetrics
  activeFinding: Finding | null
  alerts: Finding[]
  simulations: StoredSimulation[]
}>) {
  const [copied, setCopied] = useState(false)

  const alertsInWindow = alerts
    .filter((alert) => withinWindow(alert.detectedAt, SHIFT_WINDOW_HOURS))
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
  const simulationsInWindow = simulations.filter((sim) => withinWindow(sim.createdAt, SHIFT_WINDOW_HOURS))
  const safeCount = simulationsInWindow.filter((sim) => sim.safe).length
  const rejectedCount = simulationsInWindow.length - safeCount

  const severityCounts = SEVERITY_ORDER.map((severity) => ({
    severity,
    count: alertsInWindow.filter((alert) => alert.severity === severity).length,
  })).filter((entry) => entry.count > 0)

  async function handleCopy() {
    const text = buildHandoffText({ point, metrics, activeFinding, alertsInWindow, safeCount, rejectedCount })
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be denied by the browser; the summary is still visible on screen.
    }
  }

  return (
    <section className="p-[22px] border border-surface-line bg-surface-panel rounded-lg mb-[16px]">
      <div className="flex justify-between gap-[15px] items-start">
        <div className="flex gap-[13px]">
          <div className="w-[39px] h-[39px] grid place-items-center rounded-[9px] bg-status-teal/20 text-status-teal shrink-0">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="text-teal-700 dark:text-[#8fa29f] tracking-[1.25px] font-bold text-[10px] m-[0_0_8px] uppercase">
              OPERATIONAL HANDOFF
            </p>
            <h2 className="m-0 text-[18px]">Shift handoff summary</h2>
            <p className="text-content-muted m-[5px_0_0] text-[12px]">Last {SHIFT_WINDOW_HOURS} hours, DC-01.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="border-0 rounded-[6px] bg-slate-100 dark:bg-[#273237] text-slate-700 dark:text-[#d6dfdd] font-bold inline-flex items-center justify-center gap-[7px] px-[14px] py-[11px] text-[12px] hover:bg-slate-200 dark:hover:bg-[#344249] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg shrink-0"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy summary'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px] mt-[20px]">
        <div className="p-[13px] bg-slate-50 dark:bg-[#121719] border border-surface-line rounded-[7px]">
          <span className="block text-content-muted text-[11px]">Posture</span>
          <div className="mt-[8px]">
            <Pill tone={activeFinding ? severityTone(activeFinding.severity) : 'healthy'}>
              {activeFinding ? 'Attention required' : 'Nominal'}
            </Pill>
          </div>
        </div>
        <div className="p-[13px] bg-slate-50 dark:bg-[#121719] border border-surface-line rounded-[7px]">
          <span className="block text-content-muted text-[11px]">Total power</span>
          <strong className="block mt-[8px] text-[15px]">{metrics.totalPowerMw.toFixed(2)} MW</strong>
        </div>
        <div className="p-[13px] bg-slate-50 dark:bg-[#121719] border border-surface-line rounded-[7px]">
          <span className="block text-content-muted text-[11px]">PUE / WUE</span>
          <strong className="block mt-[8px] text-[15px]">
            {metrics.pue.toFixed(2)} / {metrics.wue.toFixed(2)}
          </strong>
        </div>
        <div className="p-[13px] bg-slate-50 dark:bg-[#121719] border border-surface-line rounded-[7px]">
          <span className="block text-content-muted text-[11px]">Peak server temp</span>
          <strong className="block mt-[8px] text-[15px]">{metrics.peakServerTempC.toFixed(1)}°C</strong>
        </div>
      </div>

      <div className="mt-[16px] p-[16px] bg-slate-50 dark:bg-[#121719] border border-surface-line rounded-[7px]">
        <span className="block text-content-muted text-[11px] mb-[6px]">Active finding</span>
        <p className="m-0 text-[13px]">
          {activeFinding ? summarizeFinding(activeFinding) : 'None — all monitored metrics within expected baseline.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-[8px] mt-[16px] text-[12px]">
        <span className="text-content-muted">
          {alertsInWindow.length} alert{alertsInWindow.length === 1 ? '' : 's'} · {simulationsInWindow.length} simulation
          {simulationsInWindow.length === 1 ? '' : 's'} ({safeCount} safe / {rejectedCount} rejected)
        </span>
        {severityCounts.map(({ severity, count }) => (
          <Pill key={severity} tone={severityTone(severity)}>
            {count} {severityLabel(severity)}
          </Pill>
        ))}
      </div>
    </section>
  )
}
