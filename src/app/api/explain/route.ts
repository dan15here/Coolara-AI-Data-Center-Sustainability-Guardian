import { NextResponse } from 'next/server';
import { explainFinding } from '@/lib/ai/gemini';
import type { Finding } from '@/types';

function isValidFinding(value: unknown): value is Finding {
  if (!value || typeof value !== 'object') return false;
  const f = value as Record<string, unknown>;
  return (
    typeof f.id === 'string' &&
    (f.severity === 'low' || f.severity === 'medium' || f.severity === 'high' || f.severity === 'critical') &&
    (f.metric === 'coolingPower' || f.metric === 'waterUsage' || f.metric === 'serverTemperature') &&
    typeof f.actual === 'number' &&
    typeof f.expected === 'number' &&
    typeof f.deviationPercent === 'number' &&
    typeof f.detectedAt === 'string' &&
    Array.isArray(f.likelyFactors) &&
    typeof f.explanationInput === 'object' &&
    f.explanationInput !== null
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { finding } = (body ?? {}) as { finding?: unknown };

  if (!isValidFinding(finding)) {
    return NextResponse.json({ error: 'Request must include a valid finding' }, { status: 400 });
  }

  const result = await explainFinding({ finding });
  return NextResponse.json(result);
}
