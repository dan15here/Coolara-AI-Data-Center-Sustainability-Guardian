'use client'

import { AlertTriangle, Flag, RotateCcw, ShieldCheck, Thermometer } from 'lucide-react'
import { useState } from 'react'
import { ErrorState, LoadingState, Pill } from '@/components/ui'
import {
  MAX_COOLING_SETPOINT_C,
  MAX_SAFE_SERVER_TEMP_C,
  MAX_WORKLOAD_PERCENT,
  MIN_COOLING_SETPOINT_C,
  MIN_WORKLOAD_PERCENT,
} from '@/lib/simulator/thresholds'
import { computeCostDeltaAsPercentOfDaily } from '@/lib/calculations/cost'
import { METRIC_LABELS } from '@/lib/format/finding'
import { formatJakartaTime } from '@/lib/format/time'
import type { DashboardMetrics, Finding, SimulationInput, SimulationResult } from '@/types'
import { AiOptimizePanel } from './AiOptimizePanel'

const AMBIENT_MIN_C = 15
const AMBIENT_MAX_C = 45

const SAFE_PRESET: SimulationInput = { coolingSetpointC: 22, workloadPercent: 30, ambientTempC: 24 }
const UNSAFE_PRESET: SimulationInput = { coolingSetpointC: 27, workloadPercent: 100, ambientTempC: 40 }

const FIELDS: { key: keyof SimulationInput; label: string; unit: string; min: number; max: number }[] = [
  { key: 'coolingSetpointC', label: 'Cooling setpoint', unit: '°C', min: MIN_COOLING_SETPOINT_C, max: MAX_COOLING_SETPOINT_C },
  { key: 'workloadPercent', label: 'IT workload assumption', unit: '%', min: MIN_WORKLOAD_PERCENT, max: MAX_WORKLOAD_PERCENT },
  { key: 'ambientTempC', label: 'Ambient temperature', unit: '°C', min: AMBIENT_MIN_C, max: AMBIENT_MAX_C },
]

