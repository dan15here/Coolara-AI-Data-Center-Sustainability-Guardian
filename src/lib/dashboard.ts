import 'server-only';
import { getCurrentTelemetryPoint } from '@/lib/telemetry/current';
import { deriveDashboardMetrics } from '@/lib/calculations/metrics';
import { detectFindings } from '@/lib/anomaly/rules';
import { fetchRecentActivity, saveAlerts, saveTelemetryPoint } from '@/lib/supabase/repository';
import type { ActivityEvent, DashboardMetrics, Finding, TelemetryPoint } from '@/types';

export interface DashboardSnapshot {
  point: TelemetryPoint;
  metrics: DashboardMetrics;
  findings: Finding[];
  activity: ActivityEvent[];
}

/**
 * Single source of truth for "the current state of the facility", shared by
 * GET /api/dashboard and the /dashboard server page so both always agree:
 * prefer the latest persisted telemetry point, falling back to a fresh
 * synthetic nominal reading only when nothing has been persisted yet.
 */
export async function getDashboardSnapshot(dataCenterId: string): Promise<DashboardSnapshot> {
  const point = await getCurrentTelemetryPoint(dataCenterId);
  const metrics = deriveDashboardMetrics(point);
  const findings = detectFindings(point);

  await saveTelemetryPoint(point);
  await saveAlerts(point.dataCenterId, findings);
  const activity = await fetchRecentActivity(point.dataCenterId, 3);

  return { point, metrics, findings, activity };
}
