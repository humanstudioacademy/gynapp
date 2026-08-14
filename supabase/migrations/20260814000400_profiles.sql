-- Perfil, preferências e tokens de push
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
