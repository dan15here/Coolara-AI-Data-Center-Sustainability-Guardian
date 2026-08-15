import { Banknote, Droplets, Gauge, Thermometer, Zap } from 'lucide-react';
import type { SimulationResult } from '@/types';
import { MetricTile } from '@/components/MetricTile';
import { SafetyStatusBanner } from './SafetyStatusBanner';

function formatDelta(value: number, unit: string, decimals = 1): string {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${Math.abs(value).toFixed(decimals)} ${unit}`;
}

export function SimulationResultPanel({ result }: { result: SimulationResult }) {
  return (
    <div className="flex flex-col gap-4">
      <SafetyStatusBanner safe={result.safe} reason={result.reason} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <MetricTile
          label="Predicted server temp"
          value={result.predictedServerTempC.toFixed(1)}
          unit="C"
          icon={Thermometer}
        />
        <MetricTile label="Projected PUE" value={result.pue.toFixed(2)} icon={Gauge} />
        <MetricTile label="Projected WUE" value={result.wue.toFixed(0)} unit="L/Mw" icon={Gauge} />
        <MetricTile
          label="Energy impact"
          value={formatDelta(result.estimatedEnergyDeltaMwh, 'Mwh', 2)}
          icon={Zap}
          hint="vs. current facility state"
        />
        <MetricTile
          label="Water impact"
          value={formatDelta(result.estimatedWaterDeltaLiters, 'L', 0)}
          icon={Droplets}
          hint="vs. current facility state"
        />
        <MetricTile
          label="Cost impact"
          value={formatDelta(result.estimatedCostDeltaIdr, 'IDR', 0)}
          icon={Banknote}
          hint="Energy + water, illustrative tariff"
        />
      </div>
    </div>
  );
}
