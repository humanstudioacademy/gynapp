-- ─────────────────────────────────────────────────────────────
-- Inicia um treino: cria a sessão e pré-preenche as séries
-- Idempotente por client_id (seguro para retry offline).
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
  v_existing   int;
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

  -- se a sessão já foi montada antes (retry), não duplica os exercícios
  select count(*) into v_existing
  from public.session_exercises where session_id = v_session_id;
  if v_existing > 0 then
    return v_session_id;
  end if;

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
-- Inicia um treino livre (sem ficha)
-- ─────────────────────────────────────────────────────────────
create or replace function public.start_free_session(
  p_name      text default 'Treino livre',
  p_client_id uuid default gen_random_uuid()
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_session_id uuid;
begin
  insert into public.workout_sessions (client_id, user_id, name)
  values (p_client_id, auth.uid(), coalesce(nullif(p_name,''), 'Treino livre'))
  on conflict (client_id) do update set updated_at = now()
  returning id into v_session_id;

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
  v_started timestamptz;
  v_prs     jsonb;
begin
  select started_at into v_started
  from public.workout_sessions
  where id = p_session_id and user_id = auth.uid();

  if v_started is null then
    raise exception 'Sessão não encontrada';
  end if;

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

  select coalesce(jsonb_agg(jsonb_build_object(
           'exercise_id',   pr.exercise_id,
           'exercise_name', e.name_pt,
           'record_type',   pr.record_type,
           'value',         pr.value,
           'previous',      pr.previous_value
         ) order by pr.achieved_at), '[]'::jsonb)
    into v_prs
  from public.personal_records pr
  join public.exercises e on e.id = pr.exercise_id
  where pr.user_id = auth.uid()
    and pr.achieved_at >= v_started;

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
  select auth.uid(), coalesce(nullif(p_new_name,''), p.name), p.description, p.goal, p.level,
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
  v_next         jsonb;
begin
  select count(*), coalesce(sum(total_volume_kg),0)
    into v_sessions_wk, v_volume_wk
  from public.workout_sessions
  where user_id = v_uid and status = 'completed' and started_at >= v_week_start;

  select weekly_session_goal into v_goal from public.profiles where id = v_uid;
  v_goal := coalesce(v_goal, 3);

  -- streak = semanas consecutivas (antes da atual) batendo a meta
  with weeks as (
    select date_trunc('week', started_at)::date as wk, count(*) as n
    from public.workout_sessions
    where user_id = v_uid and status = 'completed'
    group by 1
  ), ranked as (
    select wk, n, row_number() over (order by wk desc) as rn
    from weeks where wk < v_week_start
  )
  select count(*) into v_streak
  from ranked
  where n >= v_goal and wk = v_week_start - (rn * interval '7 days');

  select to_jsonb(s) into v_last from (
    select id, name, started_at, total_volume_kg, total_sets, duration_seconds
    from public.workout_sessions
    where user_id = v_uid and status = 'completed'
    order by started_at desc limit 1
  ) s;

  select to_jsonb(s) into v_active from (
    select id, name, started_at, workout_day_id
    from public.workout_sessions
    where user_id = v_uid and status in ('in_progress','paused')
    order by started_at desc limit 1
  ) s;

  -- próximo treino: ficha do plano ativo há mais tempo sem ser executada
  select to_jsonb(s) into v_next from (
    select wd.id, wd.name, wd.label, wd.estimated_minutes, wd.plan_id,
           (select count(*) from public.workout_exercises we where we.workout_day_id = wd.id) as exercise_count,
           last_done.performed_at
    from public.profiles p
    join public.workout_days wd on wd.plan_id = p.active_plan_id
    left join lateral (
      select max(ws.started_at) as performed_at
      from public.workout_sessions ws
      where ws.workout_day_id = wd.id and ws.user_id = v_uid and ws.status = 'completed'
    ) last_done on true
    where p.id = v_uid
    order by last_done.performed_at asc nulls first, wd.order_index asc
    limit 1
  ) s;

  return jsonb_build_object(
    'week_sessions',  v_sessions_wk,
    'week_goal',      v_goal,
    'week_volume_kg', v_volume_wk,
    'streak_weeks',   v_streak,
    'last_session',   v_last,
    'active_session', v_active,
    'next_workout',   v_next
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
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
