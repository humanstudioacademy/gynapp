-- Views (security_invoker garante que o RLS do usuário é respeitado)

-- Última performance por exercício ("última vez: 60kg × 10")
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
