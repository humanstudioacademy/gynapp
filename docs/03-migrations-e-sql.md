# 03 — Migrations e SQL

[← Voltar ao índice](./README.md)

> SQL pronto para copiar. Cada bloco vira um arquivo em `supabase/migrations/`.
> **Ordem importa** — as FKs dependem da sequência abaixo.

---

## 0. Preparação do ambiente Supabase

```bash
npm i -g supabase
supabase init
supabase login
supabase link --project-ref <REF_DO_SEU_PROJETO>
```

**Fluxo de trabalho recomendado:**

```bash
supabase start                    # sobe Postgres local em Docker
supabase migration new nome_da_migration
# edita o SQL gerado em supabase/migrations/
supabase db reset                 # recria o banco local aplicando tudo + seed
npm run types:gen                 # regenera database.types.ts
supabase db push                  # aplica no projeto remoto (dev → staging → prod)
```

> ⚠️ **Nunca** editar uma migration já aplicada em produção. Sempre criar uma nova.

---

## 1. `20260813000100_extensions.sql`

```sql
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- username case-insensitive
create extension if not exists "unaccent";   -- busca ignorando acentos
```

---

## 2. `20260813000200_enums.sql`

```sql
create type gender_type       as enum ('male','female','other','undisclosed');
create type experience_level  as enum ('beginner','intermediate','advanced');
create type fitness_goal      as enum ('lose_fat','gain_muscle','gain_strength','endurance','health','maintenance');
create type unit_system       as enum ('metric','imperial');
create type theme_preference  as enum ('light','dark','system');
create type body_part         as enum ('upper','lower','core','full_body');
create type muscle_role       as enum ('primary','secondary');
create type exercise_mechanic as enum ('compound','isolation');
create type force_type        as enum ('push','pull','static');
create type tracking_type     as enum ('weight_reps','reps_only','duration','distance_duration','weight_duration');
create type plan_source       as enum ('system','user','coach');
create type session_status    as enum ('in_progress','paused','completed','cancelled');
create type set_type          as enum ('warmup','normal','drop','failure','backoff','amrap');
create type record_type       as enum ('max_weight','max_reps','max_volume_set','max_volume_session','estimated_1rm','best_duration','best_distance');
create type goal_type         as enum ('weekly_sessions','body_weight','exercise_1rm','total_volume','body_measurement');
create type goal_status       as enum ('active','achieved','expired','cancelled');
create type photo_pose        as enum ('front','side','back','other');
create type device_platform   as enum ('ios','android');
```

---

## 3. `20260813000300_shared_functions.sql`

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 1RM estimado — fórmula de Epley: 1RM = peso × (1 + reps/30)
create or replace function public.estimate_1rm(p_weight numeric, p_reps int)
returns numeric
language sql
immutable
as $$
  select case
    when p_weight is null or p_reps is null or p_reps < 1 then null
    when p_reps = 1 then p_weight
    else round(p_weight * (1 + p_reps::numeric / 30), 2)
  end;
$$;
```

---

## 4. `20260813000400_profiles.sql`

```sql
create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  full_name             text,
  username              citext unique,
  avatar_path           text,
  birth_date            date,
  gender                gender_type      not null default 'undisclosed',
  height_cm             numeric(5,1),
  experience_level      experience_level not null default 'beginner',
  primary_goal          fitness_goal     not null default 'gain_muscle',
  weekly_session_goal   smallint         not null default 3,
  active_plan_id        uuid,
  onboarding_completed  boolean          not null default false,
  timezone              text             not null default 'America/Sao_Paulo',
  created_at            timestamptz      not null default now(),
  updated_at            timestamptz      not null default now(),

  constraint chk_height   check (height_cm is null or height_cm between 50 and 260),
  constraint chk_weekly   check (weekly_session_goal between 1 and 14),
  constraint chk_username check (username is null or username ~ '^[a-z0-9_]{3,20}$'),
  constraint chk_birth    check (birth_date is null or birth_date < current_date)
);

