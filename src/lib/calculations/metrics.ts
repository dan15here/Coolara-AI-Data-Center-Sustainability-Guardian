import type { DashboardMetrics, TelemetryPoint } from '@/types';

const OTHER_OVERHEAD_RATIO = 0.05;

export function calculatePue(itPowerMw: number, coolingPowerMw: number, otherOverheadMw?: number): number {
  if (itPowerMw <= 0) {
    throw new RangeError('calculatePue: itPowerMw must be greater than zero');
  }
  const overhead = otherOverheadMw ?? itPowerMw * OTHER_OVERHEAD_RATIO;
  const totalPowerMw = itPowerMw + coolingPowerMw + overhead;
  return totalPowerMw / itPowerMw;
}

export function calculateWue(waterLiters: number, itPowerMw: number): number {
  if (itPowerMw <= 0) {
    throw new RangeError('calculateWue: itPowerMw must be greater than zero');
  }
  return waterLiters / itPowerMw;
}

export function deriveDashboardMetrics(point: TelemetryPoint): DashboardMetrics {
  const overhead = point.itPowerMw * OTHER_OVERHEAD_RATIO;
  const totalPowerMw = point.itPowerMw + point.coolingPowerMw + overhead;

  return {
    totalPowerMw,
    pue: calculatePue(point.itPowerMw, point.coolingPowerMw, overhead),
    wue: calculateWue(point.waterLiters, point.itPowerMw),
    peakServerTempC: point.serverTempC,
  };
}
