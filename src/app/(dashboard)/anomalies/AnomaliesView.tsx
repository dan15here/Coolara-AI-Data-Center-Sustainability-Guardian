'use client'

import { ArrowDownWideNarrow, ArrowUpWideNarrow, Droplets, ExternalLink, Gauge, Play, Sparkles, Thermometer } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { EmptyState, ErrorState, LoadingState, Pill } from '@/components/ui'
import { ScenarioControl } from '@/components/scenario-control'
import { useScenarioFetch } from '@/hooks/useScenarioFetch'
import { formatFindingValue, METRIC_LABELS, severityLabel, severityTone, summarizeFinding } from '@/lib/format/finding'
import { formatJakartaTime } from '@/lib/format/time'
import type { ExplainFindingResponse } from '@/lib/ai/types'
import type { Finding, FindingSeverity } from '@/types'
import { AiExplainPanel, type ExplainStatus } from './AiExplainPanel'
import { ANOMALY_SCENARIO_TABS, ANOMALY_SCENARIOS, type AnomalyScenarioFilter } from './scenarios'

const METRIC_ICONS = { coolingPower: Gauge, waterUsage: Droplets, serverTemperature: Thermometer }

const SEVERITY_FILTERS = ['all', 'critical', 'high', 'medium', 'low'] as const
type SeverityFilter = (typeof SEVERITY_FILTERS)[number]

const SEVERITY_RANK: Record<FindingSeverity, number> = { critical: 4, high: 3, medium: 2, low: 1 }

type AnomaliesData = { scenario: AnomalyScenarioFilter; findings: Finding[] }

async function fetchScenarioFindings(scenario: AnomalyScenarioFilter | (typeof ANOMALY_SCENARIOS)[number]): Promise<Finding[]> {
  const response = await fetch(`/api/telemetry?scenario=${scenario}&points=1`)
  if (!response.ok) throw new Error('Request failed')
  const body: { findings: Finding[] } = await response.json()
  return body.findings
}

async function fetchAnomaliesScenario(scenario: AnomalyScenarioFilter): Promise<AnomaliesData> {
  if (scenario === 'all') {
    const results = await Promise.all(ANOMALY_SCENARIOS.map((id) => fetchScenarioFindings(id)))
    return { scenario, findings: results.flat() }
  }
  return { scenario, findings: await fetchScenarioFindings(scenario) }
}

