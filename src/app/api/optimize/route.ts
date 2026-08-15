import { NextResponse } from 'next/server';
import { optimizeSimulation } from '@/lib/ai/gemini';
import { isValidFinding } from '@/lib/validation/finding';
import type { Finding, SimulationInput, SimulationResult } from '@/types';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidSimulationInput(value: unknown): value is SimulationInput {
  if (!value || typeof value !== 'object') return false;
  const i = value as Record<string, unknown>;
  return isFiniteNumber(i.coolingSetpointC) && isFiniteNumber(i.workloadPercent) && isFiniteNumber(i.ambientTempC);
}

function isValidSimulationResult(value: unknown): value is SimulationResult {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.safe === 'boolean' &&
    typeof r.reason === 'string' &&
    isFiniteNumber(r.predictedServerTempC) &&
    isFiniteNumber(r.estimatedEnergyDeltaMwh) &&
    isFiniteNumber(r.estimatedWaterDeltaLiters) &&
    isFiniteNumber(r.estimatedCostDeltaIdr) &&
    isFiniteNumber(r.pue) &&
    isFiniteNumber(r.wue)
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { input, result, finding } = (body ?? {}) as { input?: unknown; result?: unknown; finding?: unknown };

  if (!isValidSimulationInput(input) || !isValidSimulationResult(result)) {
    return NextResponse.json({ error: 'Request must include a valid input and result' }, { status: 400 });
  }
  if (finding !== undefined && finding !== null && !isValidFinding(finding)) {
    return NextResponse.json({ error: 'finding, if present, must be a valid Finding' }, { status: 400 });
  }

  const response = await optimizeSimulation({
    input,
    result,
    finding: (finding as Finding | null | undefined) ?? null,
  });
  return NextResponse.json(response);
}
