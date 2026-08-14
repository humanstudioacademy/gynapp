-- ═══════════════════════════════════════════════════════════════════════
-- SEED 01 — Catálogo base: grupos musculares e equipamentos
-- Idempotente: pode rodar várias vezes sem duplicar.
-- ═══════════════════════════════════════════════════════════════════════

-- ── Grupos musculares (14) ─────────────────────────────────────────────
insert into public.muscle_groups (slug, name_pt, name_en, body_part, color_hex, display_order) values
  ('chest',      'Peito',             'Chest',       'upper',     '#EF4444', 1),
  ('back',       'Costas',            'Back',        'upper',     '#3B82F6', 2),
  ('shoulders',  'Ombros',            'Shoulders',   'upper',     '#F59E0B', 3),
  ('biceps',     'Bíceps',            'Biceps',      'upper',     '#8B5CF6', 4),
  ('triceps',    'Tríceps',           'Triceps',     'upper',     '#EC4899', 5),
  ('forearms',   'Antebraço',         'Forearms',    'upper',     '#14B8A6', 6),
  ('trapezius',  'Trapézio',          'Trapezius',   'upper',     '#6366F1', 7),
  ('quadriceps', 'Quadríceps',        'Quadriceps',  'lower',     '#22C55E', 8),
  ('hamstrings', 'Posterior de coxa', 'Hamstrings',  'lower',     '#10B981', 9),
  ('glutes',     'Glúteos',           'Glutes',      'lower',     '#F97316', 10),
  ('calves',     'Panturrilha',       'Calves',      'lower',     '#84CC16', 11),
  ('abs',        'Abdômen',           'Abs',         'core',      '#06B6D4', 12),
  ('lower_back', 'Lombar',            'Lower back',  'core',      '#0EA5E9', 13),
  ('full_body',  'Corpo inteiro',     'Full body',   'full_body', '#64748B', 14)
on conflict (slug) do update set
  name_pt       = excluded.name_pt,
  name_en       = excluded.name_en,
  body_part     = excluded.body_part,
  color_hex     = excluded.color_hex,
  display_order = excluded.display_order;

-- ── Equipamentos (12) ──────────────────────────────────────────────────
insert into public.equipment (slug, name_pt, name_en, icon, display_order) values
  ('barbell',    'Barra',          'Barbell',         'dumbbell',        1),
  ('dumbbell',   'Halter',         'Dumbbell',        'dumbbell',        2),
  ('machine',    'Máquina',        'Machine',         'cog',             3),
  ('cable',      'Cabo / Polia',   'Cable',           'git-merge',       4),
  ('bodyweight', 'Peso corporal',  'Bodyweight',      'user',            5),
  ('kettlebell', 'Kettlebell',     'Kettlebell',      'circle',          6),
  ('band',       'Elástico',       'Resistance band', 'minus',           7),
  ('smith',      'Smith',          'Smith machine',   'columns',         8),
  ('plate',      'Anilha',         'Weight plate',    'disc',            9),
  ('bench',      'Banco',          'Bench',           'rows',            10),
  ('pullup_bar', 'Barra fixa',     'Pull-up bar',     'minus',           11),
  ('other',      'Outro',          'Other',           'more-horizontal', 12)
on conflict (slug) do update set
  name_pt       = excluded.name_pt,
  name_en       = excluded.name_en,
  icon          = excluded.icon,
  display_order = excluded.display_order;
