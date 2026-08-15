import type { Finding, SimulationInput, SimulationResult } from '@/types';

export interface ExplainFindingRequest {
  finding: Finding;
}

export interface ExplainFindingResponse {
  explanation: string;
  source: 'gemini' | 'fallback';
  model?: string;
  /** True when this response was served from the explanation cache rather than a fresh call. */
  cached: boolean;
}

export interface OptimizeSimulationRequest {
  input: SimulationInput;
  result: SimulationResult;
  finding: Finding | null;
}

/** Deliberately has no numeric fields — the AI layer must never emit a value the UI could apply. */
export interface OptimizeSimulationResponse {
  narrative: string;
  source: 'gemini' | 'fallback';
  model?: string;
}
