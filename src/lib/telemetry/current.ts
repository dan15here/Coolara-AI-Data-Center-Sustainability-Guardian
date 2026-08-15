import { DEMO_DATA_CENTER_ID, generateTelemetryPoint } from './generator';
import { fetchLatestTelemetryPoint } from '@/lib/supabase/repository';
import type { TelemetryPoint } from '@/types';

/**
 * Returns "the current state" of the demo facility: the latest persisted
 * point when Supabase is configured and has data, otherwise a freshly
 * generated nominal point. Used by any route that needs a baseline without
 * requiring the client to supply one.
 */
export async function getCurrentTelemetryPoint(dataCenterId: string = DEMO_DATA_CENTER_ID): Promise<TelemetryPoint> {
  const persisted = await fetchLatestTelemetryPoint(dataCenterId);
  if (persisted) return persisted;

  return generateTelemetryPoint('nominal', { seed: Date.now() });
}