create table public.user_settings (
  user_id                    uuid primary key references public.profiles(id) on delete cascade,
  unit_system                unit_system      not null default 'metric',
  theme                      theme_preference not null default 'system',
  language                   text             not null default 'pt-BR',
  workout_reminders_enabled  boolean          not null default true,
  reminder_time              time             not null default '18:00',
  reminder_weekdays          smallint[]       not null default '{1,3,5}',
  rest_timer_auto_start      boolean          not null default true,
  rest_timer_sound           boolean          not null default true,
  rest_timer_vibrate         boolean          not null default true,
  default_rest_seconds       smallint         not null default 90,
  keep_screen_on             boolean          not null default true,
  weight_increment_kg        numeric(4,2)     not null default 2.5,
  created_at                 timestamptz      not null default now(),
  updated_at                 timestamptz      not null default now(),

  constraint chk_rest check (default_rest_seconds between 0 and 900)
);

create table public.push_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  token        text not null unique,
  platform     device_platform not null,
  device_name  text,
  last_used_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create trigger trg_profiles_updated      before update on public.profiles      for each row execute function public.set_updated_at();
create trigger trg_user_settings_updated before update on public.user_settings for each row execute function public.set_updated_at();

-- Cria perfil + settings automaticamente ao cadastrar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

## 5. `20260813000500_catalog.sql`

```sql
create table public.muscle_groups (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name_pt       text not null,
  name_en       text not null,
  body_part     body_part not null,
  color_hex     text not null default '#22C55E',
  display_order smallint not null default 0
);

create table public.equipment (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name_pt       text not null,
  name_en       text not null,
  icon          text,
  display_order smallint not null default 0
);

create table public.exercises (
  id                      uuid primary key default gen_random_uuid(),
  name_pt                 text not null,
  name_en                 text,
  slug                    text,
  description             text,
  instructions            text[],
  tips                    text[],
  primary_muscle_group_id uuid not null references public.muscle_groups(id) on delete restrict,
  equipment_id            uuid references public.equipment(id) on delete set null,
  mechanic                exercise_mechanic,
  force_type              force_type,
  difficulty              experience_level not null default 'beginner',
  tracking_type           tracking_type    not null default 'weight_reps',
  is_unilateral           boolean          not null default false,
  thumbnail_path          text,
  media_paths             text[],
  video_url               text,
  created_by              uuid references public.profiles(id) on delete cascade,
  is_public               boolean not null default true,
  search_vector           tsvector generated always as (
    to_tsvector('portuguese',
      coalesce(name_pt,'') || ' ' || coalesce(name_en,'') || ' ' || coalesce(description,''))
  ) stored,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- slug único apenas para o catálogo do sistema
create unique index uq_exercises_system_slug
  on public.exercises (slug) where created_by is null;

create table public.exercise_muscle_groups (
  exercise_id     uuid not null references public.exercises(id) on delete cascade,
  muscle_group_id uuid not null references public.muscle_groups(id) on delete cascade,
  role            muscle_role not null default 'secondary',
  primary key (exercise_id, muscle_group_id)
);

create table public.exercise_favorites (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

create trigger trg_exercises_updated before update on public.exercises
  for each row execute function public.set_updated_at();
```

---

## 6. `20260813000600_plans.sql`

```sql
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
  -- template do sistema não tem dono; plano de usuário tem
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

create unique index uq_workout_days_order
  on public.workout_days (plan_id, order_index);

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
```

---

## 7. `20260813000700_sessions.sql`

```sql
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

create trigger trg_sessions_updated  before update on public.workout_sessions
  for each row execute function public.set_updated_at();
create trigger trg_sexerc_updated    before update on public.session_exercises
  for each row execute function public.set_updated_at();
create trigger trg_sets_updated      before update on public.session_sets
  for each row execute function public.set_updated_at();
```

---

## 8. `20260813000800_progress.sql`

```sql
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
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  goal_type    goal_type not null,
  exercise_id  uuid references public.exercises(id) on delete cascade,
  title        text not null,
  target_value numeric(10,2) not null,
  start_value  numeric(10,2),
  current_value numeric(10,2) not null default 0,
  unit         text not null default 'kg',
  start_date   date not null default current_date,
  target_date  date,
  status       goal_status not null default 'active',
  achieved_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint chk_goal_dates check (target_date is null or target_date >= start_date)
);

create trigger trg_measurements_updated before update on public.body_measurements
  for each row execute function public.set_updated_at();
create trigger trg_goals_updated before update on public.user_goals
  for each row execute function public.set_updated_at();
```

---

## 9. `20260813000900_indexes.sql`

