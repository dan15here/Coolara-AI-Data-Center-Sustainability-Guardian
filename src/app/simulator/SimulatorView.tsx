'use client'

import { AlertTriangle, RotateCcw, ShieldCheck, Thermometer } from 'lucide-react'
import { useState } from 'react'
import { ErrorState, LoadingState, Pill } from '@/components/ui'
import {
  MAX_COOLING_SETPOINT_C,
  MAX_SAFE_SERVER_TEMP_C,
  MAX_WORKLOAD_PERCENT,
  MIN_COOLING_SETPOINT_C,
  MIN_WORKLOAD_PERCENT,
} from '@/lib/simulator/thresholds'
import type { SimulationInput, SimulationResult } from '@/types'

const AMBIENT_MIN_C = 15
const AMBIENT_MAX_C = 45

const SAFE_PRESET: SimulationInput = { coolingSetpointC: 22, workloadPercent: 30, ambientTempC: 24 }
const UNSAFE_PRESET: SimulationInput = { coolingSetpointC: 27, workloadPercent: 100, ambientTempC: 40 }

const FIELDS: { key: keyof SimulationInput; label: string; unit: string; min: number; max: number }[] = [
  { key: 'coolingSetpointC', label: 'Cooling setpoint', unit: '°C', min: MIN_COOLING_SETPOINT_C, max: MAX_COOLING_SETPOINT_C },
  { key: 'workloadPercent', label: 'IT workload assumption', unit: '%', min: MIN_WORKLOAD_PERCENT, max: MAX_WORKLOAD_PERCENT },
  { key: 'ambientTempC', label: 'Ambient temperature', unit: '°C', min: AMBIENT_MIN_C, max: AMBIENT_MAX_C },
]

type Status = { status: 'idle' } | { status: 'loading' } | { status: 'error' } | { status: 'done'; result: SimulationResult }

export function SimulatorView({ initialInput }: Readonly<{ initialInput: SimulationInput }>) {
  const [input, setInput] = useState<SimulationInput>(initialInput)
  const [state, setState] = useState<Status>({ status: 'idle' })

  function change(key: keyof SimulationInput, value: number) {
    setInput((prev) => ({ ...prev, [key]: value }))
    setState({ status: 'idle' })
  }

  async function runSimulation(nextInput: SimulationInput = input) {
    setState({ status: 'loading' })
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

  return (
    <section className="simulator-grid">
      <div className="control-panel">
        <h2>Operating assumptions</h2>
        <p>Adjust the conditions to evaluate the trade-off.</p>
        <div className="control-actions">
          <button className="button secondary" type="button" onClick={() => applyPreset(SAFE_PRESET)}>
            Try a safe scenario
          </button>
          <button className="button secondary" type="button" onClick={() => applyPreset(UNSAFE_PRESET)}>
            Try an unsafe scenario
          </button>
        </div>
        {FIELDS.map(({ key, label, unit, min, max }) => (
          <label className="slider-field" key={key}>
            <span>
              <strong>{label}</strong>
              <output>
                {input[key]} {unit}
              </output>
            </span>
            <input
              type="range"
              min={min}
              max={max}
              value={input[key]}
              onChange={(event) => change(key, Number(event.target.value))}
            />
            <small>
              {min} {unit}
              <i />
              {max} {unit}
            </small>
          </label>
        ))}
        <div className="control-actions">
          <button
            className="button secondary"
            type="button"
            onClick={() => {
              setInput(initialInput)
              setState({ status: 'idle' })
            }}
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button className="button" type="button" onClick={() => runSimulation()}>
            Run simulation
          </button>
        </div>
      </div>

      <div className={`result-panel ${state.status === 'done' ? (state.result.safe ? 'safe' : 'unsafe') : ''}`}>
        <div className="result-top">
          <div>
            <p className="eyebrow">DETERMINISTIC RESULT</p>
            <h2>
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
            <div className="temperature-result">
              <Thermometer size={23} />
              <div>
                <span>Predicted server temperature</span>
                <strong>{state.result.predictedServerTempC.toFixed(1)}°C</strong>
                <small>Safety threshold: {MAX_SAFE_SERVER_TEMP_C.toFixed(1)}°C</small>
              </div>
            </div>
            <p className="safety-reason">{state.result.reason}</p>
            <div className="impact-grid">
              <div>
                <span>Energy delta</span>
                <strong>
                  {state.result.estimatedEnergyDeltaMwh >= 0 ? '+' : ''}
                  {state.result.estimatedEnergyDeltaMwh.toFixed(2)} MWh
                </strong>
              </div>
              <div>
                <span>Water delta</span>
                <strong>
                  {state.result.estimatedWaterDeltaLiters >= 0 ? '+' : ''}
                  {state.result.estimatedWaterDeltaLiters.toFixed(0)} L
                </strong>
              </div>
              <div>
                <span>Estimated cost</span>
                <strong>
                  {state.result.estimatedCostDeltaIdr >= 0 ? '+' : '-'}Rp{' '}
                  {Math.abs(state.result.estimatedCostDeltaIdr).toLocaleString('id-ID')}
                </strong>
              </div>
              <div>
                <span>PUE / WUE</span>
                <strong>
                  {state.result.pue.toFixed(2)} / {state.result.wue.toFixed(2)}
                </strong>
              </div>
            </div>
          </>
        )}

        {state.status === 'idle' && (
          <div className="empty-result">
            <ShieldCheck size={30} />
            <p>Choose assumptions, then run the simulation to see a safety-gated outcome.</p>
          </div>
        )}
      </div>
    </section>
  )
}
