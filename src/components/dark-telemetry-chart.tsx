'use client'

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { formatJakartaTime } from '@/lib/format/time'
import type { TelemetryPoint } from '@/types'

const subscribe = () => () => undefined

function toChartData(points: TelemetryPoint[]) {
  return points.map((p) => ({
    time: formatJakartaTime(p.timestamp),
    it: Number(p.itPowerMw.toFixed(2)),
    cooling: Number(p.coolingPowerMw.toFixed(2)),
    ambient: Number(p.ambientTempC.toFixed(1)),
    server: Number(p.serverTempC.toFixed(1)),
  }))
}

function Chart({ points, type }: Readonly<{ points: TelemetryPoint[]; type: 'energy' | 'thermal' }>) {
  const energy = type === 'energy'
  const data = toChartData(points)
  const { theme, systemTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'dark'
  const isDark = currentTheme === 'dark'

  const gridColor = isDark ? '#263139' : '#e2e8f0'
  const axisColor = isDark ? '#7f8b91' : '#64748b'
  const tooltipBg = isDark ? '#171d21' : '#ffffff'
  const tooltipBorder = isDark ? '#303c43' : '#cbd5e1'
  const tooltipText = isDark ? '#eef3f1' : '#0f172a'

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
        <CartesianGrid stroke={gridColor} strokeDasharray="3 5" vertical={false} />
        <XAxis dataKey="time" stroke={axisColor} tickLine={false} axisLine={false} />
        <YAxis stroke={axisColor} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, color: tooltipText }} itemStyle={{ color: tooltipText }} />
        <Legend iconType="circle" wrapperStyle={{ color: tooltipText }} />
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
