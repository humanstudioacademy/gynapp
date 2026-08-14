-- Duração do treino descontando o tempo pausado.
--
-- O player tem pausa (doc 08, Fase 4), mas `finish_workout_session` calculava
-- `now() - started_at` — relógio de parede. Quem pausasse 20 minutos no meio do
-- treino veria esses 20 minutos somados à duração, e o número entraria no
-- histórico e nas médias errado.
--
-- `paused_seconds` acumula o tempo parado; o finish subtrai. Nada mais da função
-- muda: mesmo contrato de retorno e mesmo filtro de recordes.

alter table public.workout_sessions
  add column if not exists paused_seconds integer not null default 0;

alter table public.workout_sessions
  drop constraint if exists chk_paused_seconds;

alter table public.workout_sessions
  add constraint chk_paused_seconds check (paused_seconds >= 0);

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
      -- ÚNICA mudança em relação à versão original: desconta o tempo pausado.
      duration_seconds = greatest(
        0,
        extract(epoch from (now() - started_at))::int - coalesce(paused_seconds, 0)
      ),
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
