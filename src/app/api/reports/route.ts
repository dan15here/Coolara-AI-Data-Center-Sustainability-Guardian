import { NextResponse } from 'next/server';
import { DEMO_DATA_CENTER_ID } from '@/lib/telemetry/generator';
import { fetchReports } from '@/lib/supabase/repository';
import type { ReportsResponse } from '@/types';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get('limit') ?? '20');
  const limit = Number.isFinite(limitParam) ? Math.min(100, Math.max(1, Math.round(limitParam))) : 20;

  const { alerts, simulations } = await fetchReports(DEMO_DATA_CENTER_ID, limit);
  const response: ReportsResponse = { alerts, simulations };

  return NextResponse.json(response);
}