```sql
create index idx_sessions_user_started      on public.workout_sessions (user_id, started_at desc);
create index idx_sessions_active            on public.workout_sessions (user_id) where status in ('in_progress','paused');
create index idx_session_exercises_session  on public.session_exercises (session_id, order_index);
create index idx_session_exercises_exercise on public.session_exercises (exercise_id);
create index idx_session_sets_parent        on public.session_sets (session_exercise_id, set_number);
create index idx_session_sets_completed     on public.session_sets (session_exercise_id) where is_completed = true;

create index idx_exercises_search     on public.exercises using gin (search_vector);
create index idx_exercises_muscle     on public.exercises (primary_muscle_group_id);
create index idx_exercises_equipment  on public.exercises (equipment_id);
create index idx_exercises_created_by on public.exercises (created_by) where created_by is not null;

create index idx_days_plan            on public.workout_days (plan_id, order_index);
create index idx_workout_exercises_day on public.workout_exercises (workout_day_id, order_index);
create index idx_plans_owner          on public.workout_plans (owner_id) where archived_at is null;
create index idx_plans_templates      on public.workout_plans (is_template) where is_template = true;

create index idx_records_user_exercise on public.personal_records (user_id, exercise_id);
create index idx_measurements_user     on public.body_measurements (user_id, measured_on desc);
create index idx_photos_user           on public.progress_photos (user_id, taken_on desc);
create index idx_goals_user_active     on public.user_goals (user_id) where status = 'active';
create index idx_push_tokens_user      on public.push_tokens (user_id);
```

---

## 10. `20260813001000_triggers.sql`

```sql
-- ─────────────────────────────────────────────────────────────
-- Recalcula os totais da sessão sempre que uma série muda
-- ─────────────────────────────────────────────────────────────
create or replace function public.recalc_session_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
begin
  select se.session_id into v_session_id
  from public.session_exercises se
  where se.id = coalesce(new.session_exercise_id, old.session_exercise_id);

  if v_session_id is null then
    return coalesce(new, old);
  end if;

  update public.workout_sessions ws
  set total_volume_kg = coalesce(agg.volume, 0),
      total_sets      = coalesce(agg.sets, 0),
      total_reps      = coalesce(agg.reps, 0)
  from (
    select sum(ss.volume_kg) as volume,
           count(*)          as sets,
           sum(ss.reps)      as reps
    from public.session_sets ss
    join public.session_exercises se on se.id = ss.session_exercise_id
    where se.session_id = v_session_id
      and ss.is_completed = true
      and ss.set_type <> 'warmup'
  ) agg
  where ws.id = v_session_id;

  return coalesce(new, old);
end;
$$;

create trigger trg_recalc_totals
  after insert or update or delete on public.session_sets
  for each row execute function public.recalc_session_totals();

-- ─────────────────────────────────────────────────────────────
-- Detecta e grava recordes pessoais ao concluir uma série
-- ─────────────────────────────────────────────────────────────
create or replace function public.check_personal_records()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id     uuid;
  v_exercise_id uuid;
  v_1rm         numeric;
begin
  if new.is_completed is not true or new.set_type = 'warmup' then
    return new;
  end if;

  select ws.user_id, se.exercise_id
    into v_user_id, v_exercise_id
  from public.session_exercises se
  join public.workout_sessions ws on ws.id = se.session_id
  where se.id = new.session_exercise_id;

  if v_user_id is null then
    return new;
  end if;

  -- PR de carga máxima
  if new.weight_kg is not null and new.weight_kg > 0 then
    insert into public.personal_records
      (user_id, exercise_id, record_type, value, reps, weight_kg, session_set_id, achieved_at)
    values
      (v_user_id, v_exercise_id, 'max_weight', new.weight_kg, new.reps, new.weight_kg, new.id, now())
    on conflict (user_id, exercise_id, record_type) do update
      set previous_value = public.personal_records.value,
          value          = excluded.value,
          reps           = excluded.reps,
          weight_kg      = excluded.weight_kg,
          session_set_id = excluded.session_set_id,
          achieved_at    = excluded.achieved_at
      where excluded.value > public.personal_records.value;
  end if;

  -- PR de volume em uma série
  if new.volume_kg is not null and new.volume_kg > 0 then
    insert into public.personal_records
      (user_id, exercise_id, record_type, value, reps, weight_kg, session_set_id, achieved_at)
    values
      (v_user_id, v_exercise_id, 'max_volume_set', new.volume_kg, new.reps, new.weight_kg, new.id, now())
    on conflict (user_id, exercise_id, record_type) do update
      set previous_value = public.personal_records.value,
          value          = excluded.value,
          reps           = excluded.reps,
          weight_kg      = excluded.weight_kg,
          session_set_id = excluded.session_set_id,
          achieved_at    = excluded.achieved_at
      where excluded.value > public.personal_records.value;
  end if;

  -- PR de 1RM estimado
  v_1rm := public.estimate_1rm(new.weight_kg, new.reps);
  if v_1rm is not null then
    insert into public.personal_records
      (user_id, exercise_id, record_type, value, reps, weight_kg, session_set_id, achieved_at)
    values
      (v_user_id, v_exercise_id, 'estimated_1rm', v_1rm, new.reps, new.weight_kg, new.id, now())
    on conflict (user_id, exercise_id, record_type) do update
      set previous_value = public.personal_records.value,
          value          = excluded.value,
          reps           = excluded.reps,
          weight_kg      = excluded.weight_kg,
          session_set_id = excluded.session_set_id,
          achieved_at    = excluded.achieved_at
      where excluded.value > public.personal_records.value;
  end if;

  -- PR de repetições (exercícios de peso corporal)
  if new.weight_kg is null and new.reps is not null and new.reps > 0 then
    insert into public.personal_records
      (user_id, exercise_id, record_type, value, reps, session_set_id, achieved_at)
    values
      (v_user_id, v_exercise_id, 'max_reps', new.reps, new.reps, new.id, now())
    on conflict (user_id, exercise_id, record_type) do update
      set previous_value = public.personal_records.value,
          value          = excluded.value,
          reps           = excluded.reps,
          session_set_id = excluded.session_set_id,
          achieved_at    = excluded.achieved_at
      where excluded.value > public.personal_records.value;
  end if;

  return new;
end;
$$;

create trigger trg_check_prs
  after insert or update of is_completed, weight_kg, reps on public.session_sets
  for each row execute function public.check_personal_records();
```

