/**
 * Illustrative demo constants — not validated engineering or financial figures.
 */
export const FACILITY_MAX_IT_LOAD_MW = 15;

export const MIN_COOLING_SETPOINT_C = 18;
export const MAX_COOLING_SETPOINT_C = 27;
export const MIN_WORKLOAD_PERCENT = 0;
export const MAX_WORKLOAD_PERCENT = 100;
export const MAX_SAFE_SERVER_TEMP_C = 32;

/** Illustrative Indonesian industrial tariff assumptions. */
export const ENERGY_COST_IDR_PER_MWH = 1_500_000;
export const WATER_COST_IDR_PER_LITER = 20;

/** Reference cooling setpoint implicitly assumed by the baseline expectation model. */
export const REFERENCE_SETPOINT_C = 22;
export const SETPOINT_COOLING_POWER_SENSITIVITY_PCT_PER_C = 3;
export const SETPOINT_SERVER_TEMP_TRANSFER_C_PER_C = 0.6;
