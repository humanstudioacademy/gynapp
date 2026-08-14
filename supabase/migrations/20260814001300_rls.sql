-- ═══════════════════════════════════════════════════════════
-- Funções auxiliares (SECURITY DEFINER evita recursão de RLS
-- e melhora a performance das políticas aninhadas)
-- ═══════════════════════════════════════════════════════════
create or replace function public.owns_plan(p_plan_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workout_plans p
    where p.id = p_plan_id and p.owner_id = (select auth.uid())
  );
$$;

create or replace function public.owns_day(p_day_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workout_days d
    join public.workout_plans p on p.id = d.plan_id
    where d.id = p_day_id and p.owner_id = (select auth.uid())
  );
$$;

create or replace function public.owns_session(p_session_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workout_sessions s
    where s.id = p_session_id and s.user_id = (select auth.uid())
  );
$$;

create or replace function public.owns_session_exercise(p_se_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.session_exercises se
    join public.workout_sessions s on s.id = se.session_id
    where se.id = p_se_id and s.user_id = (select auth.uid())
  );
$$;

create or replace function public.can_read_exercise(p_exercise_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.exercises e
    where e.id = p_exercise_id
      and (e.is_public = true or e.created_by = (select auth.uid()))
  );
$$;

create or replace function public.is_template_day(p_day_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workout_days d
    join public.workout_plans p on p.id = d.plan_id
    where d.id = p_day_id and p.is_template = true
  );
$$;

-- ═══════════════════════════════════════════════════════════
-- Habilita RLS em TODAS as tabelas
-- ═══════════════════════════════════════════════════════════
alter table public.profiles               enable row level security;
alter table public.user_settings          enable row level security;
alter table public.push_tokens            enable row level security;
alter table public.muscle_groups          enable row level security;
alter table public.equipment              enable row level security;
alter table public.exercises              enable row level security;
alter table public.exercise_muscle_groups enable row level security;
alter table public.exercise_favorites     enable row level security;
alter table public.workout_plans          enable row level security;
alter table public.workout_days           enable row level security;
alter table public.workout_exercises      enable row level security;
alter table public.workout_sessions       enable row level security;
alter table public.session_exercises      enable row level security;
alter table public.session_sets           enable row level security;
alter table public.personal_records       enable row level security;
alter table public.body_measurements      enable row level security;
alter table public.progress_photos        enable row level security;
alter table public.user_goals             enable row level security;

-- ═══════════════════════════════════════════════════════════
-- PERFIL
-- ═══════════════════════════════════════════════════════════
create policy "profile_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy "profile_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "settings_all_own" on public.user_settings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "push_tokens_all_own" on public.push_tokens
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════
-- CATÁLOGO
-- ═══════════════════════════════════════════════════════════
create policy "muscle_groups_read" on public.muscle_groups
  for select to authenticated using (true);

create policy "equipment_read" on public.equipment
  for select to authenticated using (true);

create policy "exercises_select" on public.exercises
  for select to authenticated
  using (is_public = true or created_by = (select auth.uid()));

create policy "exercises_insert_own" on public.exercises
  for insert to authenticated
  with check (created_by = (select auth.uid()) and is_public = false);

create policy "exercises_update_own" on public.exercises
  for update to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

create policy "exercises_delete_own" on public.exercises
  for delete to authenticated
  using (created_by = (select auth.uid()));

create policy "emg_select" on public.exercise_muscle_groups
  for select to authenticated using (public.can_read_exercise(exercise_id));

create policy "emg_write_own_exercise" on public.exercise_muscle_groups
  for all to authenticated
  using (exists (select 1 from public.exercises e
                 where e.id = exercise_id and e.created_by = (select auth.uid())))
  with check (exists (select 1 from public.exercises e
                      where e.id = exercise_id and e.created_by = (select auth.uid())));

create policy "favorites_all_own" on public.exercise_favorites
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════
-- PLANEJAMENTO
-- ═══════════════════════════════════════════════════════════
create policy "plans_select" on public.workout_plans
  for select to authenticated
  using (owner_id = (select auth.uid()) or is_template = true);

create policy "plans_insert_own" on public.workout_plans
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and is_template = false);

create policy "plans_update_own" on public.workout_plans
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "plans_delete_own" on public.workout_plans
  for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "days_select" on public.workout_days
  for select to authenticated
  using (public.owns_plan(plan_id) or public.is_template_day(id));

create policy "days_write_own" on public.workout_days
  for all to authenticated
  using (public.owns_plan(plan_id))
  with check (public.owns_plan(plan_id));

create policy "wexercises_select" on public.workout_exercises
  for select to authenticated
  using (public.owns_day(workout_day_id) or public.is_template_day(workout_day_id));

create policy "wexercises_write_own" on public.workout_exercises
  for all to authenticated
  using (public.owns_day(workout_day_id))
  with check (public.owns_day(workout_day_id));

-- ═══════════════════════════════════════════════════════════
-- EXECUÇÃO
-- ═══════════════════════════════════════════════════════════
create policy "sessions_all_own" on public.workout_sessions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "session_exercises_all_own" on public.session_exercises
  for all to authenticated
  using (public.owns_session(session_id))
  with check (public.owns_session(session_id));

create policy "session_sets_all_own" on public.session_sets
  for all to authenticated
  using (public.owns_session_exercise(session_exercise_id))
  with check (public.owns_session_exercise(session_exercise_id));

-- ═══════════════════════════════════════════════════════════
-- PROGRESSO
-- ═══════════════════════════════════════════════════════════
create policy "records_select_own" on public.personal_records
  for select to authenticated using (user_id = (select auth.uid()));

create policy "records_delete_own" on public.personal_records
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "measurements_all_own" on public.body_measurements
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "photos_all_own" on public.progress_photos
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "goals_all_own" on public.user_goals
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════
-- Bloqueia o papel anônimo
-- ═══════════════════════════════════════════════════════════
revoke all on all tables in schema public from anon;
