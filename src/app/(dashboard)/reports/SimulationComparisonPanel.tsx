'use client'

import { GitCompare } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState, HelpTooltip, Pill } from '@/components/ui'
import { formatJakartaDateTime } from '@/lib/format/time'
import type { StoredSimulation } from '@/types'

type Row = {
  label: string
  unit: string
  digits: number
  read: (sim: StoredSimulation) => number
}

const ROWS: Row[] = [
  { label: 'Predicted server temperature', unit: '°C', digits: 1, read: (s) => s.predictedServerTempC },
  { label: 'Energy delta', unit: ' MWh', digits: 2, read: (s) => s.estimatedEnergyDeltaMwh },
  { label: 'Water delta', unit: ' L', digits: 0, read: (s) => s.estimatedWaterDeltaLiters },
  { label: 'Cost delta', unit: ' IDR', digits: 0, read: (s) => s.estimatedCostDeltaIdr },
  { label: 'PUE', unit: '', digits: 2, read: (s) => s.pue },
  { label: 'WUE', unit: ' L/MW', digits: 2, read: (s) => s.wue },
]

function optionLabel(sim: StoredSimulation): string {
  return `${formatJakartaDateTime(sim.createdAt)} — ${sim.safe ? 'Safe' : 'Rejected'}, ${sim.predictedServerTempC.toFixed(1)}°C`
}

export function SimulationComparisonPanel({ simulations }: Readonly<{ simulations: StoredSimulation[] }>) {
  const [idA, setIdA] = useState<string>(simulations[1]?.id ?? '')
  const [idB, setIdB] = useState<string>(simulations[0]?.id ?? '')

  const simA = useMemo(() => simulations.find((s) => s.id === idA) ?? null, [simulations, idA])
  const simB = useMemo(() => simulations.find((s) => s.id === idB) ?? null, [simulations, idB])

  return (
    <section className="p-[22px] border border-surface-line bg-surface-panel rounded-lg mt-[16px]">
      <div className="flex gap-[13px] items-center">
        <div className="w-[39px] h-[39px] grid place-items-center rounded-[9px] bg-status-teal/20 text-status-teal shrink-0">
          <GitCompare size={22} />
        </div>
        <div>
          <p className="text-teal-700 dark:text-[#8fa29f] tracking-[1.25px] font-bold text-[10px] m-[0_0_8px] uppercase">
            DECISION SUPPORT
          </p>
          <h2 className="m-0 text-[18px]">Compare simulations</h2>
        </div>
      </div>

      {simulations.length < 2 ? (
        <div className="mt-[16px]">
          <EmptyState message="Need at least two stored simulations to compare. Run simulations from the What-if Simulator to build history." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px] mt-[18px]">
            <label className="block">
              <span className="block text-content-muted text-[11px] mb-[6px]">Simulation A</span>
              <select
                className="w-full border border-surface-line rounded-[4px] bg-white dark:bg-[#20292d] text-slate-700 dark:text-[#d9e2e0] p-[8px_10px] text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal cursor-pointer"
                value={idA}
                onChange={(event) => setIdA(event.target.value)}
              >
                <option value="" disabled>
                  Select a simulation…
                </option>
                {simulations.map((sim) => (
                  <option key={sim.id} value={sim.id}>
                    {optionLabel(sim)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-content-muted text-[11px] mb-[6px]">Simulation B</span>
              <select
                className="w-full border border-surface-line rounded-[4px] bg-white dark:bg-[#20292d] text-slate-700 dark:text-[#d9e2e0] p-[8px_10px] text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal cursor-pointer"
                value={idB}
                onChange={(event) => setIdB(event.target.value)}
              >
                <option value="" disabled>
                  Select a simulation…
                </option>
                {simulations.map((sim) => (
                  <option key={sim.id} value={sim.id}>
                    {optionLabel(sim)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {simA && simB && (
            <div className="mt-[20px] border border-surface-line rounded-[7px] overflow-x-auto">
              <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-[10px] p-[11px_14px] border-b border-surface-line items-center text-[10px] uppercase tracking-[0.5px] text-content-muted bg-slate-100 dark:bg-[#121719] rounded-t-[7px] min-w-[480px]">
                <span>Metric</span>
                <span>A</span>
                <span>B</span>
                <span className="flex items-center gap-[5px]">
                  Δ (B − A)
                  <HelpTooltip
                    text="B minus A for each metric. Positive means B is higher than A; negative means B is lower."
                    direction="down"
                  />
                </span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-[10px] p-[11px_14px] border-b border-surface-line items-center text-[12px] min-w-[480px]">
                <span>Outcome</span>
                <span>
                  <Pill tone={simA.safe ? 'healthy' : 'critical'}>{simA.safe ? 'Safe' : 'Rejected'}</Pill>
                </span>
                <span>
                  <Pill tone={simB.safe ? 'healthy' : 'critical'}>{simB.safe ? 'Safe' : 'Rejected'}</Pill>
                </span>
                <span className="text-content-muted">—</span>
              </div>
              {ROWS.map((row) => {
                const a = row.read(simA)
                const b = row.read(simB)
                const delta = b - a
                return (
                  <div
                    className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-[10px] p-[11px_14px] border-b border-surface-line last:border-b-0 items-center text-[12px] min-w-[480px]"
                    key={row.label}
                  >
                    <span>{row.label}</span>
                    <strong className="text-[13px]">
                      {a.toFixed(row.digits)}
                      {row.unit}
                    </strong>
                    <strong className="text-[13px]">
                      {b.toFixed(row.digits)}
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
          )}
        </>
      )}
    </section>
  )
}
