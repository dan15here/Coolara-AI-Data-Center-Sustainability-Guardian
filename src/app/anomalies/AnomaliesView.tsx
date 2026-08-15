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
          <div key={finding.id} className="anomaly-group">
            <section className="anomaly-detail">
              <div className="anomaly-top">
                <Pill tone={severityTone(finding.severity)}>{severityLabel(finding.severity)} severity</Pill>
                <span>Detected {formatJakartaTime(finding.detectedAt)} WIB</span>
              </div>
              <div className="anomaly-title">
                <div className="finding-icon">
                  <Icon size={23} />
                </div>
                <div>
                  <h2>{METRIC_LABELS[finding.metric]} exceeds expected demand</h2>
                  <p>{summarizeFinding(finding)}</p>
                </div>
              </div>
              <div className="anomaly-numbers">
                <div>
                  <span>Actual</span>
                  <strong>{finding.actual.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Expected</span>
                  <strong>{finding.expected.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Deviation</span>
                  <strong className="critical-text">
                    {finding.deviationPercent >= 0 ? '+' : ''}
                    {finding.deviationPercent.toFixed(1)}%
                  </strong>
                </div>
              </div>
              <div className="chips">
                {finding.likelyFactors.map((factor) => (
                  <span key={factor}>{factor}</span>
                ))}
              </div>
              <div className="detail-actions">
                <Link href="/telemetry">
                  <ExternalLink size={15} /> View source telemetry
                </Link>
                <Link href="/simulator">
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
