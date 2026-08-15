'use client'

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TelemetryPoint } from '@/types'

function toChartData(points: TelemetryPoint[]) {
  return points.map((p) => ({
    time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    it: Number(p.itPowerMw.toFixed(2)),
    cooling: Number(p.coolingPowerMw.toFixed(2)),
    ambient: Number(p.ambientTempC.toFixed(1)),
    server: Number(p.serverTempC.toFixed(1)),
  }))
}

function Chart({ points, type }: Readonly<{ points: TelemetryPoint[]; type: 'energy' | 'thermal' }>) {
  const energy = type === 'energy'
  const data = toChartData(points)
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="aqua" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#41c5b4" stopOpacity={0.26} />
            <stop offset="100%" stopColor="#41c5b4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="amber" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f0b65a" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#f0b65a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#263139" strokeDasharray="3 5" vertical={false} />
        <XAxis dataKey="time" stroke="#7f8b91" tickLine={false} axisLine={false} />
        <YAxis stroke="#7f8b91" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: '#171d21', border: '1px solid #303c43', borderRadius: 8 }} />
        <Legend iconType="circle" />
        <Area
          type="monotone"
          dataKey={energy ? 'it' : 'ambient'}
          name={energy ? 'IT power (MW)' : 'Ambient (°C)'}
          stroke="#41c5b4"
          fill="url(#aqua)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey={energy ? 'cooling' : 'server'}
          name={energy ? 'Cooling (MW)' : 'Server (°C)'}
          stroke="#f0b65a"
          fill="url(#amber)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function EnergyChart({ points }: Readonly<{ points: TelemetryPoint[] }>) {
  return <Chart points={points} type="energy" />
}

export function ThermalChart({ points }: Readonly<{ points: TelemetryPoint[] }>) {
  return <Chart points={points} type="thermal" />
}
