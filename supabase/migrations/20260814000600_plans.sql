-- Planejamento: rotinas, fichas e exercícios prescritos
create table public.workout_plans (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references public.profiles(id) on delete cascade,
  coach_id        uuid references public.profiles(id) on delete set null,  -- reservado v2
  name            text not null,
  description     text,
  goal            fitness_goal,
  level           experience_level,
  days_per_week   smallint,
  duration_weeks  smallint,
  source          plan_source not null default 'user',
  is_template     boolean     not null default false,
  cover_path      text,
  archived_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint chk_days_week check (days_per_week is null or days_per_week between 1 and 7),
  constraint chk_owner check (
    (is_template = true and owner_id is null) or (owner_id is not null)
  )
);

alter table public.profiles
  add constraint fk_profiles_active_plan
  foreign key (active_plan_id) references public.workout_plans(id) on delete set null;

create table public.workout_days (
  id                uuid primary key default gen_random_uuid(),
  plan_id           uuid not null references public.workout_plans(id) on delete cascade,
  name              text not null,
  label             text,
  notes             text,
  order_index       smallint not null default 0,
  estimated_minutes smallint,
  scheduled_weekday smallint,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint chk_weekday check (scheduled_weekday is null or scheduled_weekday between 0 and 6)
);

-- DEFERRABLE permite reordenar dentro de uma transação sem colisão temporária
alter table public.workout_days
  add constraint uq_workout_days_order unique (plan_id, order_index)
  deferrable initially immediate;

create table public.workout_exercises (
  id                      uuid primary key default gen_random_uuid(),
  workout_day_id          uuid not null references public.workout_days(id) on delete cascade,
  exercise_id             uuid not null references public.exercises(id) on delete restrict,
  order_index             smallint not null default 0,
  target_sets             smallint not null default 3,
  target_reps_min         smallint,
  target_reps_max         smallint,
  target_weight_kg        numeric(6,2),
  target_duration_seconds smallint,
  target_rest_seconds     smallint not null default 90,
  target_rpe              numeric(3,1),
  tempo                   text,
  superset_group          smallint,
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  constraint chk_sets check (target_sets between 1 and 20),
  constraint chk_reps check (
    target_reps_min is null or target_reps_max is null or target_reps_min <= target_reps_max
  ),
  constraint chk_rpe  check (target_rpe is null or target_rpe between 1 and 10)
);

create trigger trg_plans_updated  before update on public.workout_plans
  for each row execute function public.set_updated_at();
create trigger trg_days_updated   before update on public.workout_days
  for each row execute function public.set_updated_at();
create trigger trg_wexerc_updated before update on public.workout_exercises
  for each row execute function public.set_updated_at();
