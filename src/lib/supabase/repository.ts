import 'server-only';
import { getSupabaseServerClient } from './serverClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ActivityEvent, Finding, SimulationInput, SimulationResult, StoredSimulation, TelemetryPoint } from '@/types';

// An ongoing anomaly re-detects on every telemetry read (every dashboard visit,
// every /api/telemetry call) while the condition persists. Without this window,
// one real issue floods `alerts` with a near-duplicate row per detection instead
// of reading as a single episode. ~2x the 15-minute telemetry interval.
const ALERT_EPISODE_COOLDOWN_MINUTES = 30;

export async function saveTelemetryPoint(point: TelemetryPoint): Promise<void> {
  const client = getSupabaseServerClient();
  if (!client) return;

  try {
    await client.from('telemetry').insert({
      id: crypto.randomUUID(),
      data_center_id: point.dataCenterId,
      timestamp: point.timestamp,
      it_load_mw: point.itLoadMw,
      it_power_mw: point.itPowerMw,
      cooling_power_mw: point.coolingPowerMw,
      water_liters: point.waterLiters,
      ambient_temp_c: point.ambientTempC,
      server_temp_c: point.serverTempC,
    });
  } catch (error) {
    console.warn('saveTelemetryPoint: best-effort persistence failed', error);
  }
}

/**
 * Upserts one finding as either a new alert row or an update to the still-open
 * episode for the same data center + metric (see ALERT_EPISODE_COOLDOWN_MINUTES).
 */
async function upsertAlert(client: SupabaseClient, dataCenterId: string, finding: Finding): Promise<void> {
  const cooldownStart = new Date(
    new Date(finding.detectedAt).getTime() - ALERT_EPISODE_COOLDOWN_MINUTES * 60_000,
  ).toISOString();

  const { data: openEpisode } = await client
    .from('alerts')
    .select('id')
    .eq('data_center_id', dataCenterId)
    .eq('metric', finding.metric)
    .gte('detected_at', cooldownStart)
    .order('detected_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = {
    severity: finding.severity,
    actual: finding.actual,
    expected: finding.expected,
    deviation_percent: finding.deviationPercent,
    detected_at: finding.detectedAt,
    likely_factors: finding.likelyFactors,
    explanation_input: finding.explanationInput,
  };

  if (openEpisode) {
    await client.from('alerts').update(row).eq('id', openEpisode.id);
    return;
  }

  await client.from('alerts').insert({ id: finding.id, data_center_id: dataCenterId, metric: finding.metric, ...row });
}

export async function saveAlerts(dataCenterId: string, findings: Finding[]): Promise<void> {
  if (findings.length === 0) return;
  const client = getSupabaseServerClient();
  if (!client) return;

  try {
    await Promise.all(findings.map((finding) => upsertAlert(client, dataCenterId, finding)));
  } catch (error) {
    console.warn('saveAlerts: best-effort persistence failed', error);
  }
}

export async function saveSimulation(
  dataCenterId: string,
  input: SimulationInput,
  result: SimulationResult,
): Promise<void> {
  const client = getSupabaseServerClient();
  if (!client) return;

  try {
    await client.from('simulations').insert({
      id: crypto.randomUUID(),
      data_center_id: dataCenterId,
      input,
      result,
    });
  } catch (error) {
    console.warn('saveSimulation: best-effort persistence failed', error);
  }
}

/** Returns null when Supabase is unconfigured or has no data, so callers fall back to synthetic generation. */
export async function fetchLatestTelemetryPoint(dataCenterId: string): Promise<TelemetryPoint | null> {
  const client = getSupabaseServerClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('telemetry')
      .select('*')
      .eq('data_center_id', dataCenterId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      timestamp: data.timestamp,
      dataCenterId: data.data_center_id,
      itLoadMw: data.it_load_mw,
      itPowerMw: data.it_power_mw,
      coolingPowerMw: data.cooling_power_mw,
      waterLiters: data.water_liters,
      ambientTempC: data.ambient_temp_c,
      serverTempC: data.server_temp_c,
    };
  } catch (error) {
    console.warn('fetchLatestTelemetryPoint: best-effort read failed', error);
    return null;
  }
}

/** Returns [] when Supabase is unconfigured, never throws. */
export async function fetchRecentActivity(dataCenterId: string, limit: number): Promise<ActivityEvent[]> {
  const client = getSupabaseServerClient();
  if (!client) return [];

  try {
    const [alertsRes, simulationsRes] = await Promise.all([
      client
        .from('alerts')
        .select('id, metric, severity, detected_at')
        .eq('data_center_id', dataCenterId)
        .order('detected_at', { ascending: false })
        .limit(limit),
      client
        .from('simulations')
        .select('id, result, created_at')
        .eq('data_center_id', dataCenterId)
        .order('created_at', { ascending: false })
        .limit(limit),
    ]);

    const alertEvents: ActivityEvent[] = (alertsRes.data ?? []).map((row) => ({
      id: row.id,
      type: 'alert',
      summary: `${row.severity} anomaly detected on ${row.metric}`,
      occurredAt: row.detected_at,
    }));

    const simulationEvents: ActivityEvent[] = (simulationsRes.data ?? []).map((row) => ({
      id: row.id,
      type: 'simulation',
      summary: row.result?.safe ? 'Simulation completed: safe' : 'Simulation completed: rejected',
      occurredAt: row.created_at,
    }));

    return [...alertEvents, ...simulationEvents]
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.warn('fetchRecentActivity: best-effort read failed', error);
    return [];
  }
}

/** Returns 0 when Supabase is unconfigured, never throws. Cheap count-only query, no rows pulled. */
export async function countRecentAlerts(dataCenterId: string, sinceHours: number): Promise<number> {
  const client = getSupabaseServerClient();
  if (!client) return 0;

  try {
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();
    const { count, error } = await client
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('data_center_id', dataCenterId)
      .gte('detected_at', since);

    if (error) return 0;
    return count ?? 0;
  } catch (error) {
    console.warn('countRecentAlerts: best-effort read failed', error);
    return 0;
  }
}

/** Returns { alerts: [], simulations: [] } when Supabase is unconfigured, never throws. */
export async function fetchReports(
  dataCenterId: string,
  limit: number,
): Promise<{ alerts: Finding[]; simulations: StoredSimulation[] }> {
  const client = getSupabaseServerClient();
  if (!client) return { alerts: [], simulations: [] };

  try {
    const [alertsRes, simulationsRes] = await Promise.all([
      client
        .from('alerts')
        .select('*')
        .eq('data_center_id', dataCenterId)
        .order('detected_at', { ascending: false })
        .limit(limit),
      client
        .from('simulations')
        .select('id, result, created_at')
        .eq('data_center_id', dataCenterId)
        .order('created_at', { ascending: false })
        .limit(limit),
    ]);

    const alerts: Finding[] = (alertsRes.data ?? []).map((row) => ({
      id: row.id,
      severity: row.severity,
      metric: row.metric,
      actual: row.actual,
      expected: row.expected,
      deviationPercent: row.deviation_percent,
      detectedAt: row.detected_at,
      likelyFactors: row.likely_factors ?? [],
      explanationInput: row.explanation_input ?? {},
    }));

    const simulations: StoredSimulation[] = (simulationsRes.data ?? []).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      ...(row.result as SimulationResult),
    }));

    return { alerts, simulations };
  } catch (error) {
    console.warn('fetchReports: best-effort read failed', error);
    return { alerts: [], simulations: [] };
  }
}
