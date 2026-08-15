import { NextResponse } from 'next/server';
import { DEMO_DATA_CENTER_ID } from '@/lib/telemetry/generator';
import { getCurrentTelemetryPoint } from '@/lib/telemetry/current';
import { deriveDashboardMetrics } from '@/lib/calculations/metrics';
import { detectFindings, highestSeverityFinding } from '@/lib/anomaly/rules';
import { fetchRecentActivity, saveAlerts, saveTelemetryPoint } from '@/lib/supabase/repository';
import type { DashboardResponse } from '@/types';

export async function GET(): Promise<Response> {
  const point = await getCurrentTelemetryPoint(DEMO_DATA_CENTER_ID);
  const metrics = deriveDashboardMetrics(point);
  const findings = detectFindings(point);
  const activeFinding = highestSeverityFinding(findings);

  await saveTelemetryPoint(point);
  await saveAlerts(point.dataCenterId, findings);
  const activity = await fetchRecentActivity(point.dataCenterId, 3);

  const response: DashboardResponse = { point, metrics, activeFinding, activity };
  return NextResponse.json(response);
}
