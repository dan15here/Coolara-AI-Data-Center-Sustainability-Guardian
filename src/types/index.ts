// Shared integration contract between frontend and backend.
// Field names, casing, and units follow the repository's application API contract.

export type TelemetryPoint = {
  timestamp: string;
  dataCenterId: string;
  itLoadMw: number;
  itPowerMw: number;
  coolingPowerMw: number;
  waterLiters: number;
  ambientTempC: number;
  serverTempC: number;
};

export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical';

export type FindingMetric = 'coolingPower' | 'waterUsage' | 'serverTemperature';

export type Finding = {
  id: string;
  severity: FindingSeverity;
  metric: FindingMetric;
  actual: number;
  expected: number;
  deviationPercent: number;
  detectedAt: string;
  likelyFactors: string[];
  explanationInput: Record<string, number | string>;
};

export type SimulationInput = {
  coolingSetpointC: number;
  workloadPercent: number;
  ambientTempC: number;
};

export type SimulationResult = {
  safe: boolean;
  reason: string;
  predictedServerTempC: number;
  estimatedEnergyDeltaMwh: number;
  estimatedWaterDeltaLiters: number;
  estimatedCostDeltaIdr: number;
  pue: number;
  wue: number;
};

// Additive types for the two endpoints not covered by the contract snippet above.
// These extend, rather than conflict with, the shared contract.

export type DashboardMetrics = {
  totalPowerMw: number;
  pue: number;
  wue: number;
  peakServerTempC: number;
};

export type ActivityEvent = {
  id: string;
  type: 'alert' | 'simulation';
  summary: string;
  occurredAt: string;
};

export type DashboardResponse = {
  point: TelemetryPoint;
  metrics: DashboardMetrics;
  activeFinding: Finding | null;
  activity: ActivityEvent[];
};

export type StoredSimulation = SimulationResult & {
  id: string;
  createdAt: string;
};

export type ReportsResponse = {
  alerts: Finding[];
  simulations: StoredSimulation[];
};
