'use client';

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TelemetryPoint } from '@/types';

const CATEGORICAL_COLORS = ['#3b82f6', '#f97316', '#06b6d4'];

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function TelemetryChart({ points }: { points: TelemetryPoint[] }) {
  const powerData = points.map((p) => ({
    time: formatTime(p.timestamp),
    'IT load (Mw)': Number(p.itLoadMw.toFixed(2)),
    'IT power (Mw)': Number(p.itPowerMw.toFixed(2)),
    'Cooling power (Mw)': Number(p.coolingPowerMw.toFixed(2)),
  }));

  const tempData = points.map((p) => ({
    time: formatTime(p.timestamp),
    'Ambient temp (C)': Number(p.ambientTempC.toFixed(1)),
    'Server temp (C)': Number(p.serverTempC.toFixed(1)),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Power</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={powerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis dataKey="time" fontSize={12} stroke="currentColor" className="text-slate-500" />
            <YAxis fontSize={12} stroke="currentColor" className="text-slate-500" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="IT load (Mw)" stroke={CATEGORICAL_COLORS[0]} dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="IT power (Mw)" stroke={CATEGORICAL_COLORS[1]} dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="Cooling power (Mw)" stroke={CATEGORICAL_COLORS[2]} dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Temperature</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={tempData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis dataKey="time" fontSize={12} stroke="currentColor" className="text-slate-500" />
            <YAxis fontSize={12} stroke="currentColor" className="text-slate-500" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Ambient temp (C)" stroke={CATEGORICAL_COLORS[0]} dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="Server temp (C)" stroke={CATEGORICAL_COLORS[1]} dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
