import { NextResponse } from 'next/server';
import { DEMO_DATA_CENTER_ID } from '@/lib/telemetry/generator';
import { getDashboardSnapshot } from '@/lib/dashboard';
import { highestSeverityFinding } from '@/lib/anomaly/rules';
import type { DashboardResponse } from '@/types';

export async function GET(): Promise<Response> {
  const { point, metrics, findings, activity } = await getDashboardSnapshot(DEMO_DATA_CENTER_ID);
  const activeFinding = highestSeverityFinding(findings);

  const response: DashboardResponse = { point, metrics, activeFinding, activity };
  return NextResponse.json(response);
}
