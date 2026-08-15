-- Seed data for local/demo use. Apply after 0001_init.sql.

insert into data_centers (id, name)
values ('dc-01', 'Coolara Demo Facility')
on conflict (id) do nothing;

insert into telemetry (
  id, data_center_id, timestamp, it_load_mw, it_power_mw, cooling_power_mw, water_liters, ambient_temp_c, server_temp_c
)
values (
  gen_random_uuid(), 'dc-01', now(), 9.5, 9.93, 3.42, 8930, 25.5, 26.1
)
on conflict (id) do nothing;
