import { NextResponse } from 'next/server';
import { DEMO_DATA_CENTER_ID, generateTelemetrySeries, type ScenarioId } from '@/lib/telemetry/generator';
import { deriveDashboardMetrics } from '@/lib/calculations/metrics';
import { detectFindings } from '@/lib/anomaly/rules';
import { saveAlerts, saveTelemetryPoint } from '@/lib/supabase/repository';

const VALID_SCENARIOS: ScenarioId[] = ['nominal', 'coolingInefficiency', 'waterStress', 'workloadSpike'];

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const scenarioParam = searchParams.get('scenario') ?? 'nominal';
  const pointsParam = Number(searchParams.get('points') ?? '24');

  if (!VALID_SCENARIOS.includes(scenarioParam as ScenarioId)) {
    return NextResponse.json({ error: `Invalid scenario. Expected one of: ${VALID_SCENARIOS.join(', ')}` }, { status: 400 });
  }

  const points = Number.isFinite(pointsParam) ? Math.min(200, Math.max(1, Math.round(pointsParam))) : 24;
  const scenario = scenarioParam as ScenarioId;

  // Vary the seed per request so repeated dashboard refreshes don't return identical synthetic data.
  const series = generateTelemetrySeries(scenario, points, { seed: Date.now() });
  const latest = series[series.length - 1];
  const latestMetrics = deriveDashboardMetrics(latest);
  const findings = detectFindings(latest);

  await saveTelemetryPoint(latest);
  await saveAlerts(latest.dataCenterId, findings);

  // `points` matches the documented contract; `latestMetrics`/`findings` are an additive
  // extension so the demo dashboard can show a scenario-driven anomaly without a second round trip.
  return NextResponse.json({ dataCenterId: DEMO_DATA_CENTER_ID, points: series, latestMetrics, findings });
}
