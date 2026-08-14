-- Progresso: recordes, medidas, fotos e metas
create table public.personal_records (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  exercise_id    uuid not null references public.exercises(id) on delete cascade,
  record_type    record_type not null,
  value          numeric(10,2) not null,
  reps           smallint,
  weight_kg      numeric(6,2),
  session_set_id uuid references public.session_sets(id) on delete set null,
  previous_value numeric(10,2),
  achieved_at    timestamptz not null default now(),

  unique (user_id, exercise_id, record_type)
);

create table public.body_measurements (
  id                 uuid primary key default gen_random_uuid(),
  client_id          uuid not null unique,
  user_id            uuid not null references public.profiles(id) on delete cascade,
  measured_on        date not null default current_date,
  weight_kg          numeric(5,2),
  body_fat_percent   numeric(4,1),
  neck_cm            numeric(5,1),
  shoulder_cm        numeric(5,1),
  chest_cm           numeric(5,1),
  waist_cm           numeric(5,1),
  hip_cm             numeric(5,1),
  arm_left_cm        numeric(5,1),
  arm_right_cm       numeric(5,1),
  forearm_left_cm    numeric(5,1),
  forearm_right_cm   numeric(5,1),
  thigh_left_cm      numeric(5,1),
  thigh_right_cm     numeric(5,1),
  calf_left_cm       numeric(5,1),
  calf_right_cm      numeric(5,1),
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  unique (user_id, measured_on),
  constraint chk_weight_body check (weight_kg is null or weight_kg between 20 and 500),
  constraint chk_bf          check (body_fat_percent is null or body_fat_percent between 1 and 70)
);

create table public.progress_photos (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  measurement_id uuid references public.body_measurements(id) on delete set null,
  storage_path   text not null,
  pose           photo_pose not null default 'front',
  taken_on       date not null default current_date,
  created_at     timestamptz not null default now()
);

create table public.user_goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  goal_type     goal_type not null,
  exercise_id   uuid references public.exercises(id) on delete cascade,
  title         text not null,
  target_value  numeric(10,2) not null,
  start_value   numeric(10,2),
  current_value numeric(10,2) not null default 0,
  unit          text not null default 'kg',
  start_date    date not null default current_date,
  target_date   date,
  status        goal_status not null default 'active',
  achieved_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint chk_goal_dates check (target_date is null or target_date >= start_date)
);

create trigger trg_measurements_updated before update on public.body_measurements
  for each row execute function public.set_updated_at();
create trigger trg_goals_updated before update on public.user_goals
  for each row execute function public.set_updated_at();
