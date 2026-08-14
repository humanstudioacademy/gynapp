-- Execução: sessões, exercícios executados e séries
create table public.workout_sessions (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null unique,                       -- idempotência offline
  user_id          uuid not null references public.profiles(id) on delete cascade,
  plan_id          uuid references public.workout_plans(id) on delete set null,
  workout_day_id   uuid references public.workout_days(id)  on delete set null,
  name             text not null default 'Treino',
  status           session_status not null default 'in_progress',
  started_at       timestamptz not null default now(),
  finished_at      timestamptz,
  duration_seconds integer,
  total_volume_kg  numeric(10,2) not null default 0,
  total_sets       smallint      not null default 0,
  total_reps       integer       not null default 0,
  perceived_effort smallint,
  feeling          smallint,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint chk_effort  check (perceived_effort is null or perceived_effort between 1 and 10),
  constraint chk_feeling check (feeling is null or feeling between 1 and 5),
  constraint chk_finish  check (finished_at is null or finished_at >= started_at)
);

create table public.session_exercises (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null unique,
  session_id          uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id         uuid not null references public.exercises(id) on delete restrict,
  workout_exercise_id uuid references public.workout_exercises(id) on delete set null,
  order_index         smallint not null default 0,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.session_sets (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null unique,
  session_exercise_id uuid not null references public.session_exercises(id) on delete cascade,
  set_number          smallint not null,
  set_type            set_type not null default 'normal',
  weight_kg           numeric(6,2),
  reps                smallint,
  duration_seconds    integer,
  distance_m          numeric(8,2),
  rpe                 numeric(3,1),
  side                text,
  is_completed        boolean not null default false,
  rest_taken_seconds  smallint,
  volume_kg           numeric(12,2) generated always as (
    coalesce(weight_kg,0) * coalesce(reps,0)
  ) stored,
  notes               text,
  completed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint chk_set_number check (set_number between 1 and 50),
  constraint chk_weight     check (weight_kg is null or weight_kg between 0 and 1000),
  constraint chk_set_reps   check (reps is null or reps between 0 and 500),
  constraint chk_side       check (side is null or side in ('left','right')),
  constraint chk_set_rpe    check (rpe is null or rpe between 1 and 10)
);

create unique index uq_session_sets_number
  on public.session_sets (session_exercise_id, set_number, coalesce(side,''));

create trigger trg_sessions_updated before update on public.workout_sessions
  for each row execute function public.set_updated_at();
create trigger trg_sexerc_updated   before update on public.session_exercises
  for each row execute function public.set_updated_at();
create trigger trg_sets_updated     before update on public.session_sets
  for each row execute function public.set_updated_at();
