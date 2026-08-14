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
      set previous_value = personal_records.value,
          value          = excluded.value,
          reps           = excluded.reps,
          weight_kg      = excluded.weight_kg,
          session_set_id = excluded.session_set_id,
          achieved_at    = excluded.achieved_at
      where excluded.value > personal_records.value;
  end if;

  -- PR de volume em uma série
  if new.volume_kg is not null and new.volume_kg > 0 then
    insert into public.personal_records
      (user_id, exercise_id, record_type, value, reps, weight_kg, session_set_id, achieved_at)
    values
      (v_user_id, v_exercise_id, 'max_volume_set', new.volume_kg, new.reps, new.weight_kg, new.id, now())
    on conflict (user_id, exercise_id, record_type) do update
      set previous_value = personal_records.value,
          value          = excluded.value,
          reps           = excluded.reps,
          weight_kg      = excluded.weight_kg,
          session_set_id = excluded.session_set_id,
          achieved_at    = excluded.achieved_at
      where excluded.value > personal_records.value;
  end if;

  -- PR de 1RM estimado
  v_1rm := public.estimate_1rm(new.weight_kg, new.reps);
  if v_1rm is not null then
    insert into public.personal_records
      (user_id, exercise_id, record_type, value, reps, weight_kg, session_set_id, achieved_at)
    values
      (v_user_id, v_exercise_id, 'estimated_1rm', v_1rm, new.reps, new.weight_kg, new.id, now())
    on conflict (user_id, exercise_id, record_type) do update
      set previous_value = personal_records.value,
          value          = excluded.value,
          reps           = excluded.reps,
          weight_kg      = excluded.weight_kg,
          session_set_id = excluded.session_set_id,
          achieved_at    = excluded.achieved_at
      where excluded.value > personal_records.value;
  end if;

  -- PR de repetições (exercícios sem carga, tipo peso corporal)
  if new.weight_kg is null and new.reps is not null and new.reps > 0 then
    insert into public.personal_records
      (user_id, exercise_id, record_type, value, reps, session_set_id, achieved_at)
    values
      (v_user_id, v_exercise_id, 'max_reps', new.reps, new.reps, new.id, now())
    on conflict (user_id, exercise_id, record_type) do update
      set previous_value = personal_records.value,
          value          = excluded.value,
          reps           = excluded.reps,
          session_set_id = excluded.session_set_id,
          achieved_at    = excluded.achieved_at
      where excluded.value > personal_records.value;
  end if;

  -- PR de tempo (prancha, isometria)
  if new.duration_seconds is not null and new.duration_seconds > 0 then
    insert into public.personal_records
      (user_id, exercise_id, record_type, value, session_set_id, achieved_at)
    values
      (v_user_id, v_exercise_id, 'best_duration', new.duration_seconds, new.id, now())
    on conflict (user_id, exercise_id, record_type) do update
      set previous_value = personal_records.value,
          value          = excluded.value,
          session_set_id = excluded.session_set_id,
          achieved_at    = excluded.achieved_at
      where excluded.value > personal_records.value;
  end if;

  return new;
end;
$$;

create trigger trg_check_prs
  after insert or update of is_completed, weight_kg, reps, duration_seconds on public.session_sets
  for each row execute function public.check_personal_records();