---

## 11. `20260813001100_views.sql`

```sql
-- Última performance por exercício (usada no player: "última vez: 60kg × 10")
create or replace view public.v_exercise_last_performance
with (security_invoker = true) as
select distinct on (ws.user_id, se.exercise_id)
  ws.user_id,
  se.exercise_id,
  ss.weight_kg,
  ss.reps,
  ss.volume_kg,
  ws.started_at as performed_at,
  ws.id         as session_id
from public.session_sets ss
join public.session_exercises se on se.id = ss.session_exercise_id
join public.workout_sessions ws  on ws.id = se.session_id
where ss.is_completed = true
  and ws.status = 'completed'
  and ss.set_type <> 'warmup'
order by ws.user_id, se.exercise_id, ws.started_at desc, ss.volume_kg desc;

-- Volume por semana
create or replace view public.v_weekly_volume
with (security_invoker = true) as
select
  user_id,
  date_trunc('week', started_at)::date as week_start,
  count(*)                              as sessions,
  sum(total_volume_kg)                  as volume_kg,
  sum(total_sets)                       as sets,
  sum(coalesce(duration_seconds,0))     as duration_seconds
from public.workout_sessions
where status = 'completed'
group by user_id, date_trunc('week', started_at);

-- Volume por grupo muscular
create or replace view public.v_muscle_group_volume
with (security_invoker = true) as
select
  ws.user_id,
  mg.id   as muscle_group_id,
  mg.slug,
  mg.name_pt,
  date_trunc('week', ws.started_at)::date as week_start,
  sum(ss.volume_kg) as volume_kg,
  count(ss.id)      as sets
from public.session_sets ss
join public.session_exercises se on se.id = ss.session_exercise_id
join public.workout_sessions ws  on ws.id = se.session_id
join public.exercises e          on e.id = se.exercise_id
join public.muscle_groups mg     on mg.id = e.primary_muscle_group_id
where ss.is_completed = true and ws.status = 'completed'
group by ws.user_id, mg.id, mg.slug, mg.name_pt, date_trunc('week', ws.started_at);
```

> `security_invoker = true` faz a view respeitar o RLS do usuário que consulta. **Obrigatório** —
> sem isso a view roda com as permissões do dono e vaza dados entre usuários.

---

## 12. `20260813001200_rpc.sql`

