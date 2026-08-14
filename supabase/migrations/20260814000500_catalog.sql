-- Catálogo: grupos musculares, equipamentos e exercícios
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
