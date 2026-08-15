'use client'

import { Droplets, ExternalLink, Gauge, Play, Thermometer } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { EmptyState, ErrorState, LoadingState, Pill } from '@/components/ui'
import { ScenarioControl } from '@/components/scenario-control'
import { METRIC_LABELS, severityLabel, severityTone, summarizeFinding } from '@/lib/format/finding'
import { formatJakartaTime } from '@/lib/format/time'
import type { ScenarioId } from '@/lib/telemetry/generator'
import type { Finding } from '@/types'
import { AiExplainPanel } from './AiExplainPanel'

const METRIC_ICONS = { coolingPower: Gauge, waterUsage: Droplets, serverTemperature: Thermometer }

type Status = { status: 'idle' } | { status: 'loading' } | { status: 'error' }

export function AnomaliesView({
  initialData,
}: Readonly<{ initialData: { scenario: ScenarioId; findings: Finding[] } }>) {
  const [data, setData] = useState(initialData)
  const [state, setState] = useState<Status>({ status: 'idle' })

  async function loadScenario(scenario: ScenarioId) {
    setState({ status: 'loading' })
    try {
      const response = await fetch(`/api/telemetry?scenario=${scenario}&points=1`)
      if (!response.ok) throw new Error('Request failed')
      const body: { findings: Finding[] } = await response.json()
      setData({ scenario, findings: body.findings })
      setState({ status: 'idle' })
    } catch {
      setState({ status: 'error' })
    }
  }

  return (
    <>
      <ScenarioControl scenario={data.scenario} onChange={loadScenario} />

      {state.status === 'loading' && <LoadingState label="Loading scenario…" />}
      {state.status === 'error' && <ErrorState label="Could not load findings." onRetry={() => loadScenario(data.scenario)} />}

      {state.status === 'idle' && data.findings.length === 0 && (
        <EmptyState message="No findings for this scenario. Try “Cooling inefficiency” or “Water stress” to see example findings." />
      )}

      {data.findings.map((finding) => {
        const Icon = METRIC_ICONS[finding.metric]
        return (
          <div key={finding.id} className="flex flex-col gap-[16px] mb-[24px]">
            <section className="p-[22px] border border-surface-line bg-surface-panel rounded-lg">
              <div className="flex justify-between text-content-muted text-[11px]">
                <Pill tone={severityTone(finding.severity)}>{severityLabel(finding.severity)} severity</Pill>
                <span>Detected {formatJakartaTime(finding.detectedAt)} WIB</span>
              </div>
              
              <div className="flex gap-[13px] my-[20px]">
                <div className="min-w-[40px] h-[40px] grid place-items-center rounded-[9px] bg-status-red/20 text-status-red shrink-0">
                  <Icon size={23} />
                </div>
                <div>
                  <h2 className="m-0 text-[18px]">{METRIC_LABELS[finding.metric]} exceeds expected demand</h2>
                  <p className="text-content-muted leading-[1.45] m-0 text-[12px] mt-1">{summarizeFinding(finding)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 bg-[#121719] border border-surface-line rounded-[7px] overflow-hidden">
                <div className="p-[16px] border-b sm:border-b-0 sm:border-r border-surface-line">
                  <span className="block text-content-muted text-[11px]">Actual</span>
                  <strong className="block mt-[8px] text-[20px]">{finding.actual.toFixed(2)}</strong>
                </div>
                <div className="p-[16px] border-b sm:border-b-0 sm:border-r border-surface-line">
                  <span className="block text-content-muted text-[11px]">Expected</span>
                  <strong className="block mt-[8px] text-[20px]">{finding.expected.toFixed(2)}</strong>
                </div>
                <div className="p-[16px]">
                  <span className="block text-content-muted text-[11px]">Deviation</span>
                  <strong className="block mt-[8px] text-[20px] text-[#ff9b93]">
                    {finding.deviationPercent >= 0 ? '+' : ''}
                    {finding.deviationPercent.toFixed(1)}%
                  </strong>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-[6px] mt-[15px]">
                {finding.likelyFactors.map((factor) => (
                  <span className="text-[#bbcac8] bg-[#242d31] p-[5px_8px] text-[11px] rounded-[4px]" key={factor}>{factor}</span>
                ))}
              </div>
              
              <div className="flex gap-[20px] mt-[20px]">
                <Link className="text-[#9be0d6] font-bold text-[12px] flex items-center gap-[6px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal rounded" href="/telemetry">
                  <ExternalLink size={15} /> View source telemetry
                </Link>
                <Link
                  className="text-[#9be0d6] font-bold text-[12px] flex items-center gap-[6px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal rounded"
                  href={`/simulator?finding=${encodeURIComponent(JSON.stringify(finding))}`}
                >
                  <Play size={15} /> Simulate response
                </Link>
              </div>
            </section>
            <AiExplainPanel finding={finding} />
          </div>
        )
      })}
    </>
  )
}