const RANGE_INPUT_CLASS =
  'block w-full appearance-none cursor-pointer my-[16px] mb-[8px] rounded-full ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-panel ' +
  '[&::-webkit-slider-runnable-track]:h-[8px] [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent ' +
  '[&::-moz-range-track]:h-[8px] [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[var(--color-gauge-track)] ' +
  '[&::-moz-range-progress]:h-[8px] [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-status-teal ' +
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-status-teal [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white dark:[&::-webkit-slider-thumb]:border-[#10201f] [&::-webkit-slider-thumb]:shadow-[0_1px_5px_rgba(0,0,0,0.4)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 ' +
  '[&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-status-teal [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white dark:[&::-moz-range-thumb]:border-[#10201f] [&::-moz-range-thumb]:shadow-[0_1px_5px_rgba(0,0,0,0.4)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110'

const SECONDARY_BUTTON =
  'border-0 rounded-[6px] bg-slate-100 dark:bg-[#273237] text-slate-700 dark:text-[#d6dfdd] font-bold inline-flex items-center justify-center gap-[7px] px-[14px] py-[11px] text-[12px] hover:bg-slate-200 dark:hover:bg-[#344249] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-slate-100 dark:disabled:hover:bg-[#273237]'
const PRIMARY_BUTTON =
  'border-0 rounded-[6px] bg-status-teal text-slate-50 dark:text-[#10201f] font-bold inline-flex items-center justify-center gap-[7px] px-[14px] py-[11px] text-[12px] hover:bg-teal-700 dark:hover:bg-[#5bd5c6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg'

type Status = { status: 'idle' } | { status: 'loading' } | { status: 'error' } | { status: 'done'; result: SimulationResult }

export function SimulatorView({
  initialInput,
  currentMetrics,
  typicalDailyOperatingCostIdr,
  originatingFinding,
  geminiConfigured,
}: Readonly<{
  initialInput: SimulationInput
  currentMetrics: DashboardMetrics
  typicalDailyOperatingCostIdr: number
  originatingFinding: Finding | null
  geminiConfigured: boolean
}>) {
  const [input, setInput] = useState<SimulationInput>(initialInput)
  const [state, setState] = useState<Status>({ status: 'idle' })
  const [flagged, setFlagged] = useState(false)

  function change(key: keyof SimulationInput, value: number) {
    setInput((prev) => ({ ...prev, [key]: value }))
    setState({ status: 'idle' })
    setFlagged(false)
  }

  async function runSimulation(nextInput: SimulationInput = input) {
    setState({ status: 'loading' })
    setFlagged(false)
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextInput),
      })
      if (!response.ok) throw new Error('Request failed')
      const result: SimulationResult = await response.json()
      setState({ status: 'done', result })
    } catch {
      setState({ status: 'error' })
    }
  }

  function applyPreset(preset: SimulationInput) {
    setInput(preset)
    void runSimulation(preset)
  }

  const comparisonRows =
    state.status === 'done'
      ? [
          {
            label: 'Total facility power',
            hint: null as string | null,
            unit: 'MW',
            current: currentMetrics.totalPowerMw,
            simulated: currentMetrics.totalPowerMw + state.result.estimatedEnergyDeltaMwh,
            digits: 2,
          },
          {
            label: 'PUE',
            hint: 'Power Usage Effectiveness — lower is better',
            unit: '',
            current: currentMetrics.pue,
            simulated: state.result.pue,
            digits: 2,
          },
          {
            label: 'WUE',
            hint: 'Water Usage Effectiveness — lower is better',
            unit: '',
            current: currentMetrics.wue,
            simulated: state.result.wue,
            digits: 2,
          },
          {
            label: 'Server temperature',
            hint: null,
            unit: '°C',
            current: currentMetrics.peakServerTempC,
            simulated: state.result.predictedServerTempC,
            digits: 1,
          },
        ]
      : []

  return (
    <>
      {originatingFinding && (
        <p className="text-teal-700 dark:text-[#a6d6cb] text-[12px]">
          Testing a response to the {METRIC_LABELS[originatingFinding.metric].toLowerCase()} finding detected at{' '}
          {formatJakartaTime(originatingFinding.detectedAt)} WIB.
        </p>
      )}
      <section className="grid grid-cols-1 md:grid-cols-[1fr_1.05fr] gap-[14px]">
        <div className="p-[23px] border border-surface-line bg-surface-panel rounded-lg">
          <h2 className="m-0 text-[18px]">Operating assumptions</h2>
          <p className="text-content-muted leading-[1.45] m-0 text-[12px] mt-1 mb-[18px]">
            Adjust the conditions to evaluate the trade-off. Current state as of page load.
          </p>

          <div className="flex gap-[10px] mb-[24px]">
            <button className={SECONDARY_BUTTON} type="button" onClick={() => applyPreset(SAFE_PRESET)}>
              Try a safe scenario
            </button>
            <button className={SECONDARY_BUTTON} type="button" onClick={() => applyPreset(UNSAFE_PRESET)}>
              Try an unsafe scenario
            </button>
          </div>

          {FIELDS.map(({ key, label, unit, min, max }) => {
            const percent = ((input[key] - min) / (max - min)) * 100
            return (
              <label className="block my-[28px]" key={key}>
                <span className="flex justify-between items-baseline mb-[10px]">
                  <strong className="text-[15px] font-bold text-content-base">{label}</strong>
                  <output className="text-teal-700 dark:text-[#a7e2d8] font-bold text-[14px]">
                    {input[key]} {unit}
                  </output>
                </span>
                <input
                  className={RANGE_INPUT_CLASS}
                  style={{ background: `linear-gradient(to right, var(--color-status-teal) ${percent}%, var(--color-gauge-track) ${percent}%)` }}
                  type="range"
                  min={min}
                  max={max}
                  value={input[key]}
                  onChange={(event) => change(key, Number(event.target.value))}
                />
                <small className="flex justify-between text-content-muted text-[10px]">
                  {min} {unit}
                  <i className="h-[1px] flex-1 bg-slate-200 dark:bg-[#394348] m-[7px_8px]" />
                  {max} {unit}
                </small>
              </label>
            )
          })}

          <div className="flex gap-[10px] mt-[32px]">
            <button
              className={SECONDARY_BUTTON}
              type="button"
              onClick={() => {
                setInput(initialInput)
                setState({ status: 'idle' })
                setFlagged(false)
              }}
            >
              <RotateCcw size={15} /> Reset
            </button>
            <button className={PRIMARY_BUTTON} type="button" onClick={() => runSimulation()}>
              Run simulation
            </button>
          </div>
        </div>

        <div
          className={`p-[23px] border bg-surface-panel rounded-lg transition-colors duration-300 ${state.status === 'done' ? (state.result.safe ? 'border-[#36746c]' : 'border-[#833f3b]') : 'border-surface-line'}`}
        >
          <div className="flex justify-between gap-[15px] items-start">
            <div>
              <p className="text-teal-700 dark:text-[#8fa29f] tracking-[1.25px] font-bold text-[10px] m-[0_0_8px] uppercase">DETERMINISTIC RESULT</p>
              <h2 className="m-0 text-[18px]">
                {state.status === 'done'
                  ? state.result.safe
                    ? 'Safe to review'
                    : 'Safety gate rejected'
                  : 'Ready to simulate'}
              </h2>
            </div>
            {state.status === 'done' ? (
              <Pill tone={state.result.safe ? 'healthy' : 'critical'}>
                {state.result.safe ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}{' '}
                {state.result.safe ? 'Safe' : 'Unsafe'}
              </Pill>
            ) : (
              <Pill>Not run</Pill>
            )}
          </div>

          {state.status === 'loading' && <LoadingState label="Running simulation…" />}
          {state.status === 'error' && <ErrorState label="Could not run the simulation." onRetry={() => runSimulation()} />}

          {state.status === 'done' && (
            <>
              <div className="flex gap-[11px] items-center my-[32px] mb-[15px]">
                <Thermometer size={23} className="text-status-amber" />
                <div>
                  <span className="block text-content-muted text-[11px]">Predicted server temperature</span>
                  <strong className="block text-[34px] m-[4px_0]">{state.result.predictedServerTempC.toFixed(1)}°C</strong>
                  <small className="text-content-muted text-[11px]">
              Safety threshold: {MAX_SAFE_SERVER_TEMP_C.toFixed(1)}°C
            </small>
          </div>
        </div>
        <p className="text-slate-600 dark:text-[#b9c5c3] leading-[1.5] text-[12px] mb-[20px]">{state.result.reason}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] mt-[20px] bg-surface-line border border-surface-line rounded-md overflow-hidden">
          <div className="bg-slate-50 dark:bg-[#141a1d] p-[13px]">
            <span className="block text-content-muted text-[11px]">Energy delta</span>
                  <strong className="block mt-[5px] text-[14px]">
                    {state.result.estimatedEnergyDeltaMwh >= 0 ? '+' : ''}
                    {state.result.estimatedEnergyDeltaMwh.toFixed(2)} MWh
                  </strong>
          </div>
          <div className="bg-slate-50 dark:bg-[#141a1d] p-[13px]">
            <span className="block text-content-muted text-[11px]">Water delta</span>
                  <strong className="block mt-[5px] text-[14px]">
                    {state.result.estimatedWaterDeltaLiters >= 0 ? '+' : ''}
                    {state.result.estimatedWaterDeltaLiters.toFixed(0)} L
                  </strong>
          </div>
          <div className="bg-slate-50 dark:bg-[#141a1d] p-[13px]">
            <span className="block text-content-muted text-[11px]">Estimated cost</span>
                  <strong className="block mt-[5px] text-[14px]">
                    {state.result.estimatedCostDeltaIdr >= 0 ? '+' : '-'}Rp{' '}
                    {Math.abs(state.result.estimatedCostDeltaIdr).toLocaleString('id-ID')}
                  </strong>
          </div>
          <div className="bg-slate-50 dark:bg-[#141a1d] p-[13px]">
            <span className="block text-content-muted text-[11px]">PUE / WUE</span>
                  <strong className="block mt-[5px] text-[14px]">
                    {state.result.pue.toFixed(2)} / {state.result.wue.toFixed(2)}
                  </strong>
                </div>
                <div className="bg-slate-50 dark:bg-[#141a1d] p-[13px]">
                  <span className="block text-content-muted text-[11px]">Cost delta in context</span>
                  <strong className="block mt-[5px] text-[14px]">
                    {(() => {
                      const pct = computeCostDeltaAsPercentOfDaily(state.result.estimatedCostDeltaIdr, typicalDailyOperatingCostIdr)
                      return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% of a typical day's operating cost`
                    })()}
                  </strong>
                </div>
              </div>

              <div className="mt-[20px] border border-surface-line rounded-[7px] overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-[10px] p-[11px_14px] border-b border-surface-line items-center text-[10px] uppercase tracking-[0.5px] text-content-muted bg-slate-100 dark:bg-[#121719]">
                  <span>Metric</span>
                  <span>Current</span>
                  <span>Simulated</span>
                  <span>Δ</span>
                </div>
                {comparisonRows.map((row) => {
                  const delta = row.simulated - row.current
                  return (
                    <div
                      className="grid grid-cols-2 sm:grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-[10px] p-[11px_14px] border-b border-surface-line last:border-b-0 items-center text-[12px]"
                      key={row.label}
                    >
                      <span>
                        {row.label}
                        {row.hint && <small className="block text-content-muted text-[10px] mt-[2px]">{row.hint}</small>}
                      </span>
                      <strong className="text-[13px]">
                        {row.current.toFixed(row.digits)}
                        {row.unit}
                      </strong>
                      <strong className="text-[13px]">
                        {row.simulated.toFixed(row.digits)}
                        {row.unit}
                      </strong>
                      <strong className="text-[13px]">
                        {delta >= 0 ? '+' : ''}
                        {delta.toFixed(row.digits)}
                        {row.unit}
                      </strong>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-[10px] mt-[20px]">
                <button className={SECONDARY_BUTTON} type="button" onClick={() => setFlagged(true)} disabled={flagged}>
                  <Flag size={15} /> {flagged ? 'Flagged — noted for review' : 'Flag for senior review'}
                </button>
              </div>
            </>
          )}

          {state.status === 'idle' && (
            <div className="min-h-[255px] grid place-content-center justify-items-center text-center text-content-muted gap-[12px]">
              <ShieldCheck className="text-status-teal" size={30} />
              <p className="max-w-[250px] text-[12px] leading-[1.45] m-0">Choose assumptions, then run the simulation to see a safety-gated outcome.</p>
            </div>
          )}
        </div>
      </section>

      {state.status === 'done' && (
        <AiOptimizePanel input={input} result={state.result} finding={originatingFinding} geminiConfigured={geminiConfigured} />
      )}
    </>
  )
}
