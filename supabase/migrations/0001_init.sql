-- Coolara reference schema. Not applied automatically.
-- Apply manually via the Supabase SQL editor / CLI once real project credentials exist.

create table if not exists data_centers (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists telemetry (
  id uuid primary key,
  data_center_id text not null references data_centers(id),
  timestamp timestamptz not null,
  it_load_mw numeric not null,
  it_power_mw numeric not null,
  cooling_power_mw numeric not null,
  water_liters numeric not null,
  ambient_temp_c numeric not null,
  server_temp_c numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists telemetry_data_center_timestamp_idx
  on telemetry (data_center_id, timestamp desc);

create table if not exists alerts (
  id uuid primary key,
  data_center_id text not null references data_centers(id),
  severity text not null,
  metric text not null,
  actual numeric not null,
  expected numeric not null,
  deviation_percent numeric not null,
  detected_at timestamptz not null,
  likely_factors jsonb not null,
  explanation_input jsonb not null,
  ai_explanation text,
  ai_source text,
  created_at timestamptz not null default now()
);

create table if not exists simulations (
  id uuid primary key,
  data_center_id text not null references data_centers(id),
  input jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);
