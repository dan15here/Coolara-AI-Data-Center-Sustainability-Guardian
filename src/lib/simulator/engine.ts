import { computeExpectedBaseline } from '@/lib/calculations/baseline';
import { calculatePue, calculateWue, deriveDashboardMetrics } from '@/lib/calculations/metrics';
import {
  ENERGY_COST_IDR_PER_MWH,
  FACILITY_MAX_IT_LOAD_MW,
  MAX_COOLING_SETPOINT_C,
  MAX_SAFE_SERVER_TEMP_C,
  MAX_WORKLOAD_PERCENT,
  MIN_COOLING_SETPOINT_C,
  MIN_WORKLOAD_PERCENT,
  REFERENCE_SETPOINT_C,
  SETPOINT_COOLING_POWER_SENSITIVITY_PCT_PER_C,
  SETPOINT_SERVER_TEMP_TRANSFER_C_PER_C,
  WATER_COST_IDR_PER_LITER,
} from './thresholds';
import type { SimulationInput, SimulationResult, TelemetryPoint } from '@/types';

function projectState(input: SimulationInput, baseline: TelemetryPoint) {
  const projectedItLoadMw = FACILITY_MAX_IT_LOAD_MW * (input.workloadPercent / 100);
  const psuLossRatio = baseline.itLoadMw > 0 ? baseline.itPowerMw / baseline.itLoadMw - 1 : 0.045;
  const projectedItPowerMw = projectedItLoadMw * (1 + psuLossRatio);

  const reference = computeExpectedBaseline(input.ambientTempC, projectedItLoadMw);
  const setpointDeltaC = input.coolingSetpointC - REFERENCE_SETPOINT_C;

  const projectedCoolingPowerMw = Math.max(
    0,
    reference.coolingPowerMw * (1 - (setpointDeltaC * SETPOINT_COOLING_POWER_SENSITIVITY_PCT_PER_C) / 100),
  );
  const predictedServerTempC = reference.serverTempC + setpointDeltaC * SETPOINT_SERVER_TEMP_TRANSFER_C_PER_C;

  const coolingEffectivenessRatio =
    reference.coolingPowerMw > 0 ? projectedCoolingPowerMw / reference.coolingPowerMw : 1;
  const projectedWaterLiters = reference.waterLiters * coolingEffectivenessRatio;

  return { projectedItPowerMw, projectedCoolingPowerMw, projectedWaterLiters, predictedServerTempC };
}

export function runSimulation(input: SimulationInput, baseline: TelemetryPoint): SimulationResult {
  const { projectedItPowerMw, projectedCoolingPowerMw, projectedWaterLiters, predictedServerTempC } =
    projectState(input, baseline);

  const violations: string[] = [];
  if (input.coolingSetpointC < MIN_COOLING_SETPOINT_C || input.coolingSetpointC > MAX_COOLING_SETPOINT_C) {
    violations.push(
      `Cooling setpoint ${input.coolingSetpointC.toFixed(1)} C is outside the safe range of ${MIN_COOLING_SETPOINT_C}-${MAX_COOLING_SETPOINT_C} C.`,
    );
  }
  if (input.workloadPercent < MIN_WORKLOAD_PERCENT || input.workloadPercent > MAX_WORKLOAD_PERCENT) {
    violations.push(
      `Workload ${input.workloadPercent.toFixed(0)}% is outside the valid range of ${MIN_WORKLOAD_PERCENT}-${MAX_WORKLOAD_PERCENT}%.`,
    );
  }
  if (predictedServerTempC > MAX_SAFE_SERVER_TEMP_C) {
    violations.push(
      `Predicted server temperature ${predictedServerTempC.toFixed(1)} C exceeds the maximum safe threshold of ${MAX_SAFE_SERVER_TEMP_C} C.`,
    );
  }

  const safe = violations.length === 0;
  const reason = safe ? 'All parameters are within safe operating thresholds.' : violations.join(' ');

  const baselineMetrics = deriveDashboardMetrics(baseline);
  const projectedTotalPowerMw =
    projectedItPowerMw + projectedCoolingPowerMw + projectedItPowerMw * 0.05;

  const estimatedEnergyDeltaMwh = projectedTotalPowerMw - baselineMetrics.totalPowerMw;
  const estimatedWaterDeltaLiters = projectedWaterLiters - baseline.waterLiters;
  const estimatedCostDeltaIdr =
    estimatedEnergyDeltaMwh * ENERGY_COST_IDR_PER_MWH + estimatedWaterDeltaLiters * WATER_COST_IDR_PER_LITER;

  // At zero IT load, PUE/WUE ratios are undefined (no denominator) rather than unsafe.
  const hasItLoad = projectedItPowerMw > 0;

  return {
    safe,
    reason,
    predictedServerTempC,
    estimatedEnergyDeltaMwh,
    estimatedWaterDeltaLiters,
    estimatedCostDeltaIdr,
    pue: hasItLoad ? calculatePue(projectedItPowerMw, projectedCoolingPowerMw) : 0,
    wue: hasItLoad ? calculateWue(projectedWaterLiters, projectedItPowerMw) : 0,
  };
}
