import { NextResponse } from 'next/server';
import { DEMO_DATA_CENTER_ID } from '@/lib/telemetry/generator';
import { getCurrentTelemetryPoint } from '@/lib/telemetry/current';
import { runSimulation } from '@/lib/simulator/engine';
import { saveSimulation } from '@/lib/supabase/repository';
import type { SimulationInput } from '@/types';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidInput(value: unknown): value is SimulationInput {
  if (!value || typeof value !== 'object') return false;
  const i = value as Record<string, unknown>;
  return isFiniteNumber(i.coolingSetpointC) && isFiniteNumber(i.workloadPercent) && isFiniteNumber(i.ambientTempC);
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isValidInput(body)) {
    return NextResponse.json(
      { error: 'Request must include coolingSetpointC, workloadPercent, and ambientTempC' },
      { status: 400 },
    );
  }

  const baseline = await getCurrentTelemetryPoint(DEMO_DATA_CENTER_ID);
  const result = runSimulation(body, baseline);
  await saveSimulation(DEMO_DATA_CENTER_ID, body, result);

  return NextResponse.json(result);
}