```sql
-- ─────────────────────────────────────────────────────────────
-- Inicia um treino: cria a sessão e já pré-preenche as séries
-- ─────────────────────────────────────────────────────────────
create or replace function public.start_workout_session(
  p_workout_day_id uuid,
  p_client_id      uuid default gen_random_uuid()
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_session_id uuid;
  v_plan_id    uuid;
  v_name       text;
  we           record;
  v_se_id      uuid;
  i            smallint;
begin
  select wd.plan_id, wd.name into v_plan_id, v_name
  from public.workout_days wd
  where wd.id = p_workout_day_id;

  if v_plan_id is null then
    raise exception 'Ficha de treino não encontrada';
  end if;

  insert into public.workout_sessions (client_id, user_id, plan_id, workout_day_id, name)
  values (p_client_id, auth.uid(), v_plan_id, p_workout_day_id, v_name)
  on conflict (client_id) do update set updated_at = now()
  returning id into v_session_id;

  for we in
    select * from public.workout_exercises
    where workout_day_id = p_workout_day_id
    order by order_index
  loop
    insert into public.session_exercises
      (client_id, session_id, exercise_id, workout_exercise_id, order_index)
    values
      (gen_random_uuid(), v_session_id, we.exercise_id, we.id, we.order_index)
    returning id into v_se_id;

    for i in 1..we.target_sets loop
      insert into public.session_sets
        (client_id, session_exercise_id, set_number, weight_kg, reps, duration_seconds, is_completed)
      values
        (gen_random_uuid(), v_se_id, i, we.target_weight_kg, we.target_reps_min,
         we.target_duration_seconds, false);
    end loop;
  end loop;

  return v_session_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Finaliza o treino e devolve o resumo + PRs conquistados
-- ─────────────────────────────────────────────────────────────
create or replace function public.finish_workout_session(
  p_session_id uuid,
  p_effort     smallint default null,
  p_feeling    smallint default null,
  p_notes      text     default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_session public.workout_sessions;
  v_prs     jsonb;
begin
  -- remove séries não concluídas antes de fechar
  delete from public.session_sets ss
  using public.session_exercises se
  where ss.session_exercise_id = se.id
    and se.session_id = p_session_id
    and ss.is_completed = false;

  delete from public.session_exercises se
  where se.session_id = p_session_id
    and not exists (select 1 from public.session_sets ss where ss.session_exercise_id = se.id);

  update public.workout_sessions
  set status           = 'completed',
      finished_at      = now(),
      duration_seconds = extract(epoch from (now() - started_at))::int,
      perceived_effort = coalesce(p_effort, perceived_effort),
      feeling          = coalesce(p_feeling, feeling),
      notes            = coalesce(p_notes, notes)
  where id = p_session_id and user_id = auth.uid()
  returning * into v_session;

  if v_session.id is null then
    raise exception 'Sessão não encontrada';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'exercise_id',   pr.exercise_id,
           'exercise_name', e.name_pt,
           'record_type',   pr.record_type,
           'value',         pr.value,
           'previous',      pr.previous_value
         )), '[]'::jsonb)
    into v_prs
  from public.personal_records pr
  join public.exercises e on e.id = pr.exercise_id
  where pr.user_id = auth.uid()
    and pr.achieved_at >= v_session.started_at;

  return jsonb_build_object(
    'session_id',   v_session.id,
    'duration',     v_session.duration_seconds,
    'total_volume', v_session.total_volume_kg,
    'total_sets',   v_session.total_sets,
    'total_reps',   v_session.total_reps,
    'records',      v_prs
  );
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Copia um template do sistema para a conta do usuário
-- ─────────────────────────────────────────────────────────────
create or replace function public.copy_plan_template(
  p_plan_id  uuid,
  p_new_name text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_new_plan_id uuid;
  d record;
  v_new_day_id  uuid;
begin
  insert into public.workout_plans
    (owner_id, name, description, goal, level, days_per_week, duration_weeks, source, is_template, cover_path)
  select auth.uid(), coalesce(p_new_name, p.name), p.description, p.goal, p.level,
         p.days_per_week, p.duration_weeks, 'user', false, p.cover_path
  from public.workout_plans p
  where p.id = p_plan_id
  returning id into v_new_plan_id;

  if v_new_plan_id is null then
    raise exception 'Rotina não encontrada';
  end if;

  for d in select * from public.workout_days where plan_id = p_plan_id order by order_index loop
    insert into public.workout_days (plan_id, name, label, notes, order_index, estimated_minutes, scheduled_weekday)
    values (v_new_plan_id, d.name, d.label, d.notes, d.order_index, d.estimated_minutes, d.scheduled_weekday)
    returning id into v_new_day_id;

    insert into public.workout_exercises
      (workout_day_id, exercise_id, order_index, target_sets, target_reps_min, target_reps_max,
       target_weight_kg, target_duration_seconds, target_rest_seconds, target_rpe, tempo, superset_group, notes)
    select v_new_day_id, we.exercise_id, we.order_index, we.target_sets, we.target_reps_min, we.target_reps_max,
           we.target_weight_kg, we.target_duration_seconds, we.target_rest_seconds, we.target_rpe,
           we.tempo, we.superset_group, we.notes
    from public.workout_exercises we
    where we.workout_day_id = d.id;
  end loop;

  return v_new_plan_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Resumo do dashboard em uma única chamada
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_dashboard_summary()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid          uuid := auth.uid();
  v_week_start   date := date_trunc('week', now())::date;
  v_sessions_wk  int;
  v_volume_wk    numeric;
  v_goal         smallint;
  v_streak       int := 0;
  v_last         jsonb;
  v_active       jsonb;
begin
  select count(*), coalesce(sum(total_volume_kg),0)
    into v_sessions_wk, v_volume_wk
  from public.workout_sessions
  where user_id = v_uid and status = 'completed' and started_at >= v_week_start;

  select weekly_session_goal into v_goal from public.profiles where id = v_uid;

  -- streak = semanas consecutivas (a partir da semana passada) batendo a meta
  with weeks as (
    select date_trunc('week', started_at)::date as wk, count(*) as n
    from public.workout_sessions
    where user_id = v_uid and status = 'completed'
    group by 1 order by 1 desc
  )
  select count(*) into v_streak
  from (
    select wk, n, row_number() over (order by wk desc) as rn
    from weeks where wk < v_week_start
  ) t
  where n >= v_goal and wk = v_week_start - (rn * interval '1 week');

  select to_jsonb(s) into v_last
  from (
    select id, name, started_at, total_volume_kg, total_sets, duration_seconds
    from public.workout_sessions
    where user_id = v_uid and status = 'completed'
    order by started_at desc limit 1
  ) s;

  select to_jsonb(s) into v_active
  from (
    select id, name, started_at, workout_day_id
    from public.workout_sessions
    where user_id = v_uid and status in ('in_progress','paused')
    order by started_at desc limit 1
  ) s;

  return jsonb_build_object(
    'week_sessions',  v_sessions_wk,
    'week_goal',      v_goal,
    'week_volume_kg', v_volume_wk,
    'streak_weeks',   v_streak,
    'last_session',   v_last,
    'active_session', v_active
  );
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Histórico de um exercício (série temporal para o gráfico)
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_exercise_history(
  p_exercise_id uuid,
  p_limit       int default 30
)
returns table (
  session_id     uuid,
  performed_at   timestamptz,
  best_weight_kg numeric,
  best_volume_kg numeric,
  total_volume   numeric,
  total_sets     bigint,
  estimated_1rm  numeric
)
language sql
security invoker
set search_path = public
as $$
  select ws.id,
         ws.started_at,
         max(ss.weight_kg),
         max(ss.volume_kg),
         sum(ss.volume_kg),
         count(ss.id),
         max(public.estimate_1rm(ss.weight_kg, ss.reps))
  from public.session_sets ss
  join public.session_exercises se on se.id = ss.session_exercise_id
  join public.workout_sessions ws  on ws.id = se.session_id
  where ws.user_id = auth.uid()
    and se.exercise_id = p_exercise_id
    and ws.status = 'completed'
    and ss.is_completed = true
    and ss.set_type <> 'warmup'
  group by ws.id, ws.started_at
  order by ws.started_at desc
  limit p_limit;
$$;

-- ─────────────────────────────────────────────────────────────
-- Exclusão de conta (requisito Apple 5.1.1(v))
-- ─────────────────────────────────────────────────────────────
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Não autenticado';
  end if;
  -- todas as tabelas têm ON DELETE CASCADE a partir de auth.users
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
```

