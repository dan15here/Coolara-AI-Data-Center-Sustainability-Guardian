-- Keep foreign-key filters and recent activity queries efficient.
create index if not exists alerts_data_center_detected_at_idx
  on public.alerts (data_center_id, detected_at desc);

create index if not exists simulations_data_center_created_at_idx
  on public.simulations (data_center_id, created_at desc);

-- This event-trigger function must not be callable through the public Data API.
-- Event triggers continue to run as the function owner after EXECUTE is revoked.
revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;
