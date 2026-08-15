'use client'

import { Thermometer } from 'lucide-react'
import { useState } from 'react'
import { EnergyChart, ThermalChart } from '@/components/telemetry-chart'
import { PageIntro, Pill } from '@/components/ui'

const ranges = ['6h', '24h', '7d'] as const

export default function TelemetryPage() {
  const [range, setRange] = useState<(typeof ranges)[number]>('24h')
  return <><PageIntro eyebrow="LIVE TELEMETRY" title="Telemetry overview">Track energy demand and thermal conditions across synthetic DC-01 data.</PageIntro><div className="chart-grid"><section className="chart-card wide"><div className="chart-heading"><div><h2>Energy & cooling demand</h2><p>Megawatts · last {range}</p></div><div className="range-control">{ranges.map((item) => <button aria-pressed={range === item} className={range === item ? 'selected' : ''} key={item} onClick={() => setRange(item)}>{item}</button>)}</div></div><EnergyChart /></section><section className="chart-card"><div className="chart-heading"><div><h2>Temperature conditions</h2><p>Degrees Celsius · last {range}</p></div><Pill tone="warning">78.6°C current</Pill></div><ThermalChart /><div className="threshold"><Thermometer size={15}/> Thermal reliability threshold <strong>82.0°C</strong></div></section></div><section className="latest-card"><div><p className="eyebrow">LATEST READING</p><h2>DC-01 · Hall A</h2></div><div className="reading-grid"><span>IT Load <strong>5.25 MW</strong></span><span>Cooling <strong>3.17 MW</strong></span><span>Water <strong>13.2 kL/h</strong></span><span>Ambient <strong>31.4°C</strong></span></div></section></>
}
