'use client'

import { Thermometer } from 'lucide-react'
import { useState } from 'react'
import { EnergyChart, ThermalChart } from '@/components/dark-telemetry-chart'
import { ErrorState, LoadingState, Pill } from '@/components/ui'
import { ScenarioControl } from '@/components/scenario-control'
import { MAX_SAFE_SERVER_TEMP_C } from '@/lib/simulator/thresholds'
import type { ScenarioId } from '@/lib/telemetry/generator'
import type { Finding, TelemetryPoint } from '@/types'

const RANGES = ['6h', '24h', '7d'] as const
type Range = (typeof RANGES)[number]

// The API caps series length at 200 points (15-minute spacing), so "7d" shows
// the most recent ~50h rather than a full week.
const POINTS_FOR: Record<Range, number> = { '6h': 24, '24h': 96, '7d': 200 }
const RANGE_TITLE: Partial<Record<Range, string>> = { '7d': 'Last ~50h available (200-point series cap)' }

type Status = { status: 'idle' } | { status: 'loading' } | { status: 'error' }

export function TelemetryView({
  initialData,
}: Readonly<{ initialData: { scenario: ScenarioId; range: Range; points: TelemetryPoint[] } }>) {
  const [data, setData] = useState(initialData)
  const [state, setState] = useState<Status>({ status: 'idle' })

  async function load(scenario: ScenarioId, range: Range) {
    setState({ status: 'loading' })
    try {
      const response = await fetch(`/api/telemetry?scenario=${scenario}&points=${POINTS_FOR[range]}`)
      if (!response.ok) throw new Error('Request failed')
      const body: { points: TelemetryPoint[]; findings: Finding[] } = await response.json()
      setData({ scenario, range, points: body.points })
      setState({ status: 'idle' })
    } catch {
      setState({ status: 'error' })
    }
  }

  const latest = data.points[data.points.length - 1]
  const overThreshold = latest.serverTempC > MAX_SAFE_SERVER_TEMP_C

  return (
    <>
      <ScenarioControl scenario={data.scenario} onChange={(scenario) => load(scenario, data.range)} />

      {state.status === 'loading' && <LoadingState label="Loading telemetry…" />}
      {state.status === 'error' && (
        <ErrorState label="Could not load telemetry." onRetry={() => load(data.scenario, data.range)} />
      )}

      <div className="chart-grid">
        <section className="chart-card">
          <div className="chart-heading">
            <div>
              <h2>Energy & cooling demand</h2>
              <p>Megawatts · last {data.range}</p>
            </div>
            <div className="range-control">
              {RANGES.map((range) => (
                <button
                  key={range}
                  type="button"
                  title={RANGE_TITLE[range]}
                  aria-pressed={data.range === range}
                  className={data.range === range ? 'selected' : ''}
                  onClick={() => load(data.scenario, range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <EnergyChart points={data.points} />
        </section>
        <section className="chart-card">
          <div className="chart-heading">
            <div>
              <h2>Temperature conditions</h2>
              <p>Degrees Celsius · last {data.range}</p>
            </div>
            <Pill tone={overThreshold ? 'critical' : 'healthy'}>{latest.serverTempC.toFixed(1)}°C current</Pill>
          </div>
          <ThermalChart points={data.points} />
          <div className="threshold">
            <Thermometer size={15} /> Thermal reliability threshold <strong>{MAX_SAFE_SERVER_TEMP_C.toFixed(1)}°C</strong>
          </div>
        </section>
      </div>

      <section className="latest-card">
        <div>
          <p className="eyebrow">LATEST READING</p>
          <h2>DC-01 · Hall A</h2>
        </div>
        <div className="reading-grid">
          <span>
            IT Load <strong>{latest.itLoadMw.toFixed(2)} MW</strong>
          </span>
          <span>
            Cooling <strong>{latest.coolingPowerMw.toFixed(2)} MW</strong>
          </span>
          <span>
            Water <strong>{(latest.waterLiters / 1000).toFixed(1)} kL/h</strong>
          </span>
          <span>
            Ambient <strong>{latest.ambientTempC.toFixed(1)}°C</strong>
          </span>
        </div>
      </section>
    </>
  )
}
