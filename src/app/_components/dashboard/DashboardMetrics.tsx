import { Droplets, Gauge, Snowflake, Thermometer, Zap } from 'lucide-react';
import type { DashboardMetrics as DashboardMetricsType, FindingSeverity, TelemetryPoint } from '@/types';
import { MetricTile } from '@/components/MetricTile';

function pueSeverity(pue: number): FindingSeverity | undefined {
  if (pue > 2.0) return 'critical';
  if (pue > 1.6) return 'high';
  return undefined;
}

function wueSeverity(wue: number): FindingSeverity | undefined {
  if (wue > 2000) return 'critical';
  if (wue > 1500) return 'high';
  return undefined;
}

export function DashboardMetrics({
  point,
  metrics,
}: {
  point: TelemetryPoint;
  metrics: DashboardMetricsType;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <MetricTile label="Total power" value={metrics.totalPowerMw.toFixed(2)} unit="Mw" icon={Zap} />
      <MetricTile label="Cooling power" value={point.coolingPowerMw.toFixed(2)} unit="Mw" icon={Snowflake} />
      <MetricTile label="Water use" value={point.waterLiters.toFixed(0)} unit="L" icon={Droplets} />
      <MetricTile
        label="Server temp"
        value={metrics.peakServerTempC.toFixed(1)}
        unit="C"
        icon={Thermometer}
        hint={`Ambient ${point.ambientTempC.toFixed(1)} C`}
      />
      <MetricTile label="PUE" value={metrics.pue.toFixed(2)} icon={Gauge} severity={pueSeverity(metrics.pue)} />
      <MetricTile
        label="WUE"
        value={metrics.wue.toFixed(0)}
        unit="L/Mw"
        icon={Gauge}
        severity={wueSeverity(metrics.wue)}
      />
    </div>
  );
}