export function AnomaliesView({
  initialData,
  geminiConfigured,
}: Readonly<{ initialData: AnomaliesData; geminiConfigured: boolean }>) {
  const { data, state, load, isLoading } = useScenarioFetch(initialData, fetchAnomaliesScenario)
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [sortDesc, setSortDesc] = useState(true)
  // Keyed by finding.id, which is freshly generated on every scenario load. Reset whenever
  // a new findings array arrives (tab/scenario change) via the render-time "adjusting state
  // when a prop changes" pattern, rather than an effect that would cause an extra render.
  const [explainStates, setExplainStates] = useState<Record<string, ExplainStatus>>({})
  const [trackedFindings, setTrackedFindings] = useState(data.findings)
  if (trackedFindings !== data.findings) {
    setTrackedFindings(data.findings)
    setExplainStates({})
  }

  const findings =
    severityFilter === 'all' ? data.findings : data.findings.filter((f) => f.severity === severityFilter)

  const sortedFindings = [...findings].sort((a, b) =>
    sortDesc ? SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] : SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  )

  async function analyzeFinding(finding: Finding) {
    setExplainStates((prev) => ({ ...prev, [finding.id]: { status: 'loading' } }))
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finding }),
      })
      if (!response.ok) throw new Error('Request failed')
      const result: ExplainFindingResponse = await response.json()
      setExplainStates((prev) => ({ ...prev, [finding.id]: { status: 'done', result } }))
    } catch {
      setExplainStates((prev) => ({ ...prev, [finding.id]: { status: 'error' } }))
    }
  }

  function analyzeAll() {
    for (const finding of sortedFindings) {
      const current = explainStates[finding.id]
      if (!current || current.status === 'error') analyzeFinding(finding)
    }
  }

  return (
    <>
      <ScenarioControl scenario={data.scenario} onChange={load} disabled={isLoading} presets={ANOMALY_SCENARIO_TABS} />

      <section className="flex flex-wrap items-center gap-[5px] p-[9px] mt-[14px] text-content-muted text-[11px] border border-surface-line bg-surface-panel rounded-lg">
        <span>Severity</span>
        {SEVERITY_FILTERS.map((filterOption) => (
          <button
            key={filterOption}
            type="button"
            aria-pressed={severityFilter === filterOption}
            className={`border-0 text-[11px] p-[6px_8px] rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal transition-colors ${severityFilter === filterOption ? 'text-white bg-slate-900 dark:bg-[#2a3539]' : 'text-content-muted bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
            onClick={() => setSeverityFilter(filterOption)}
          >
            {filterOption === 'all' ? 'All' : severityLabel(filterOption as FindingSeverity)}
          </button>
        ))}

        <button
          type="button"
          className="border-0 text-[11px] p-[6px_8px] rounded-[4px] flex items-center gap-[5px] ml-auto text-content-muted bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal transition-colors"
          onClick={() => setSortDesc((prev) => !prev)}
          title="Toggle severity sort order"
        >
          {sortDesc ? <ArrowDownWideNarrow size={13} /> : <ArrowUpWideNarrow size={13} />}
          {sortDesc ? 'Critical → Low' : 'Low → Critical'}
        </button>

        {sortedFindings.length > 0 && (
          <button
            type="button"
            className="border-0 text-[11px] p-[6px_8px] rounded-[4px] flex items-center gap-[5px] text-status-teal bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal transition-colors"
            onClick={analyzeAll}
          >
            <Sparkles size={13} /> Analyze all findings
          </button>
        )}
      </section>

      {state.status === 'loading' && <LoadingState label="Loading scenario…" />}
      {state.status === 'error' && <ErrorState label="Could not load findings." onRetry={() => load(data.scenario)} />}

      <div className={`mt-[16px] transition-opacity ${isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {data.findings.length === 0 && (
          <EmptyState message="No findings for this scenario. Try “Cooling inefficiency” or “Water stress” to see example findings." />
        )}

        {data.findings.length > 0 && findings.length === 0 && (
          <EmptyState message={`No ${severityLabel(severityFilter as FindingSeverity).toLowerCase()} severity findings for this scenario. Try a different filter.`} />
        )}

        {sortedFindings.map((finding, index) => {
          const Icon = METRIC_ICONS[finding.metric]
          return (
            <div key={finding.id} className="mb-[24px] border border-surface-line bg-surface-panel rounded-lg overflow-hidden">
              <section className="p-[22px]">
                <div className="flex justify-between text-content-muted text-[11px]">
                  <div className="flex items-center gap-[8px]">
                    <span className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-full bg-slate-200 dark:bg-[#2a3539] text-slate-900 dark:text-content-base text-[13px] font-bold shrink-0">
                      {index + 1}
                    </span>
                    <Pill tone={severityTone(finding.severity)}>{severityLabel(finding.severity)} severity</Pill>
                  </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 bg-slate-50 dark:bg-[#121719] border border-surface-line rounded-[7px] overflow-hidden">
                  <div className="p-[16px] border-b sm:border-b-0 sm:border-r border-surface-line bg-white dark:bg-transparent">
                    <span className="block text-content-muted text-[11px]">Actual</span>
                    <strong className="block mt-[8px] text-[20px]">{formatFindingValue(finding.metric, finding.actual)}</strong>
                  </div>
                  <div className="p-[16px] border-b sm:border-b-0 sm:border-r border-surface-line bg-white dark:bg-transparent">
                    <span className="block text-content-muted text-[11px]">Expected</span>
                    <strong className="block mt-[8px] text-[20px]">{formatFindingValue(finding.metric, finding.expected)}</strong>
                  </div>
                  <div className="p-[16px]">
                    <span className="block text-content-muted text-[11px]">Deviation</span>
                    <strong className="block mt-[8px] text-[20px] text-red-500 dark:text-[#ff9b93]">
                      {finding.deviationPercent >= 0 ? '+' : ''}
                      {finding.deviationPercent.toFixed(1)}%
                    </strong>
                  </div>
                </div>

                {finding.metric === 'waterUsage' && (
                  <p className="m-0 mt-[10px] text-[11px] text-content-muted">Water values are litres per synthetic reading.</p>
                )}

                <div className="flex flex-wrap gap-[6px] mt-[15px]">
                  {finding.likelyFactors.map((factor) => (
                    <span
                      className="text-slate-600 dark:text-[#bbcac8] bg-slate-100 dark:bg-[#242d31] p-[5px_8px] text-[11px] rounded-[4px]"
                      key={factor}
                    >
                      {factor}
                    </span>
                  ))}
                </div>

                <div className="flex gap-[20px] mt-[20px]">
                  <Link
                    className="text-teal-600 dark:text-[#9be0d6] font-bold text-[12px] flex items-center gap-[6px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal rounded"
                    href="/telemetry"
                  >
                    <ExternalLink size={15} /> View source telemetry
                  </Link>
                  <Link
                    className="text-teal-600 dark:text-[#9be0d6] font-bold text-[12px] flex items-center gap-[6px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal rounded"
                    href={`/simulator?finding=${encodeURIComponent(JSON.stringify(finding))}`}
                  >
                    <Play size={15} /> Simulate response
                  </Link>
                </div>
              </section>
              <AiExplainPanel
                geminiConfigured={geminiConfigured}
                state={explainStates[finding.id] ?? { status: 'idle' }}
                onAnalyze={() => analyzeFinding(finding)}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}
