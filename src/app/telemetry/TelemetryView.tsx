'use client'

import { Thermometer } from 'lucide-react'
import { EnergyChart, ThermalChart } from '@/components/dark-telemetry-chart'
import { ErrorState, LoadingState, Pill } from '@/components/ui'
import { ScenarioControl } from '@/components/scenario-control'
import { useScenarioFetch } from '@/hooks/useScenarioFetch'
import { MAX_SAFE_SERVER_TEMP_C } from '@/lib/simulator/thresholds'
import type { ScenarioId } from '@/lib/telemetry/generator'
import type { Finding, TelemetryPoint } from '@/types'

const RANGES = ['6h', '24h', '7d'] as const
type Range = (typeof RANGES)[number]

// The API caps series length at 200 points (15-minute spacing), so "7d" shows
// the most recent ~50h rather than a full week.
const POINTS_FOR: Record<Range, number> = { '6h': 24, '24h': 96, '7d': 200 }
const RANGE_TITLE: Partial<Record<Range, string>> = { '7d': 'Last ~50h available (200-point series cap)' }

type TelemetryData = { scenario: ScenarioId; range: Range; points: TelemetryPoint[] }

async function fetchTelemetryScenario(scenario: ScenarioId, range: Range): Promise<TelemetryData> {
  const response = await fetch(`/api/telemetry?scenario=${scenario}&points=${POINTS_FOR[range]}`)
  if (!response.ok) throw new Error('Request failed')
  const body: { points: TelemetryPoint[]; findings: Finding[] } = await response.json()
  return { scenario, range, points: body.points }
}

export function TelemetryView({
  initialData,
}: Readonly<{ initialData: TelemetryData }>) {
  const { data, state, load, isLoading } = useScenarioFetch(initialData, fetchTelemetryScenario)

  const latest = data.points[data.points.length - 1]
  const overThreshold = latest.serverTempC > MAX_SAFE_SERVER_TEMP_C

  return (
    <>
      <ScenarioControl scenario={data.scenario} onChange={(scenario) => load(scenario, data.range)} disabled={isLoading} />

      {state.status === 'loading' && <LoadingState label="Loading telemetry…" />}
      {state.status === 'error' && (
        <ErrorState label="Could not load telemetry." onRetry={() => load(data.scenario, data.range)} />
      )}

      <div className={`transition-opacity ${isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[14px]">
          <section className="p-[20px_17px_12px] min-w-0 border border-surface-line bg-surface-panel rounded-lg">
            <div className="flex justify-between gap-[15px] items-start">
              <div>
                <h2 className="m-0 text-[18px]">Energy & cooling demand</h2>
                <p className="text-content-muted m-[5px_0_10px] text-[11px]">Megawatts · last {data.range}</p>
              </div>
              <div className="flex border border-surface-line rounded-[5px] overflow-hidden">
                {RANGES.map((range) => (
                  <button
                    key={range}
                    type="button"
                    title={RANGE_TITLE[range]}
                    aria-pressed={data.range === range}
                    disabled={isLoading}
                    className={`border-0 text-[11px] p-[6px_8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${data.range === range ? 'text-white bg-slate-900 dark:bg-[#2a3539]' : 'text-content-muted bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
                    onClick={() => load(data.scenario, range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <EnergyChart points={data.points} />
          </section>

          <section className="p-[20px_17px_12px] min-w-0 border border-surface-line bg-surface-panel rounded-lg flex flex-col">
            <div className="flex justify-between gap-[15px] items-start">
              <div>
                <h2 className="m-0 text-[18px]">Temperature conditions</h2>
                <p className="text-content-muted m-[5px_0_10px] text-[11px]">Degrees Celsius · last {data.range}</p>
              </div>
              <Pill tone={overThreshold ? 'critical' : 'healthy'}>{latest.serverTempC.toFixed(1)}°C current</Pill>
            </div>
            <ThermalChart points={data.points} />
            <div className="mt-auto p-[9px_2px_0] border-t border-surface-line text-content-muted flex gap-[6px] items-center text-[11px]">
              <Thermometer size={15} /> Thermal reliability threshold{' '}
              <strong className="ml-auto text-amber-500 dark:text-[#f2c97c]">{MAX_SAFE_SERVER_TEMP_C.toFixed(1)}°C</strong>
            </div>
          </section>
        </div>

        <section className="mt-[14px] p-[18px] flex flex-col sm:flex-row sm:items-center justify-between border border-surface-line bg-surface-panel rounded-lg items-start">
          <div>
            <p className="text-slate-500 dark:text-[#8fa29f] tracking-[1.25px] font-bold text-[10px] m-[0_0_8px] uppercase">LATEST READING</p>
            <h2 className="m-0 text-[18px]">DC-01 · Hall A</h2>
          </div>
          <div className="grid grid-cols-2 sm:flex gap-[16px] sm:gap-[28px] mt-4 sm:mt-0">
            <span>
              <span className="text-content-muted text-[11px]">IT Load</span>
              <strong className="block text-content-base mt-[5px] text-[14px]">{latest.itLoadMw.toFixed(2)} MW</strong>
            </span>
            <span>
              <span className="text-content-muted text-[11px]">Cooling</span>
              <strong className="block text-content-base mt-[5px] text-[14px]">{latest.coolingPowerMw.toFixed(2)} MW</strong>
            </span>
            <span>
              <span className="text-content-muted text-[11px]">Water</span>
              <strong className="block text-content-base mt-[5px] text-[14px]">{(latest.waterLiters / 1000).toFixed(1)} kL/h</strong>
            </span>
            <span>
              <span className="text-content-muted text-[11px]">Ambient</span>
              <strong className="block text-content-base mt-[5px] text-[14px]">{latest.ambientTempC.toFixed(1)}°C</strong>
            </span>
          </div>
        </section>
      </div>
    </>
  )
}