> ⚠️ A remoção dos arquivos do Storage (avatar e fotos de progresso) **não** é feita pelo cascade do
> Postgres. Fazer isso na Edge Function `delete-account`, que apaga os objetos e depois chama esta RPC.

---

## 13. `20260813001300_rls.sql`

Políticas de Row Level Security — SQL completo em [`04-seguranca-rls-e-auth.md`](./04-seguranca-rls-e-auth.md#3-políticas-rls-sql-completo).

## 14. `20260813001400_storage.sql`

Buckets e políticas de Storage — SQL completo em [`04-seguranca-rls-e-auth.md`](./04-seguranca-rls-e-auth.md#4-storage).

---

## 15. Seed — catálogo e templates ✅ **pronto**

Os arquivos de seed já estão escritos e versionados no projeto:

| Arquivo | Conteúdo |
|---|---|
| `supabase/seed.sql` | Orquestrador — inclui os três arquivos abaixo e valida as contagens ao final |
| `supabase/seed/01_catalog.sql` | 14 grupos musculares + 12 equipamentos |
| `supabase/seed/02_exercises.sql` | **138 exercícios** do sistema com instruções de execução + músculos secundários dos compostos |
| `supabase/seed/03_templates.sql` | **5 rotinas prontas** com fichas e exercícios prescritos |

Executado automaticamente por `supabase db reset`. Para aplicar em ambiente remoto:

```bash
psql "$DATABASE_URL" -f supabase/seed.sql
```

### Distribuição do catálogo de exercícios

| Grupo muscular | Qtd | Grupo muscular | Qtd |
|---|---|---|---|
| Peito | 16 | Posterior de coxa | 7 |
| Costas | 17 | Glúteos | 6 |
| Ombros | 14 | Panturrilha | 5 |
| Bíceps | 10 | Abdômen | 14 |
| Tríceps | 10 | Lombar | 4 |
| Antebraço | 4 | Corpo inteiro | 13 |
| Trapézio | 4 | Quadríceps | 14 |
| | | **Total** | **138** |

Cobertura por `tracking_type`: `weight_reps` (maioria), `reps_only` (peso corporal),
`duration` (pranchas, corda), `distance_duration` (esteira, bike, remo),
`weight_duration` (farmer's walk). 18 exercícios marcados como unilaterais.

> **Mídia:** o seed grava `thumbnail_path` e `media_paths` como `NULL`. A UI cai para um ícone do
> grupo muscular quando não há imagem — ou seja, **o app funciona sem nenhuma mídia**. As imagens
> podem ser adicionadas depois por um `UPDATE` simples, sem tocar em migration.
> Ver [decisão D3](./11-decisoes-e-pendencias.md#d3--mídia-dos-exercícios).

### Templates de treino do sistema

| Template | Nível | Dias | Fichas |
|---|---|---|---|
| Full Body Iniciante | Iniciante | 3 | A / B / C — corpo inteiro, 6 exercícios cada |
| ABC Clássico | Intermediário | 3 | A: Peito+Ombro+Tríceps · B: Costas+Bíceps · C: Pernas |
| Push Pull Legs | Intermediário | 6 | Push / Pull / Legs, repetidos 2× na semana |
| Upper Lower | Intermediário | 4 | Superior A / Inferior A / Superior B / Inferior B |
| ABCDE | Avançado | 5 | A: Peito · B: Costas · C: Pernas · D: Ombros · E: Braços (com bi-sets) |

Todos com `owner_id = NULL`, `is_template = true` e `source = 'system'`. O aluno usa via
`copy_plan_template()`, que gera uma cópia própria e editável.

---

## 16. Checklist de validação do banco

Rodar antes de considerar a Fase 1 concluída:

- [ ] `supabase db reset` executa sem erro do zero
- [ ] `npm run types:gen` gera tipos sem erro de TS
- [ ] Todas as 19 tabelas têm `ENABLE ROW LEVEL SECURITY`
- [ ] Nenhuma tabela tem policy `USING (true)` para `authenticated` em dados de usuário
- [ ] Cadastrar usuário via Auth cria `profiles` + `user_settings`
- [ ] Usuário A não consegue ler/alterar dado do usuário B (teste manual com 2 contas)
- [ ] `start_workout_session` cria sessão com todas as séries pré-preenchidas
- [ ] Marcar série com carga recorde gera linha em `personal_records`
- [ ] `finish_workout_session` retorna volume e PRs corretos
- [ ] `total_volume_kg` da sessão bate com a soma manual das séries
- [ ] Views retornam apenas dados do usuário logado (teste com 2 contas)
- [ ] `delete_my_account()` apaga tudo em cascata

---

[← Modelo de Dados](./02-modelo-de-dados.md) · [Índice](./README.md) · [Próximo: Segurança e RLS →](./04-seguranca-rls-e-auth.md)
