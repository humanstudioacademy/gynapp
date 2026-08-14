-- Índices de performance
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

create index idx_days_plan             on public.workout_days (plan_id, order_index);
create index idx_workout_exercises_day on public.workout_exercises (workout_day_id, order_index);
create index idx_plans_owner           on public.workout_plans (owner_id) where archived_at is null;
create index idx_plans_templates       on public.workout_plans (is_template) where is_template = true;

create index idx_records_user_exercise on public.personal_records (user_id, exercise_id);
create index idx_measurements_user     on public.body_measurements (user_id, measured_on desc);
create index idx_photos_user           on public.progress_photos (user_id, taken_on desc);
create index idx_goals_user_active     on public.user_goals (user_id) where status = 'active';
create index idx_push_tokens_user      on public.push_tokens (user_id);
