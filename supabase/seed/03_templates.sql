-- ═══════════════════════════════════════════════════════════════════════
-- SEED 03 — Templates de treino do sistema (5 rotinas prontas)
--
-- owner_id = NULL · is_template = true · source = 'system'
-- O aluno usa via copy_plan_template(), que gera uma cópia editável.
--
-- 1. Full Body Iniciante  — 3 dias · iniciante
-- 2. ABC Clássico         — 3 dias · intermediário
-- 3. Push Pull Legs       — 6 dias · intermediário
-- 4. Upper Lower          — 4 dias · intermediário
-- 5. ABCDE                — 5 dias · avançado
-- ═══════════════════════════════════════════════════════════════════════

-- Helper temporário: insere um exercício prescrito buscando pelo slug.
create or replace function public.seed_we(
  p_day        uuid,
  p_slug       text,
  p_order      int,
  p_sets       int,
  p_reps_min   int,
  p_reps_max   int,
  p_rest       int,
  p_superset   int  default null,
  p_notes      text default null
) returns void
language plpgsql
as $$
declare
  v_ex uuid;
begin
  select id into v_ex
  from public.exercises
  where slug = p_slug and created_by is null;

  if v_ex is null then
    raise warning 'seed_we: exercício não encontrado -> %', p_slug;
    return;
  end if;

  insert into public.workout_exercises
    (workout_day_id, exercise_id, order_index, target_sets,
     target_reps_min, target_reps_max, target_rest_seconds, superset_group, notes)
  values
    (p_day, v_ex, p_order::smallint, p_sets::smallint,
     p_reps_min::smallint, p_reps_max::smallint, p_rest::smallint,
     p_superset::smallint, p_notes);
end;
$$;


do $seed$
declare
  v_plan uuid;
  v_day  uuid;
begin

-- ═══════════════════════════════════════════════════════════════════════
-- 1. FULL BODY INICIANTE — 3 dias
-- ═══════════════════════════════════════════════════════════════════════
if not exists (select 1 from public.workout_plans where name = 'Full Body Iniciante' and is_template) then

  insert into public.workout_plans
    (owner_id, name, description, goal, level, days_per_week, duration_weeks, source, is_template)
  values
    (null, 'Full Body Iniciante',
     'Três treinos de corpo inteiro por semana. Ideal para quem está começando: poucos exercícios, movimentos seguros e frequência alta em cada grupo muscular.',
     'gain_muscle', 'beginner', 3, 8, 'system', true)
  returning id into v_plan;

  -- Treino A
  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes, notes)
  values (v_plan, 'Treino A — Corpo Inteiro', 'A', 0, 50,
          'Foque na técnica antes de aumentar a carga.')
  returning id into v_day;
  perform public.seed_we(v_day, 'agachamento-goblet',      0, 3,  8, 12, 90);
  perform public.seed_we(v_day, 'supino-reto-halteres',    1, 3,  8, 12, 90);
  perform public.seed_we(v_day, 'remada-baixa-polia',      2, 3, 10, 12, 90);
  perform public.seed_we(v_day, 'desenvolvimento-halteres',3, 3, 10, 12, 60);
  perform public.seed_we(v_day, 'mesa-flexora',            4, 3, 10, 15, 60);
  perform public.seed_we(v_day, 'prancha',                 5, 3,  1,  1, 60, null, 'Sustentar 30 a 45 segundos.');

  -- Treino B
  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'Treino B — Corpo Inteiro', 'B', 1, 50)
  returning id into v_day;
  perform public.seed_we(v_day, 'leg-press-45',              0, 3, 10, 15, 90);
  perform public.seed_we(v_day, 'supino-inclinado-halteres', 1, 3, 10, 12, 90);
  perform public.seed_we(v_day, 'puxada-frontal',            2, 3, 10, 12, 90);
  perform public.seed_we(v_day, 'elevacao-lateral-halteres', 3, 3, 12, 15, 60);
  perform public.seed_we(v_day, 'cadeira-extensora',         4, 3, 12, 15, 60);
  perform public.seed_we(v_day, 'abdominal-supra',           5, 3, 15, 20, 45);

  -- Treino C
  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'Treino C — Corpo Inteiro', 'C', 2, 50)
  returning id into v_day;
  perform public.seed_we(v_day, 'agachamento-smith',       0, 3, 10, 12, 90);
  perform public.seed_we(v_day, 'supino-maquina',          1, 3, 10, 12, 90);
  perform public.seed_we(v_day, 'remada-maquina',          2, 3, 10, 12, 90);
  perform public.seed_we(v_day, 'desenvolvimento-maquina', 3, 3, 10, 12, 60);
  perform public.seed_we(v_day, 'panturrilha-em-pe',       4, 3, 12, 20, 45);
  perform public.seed_we(v_day, 'prancha',                 5, 3,  1,  1, 60, null, 'Sustentar 30 a 45 segundos.');
end if;


-- ═══════════════════════════════════════════════════════════════════════
-- 2. ABC CLÁSSICO — 3 dias
-- ═══════════════════════════════════════════════════════════════════════
if not exists (select 1 from public.workout_plans where name = 'ABC Clássico' and is_template) then

  insert into public.workout_plans
    (owner_id, name, description, goal, level, days_per_week, duration_weeks, source, is_template)
  values
    (null, 'ABC Clássico',
     'A divisão mais tradicional da academia: empurrar, puxar e pernas. Volume equilibrado e fácil de encaixar em três dias por semana.',
     'gain_muscle', 'intermediate', 3, 12, 'system', true)
  returning id into v_plan;

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'Treino A — Peito, Ombros e Tríceps', 'A', 0, 65)
  returning id into v_day;
  perform public.seed_we(v_day, 'supino-reto-barra',         0, 4,  6, 10, 120);
  perform public.seed_we(v_day, 'supino-inclinado-halteres', 1, 3,  8, 12,  90);
  perform public.seed_we(v_day, 'crossover-polia',           2, 3, 12, 15,  60);
  perform public.seed_we(v_day, 'desenvolvimento-halteres',  3, 3,  8, 12,  90);
  perform public.seed_we(v_day, 'elevacao-lateral-halteres', 4, 4, 12, 15,  45);
  perform public.seed_we(v_day, 'triceps-testa-barra-w',     5, 3, 10, 12,  60);
  perform public.seed_we(v_day, 'triceps-polia-corda',       6, 3, 12, 15,  45);

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'Treino B — Costas e Bíceps', 'B', 1, 60)
  returning id into v_day;
  perform public.seed_we(v_day, 'barra-fixa',           0, 4,  6, 10, 120, null, 'Use assistência se necessário.');
  perform public.seed_we(v_day, 'remada-curvada-barra', 1, 4,  8, 10, 120);
  perform public.seed_we(v_day, 'puxada-frontal',       2, 3, 10, 12,  90);
  perform public.seed_we(v_day, 'remada-baixa-polia',   3, 3, 10, 12,  90);
  perform public.seed_we(v_day, 'rosca-direta-barra',   4, 3,  8, 12,  60);
  perform public.seed_we(v_day, 'rosca-scott',          5, 3, 10, 12,  60);
  perform public.seed_we(v_day, 'rosca-martelo',        6, 3, 10, 12,  45);

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'Treino C — Pernas', 'C', 2, 70)
  returning id into v_day;
  perform public.seed_we(v_day, 'agachamento-livre',   0, 4,  6, 10, 150);
  perform public.seed_we(v_day, 'leg-press-45',        1, 4, 10, 12, 120);
  perform public.seed_we(v_day, 'cadeira-extensora',   2, 3, 12, 15,  60);
  perform public.seed_we(v_day, 'mesa-flexora',        3, 4, 10, 12,  60);
  perform public.seed_we(v_day, 'elevacao-pelvica',    4, 3, 10, 12,  90);
  perform public.seed_we(v_day, 'panturrilha-em-pe',   5, 4, 12, 20,  45);
end if;


-- ═══════════════════════════════════════════════════════════════════════
-- 3. PUSH PULL LEGS — 6 dias (3 fichas repetidas 2x por semana)
-- ═══════════════════════════════════════════════════════════════════════
if not exists (select 1 from public.workout_plans where name = 'Push Pull Legs' and is_template) then

  insert into public.workout_plans
    (owner_id, name, description, goal, level, days_per_week, duration_weeks, source, is_template)
  values
    (null, 'Push Pull Legs',
     'Empurrar, puxar e pernas, repetindo o ciclo duas vezes na semana. Alta frequência e volume — exige boa recuperação.',
     'gain_muscle', 'intermediate', 6, 12, 'system', true)
  returning id into v_plan;

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'Push — Peito, Ombros e Tríceps', 'Push', 0, 65)
  returning id into v_day;
  perform public.seed_we(v_day, 'supino-reto-barra',            0, 4, 6, 10, 120);
  perform public.seed_we(v_day, 'desenvolvimento-militar-barra',1, 4, 6, 10, 120);
  perform public.seed_we(v_day, 'supino-inclinado-halteres',    2, 3, 8, 12,  90);
  perform public.seed_we(v_day, 'elevacao-lateral-halteres',    3, 4,12, 15,  45);
  perform public.seed_we(v_day, 'triceps-polia-corda',          4, 3,10, 15,  60);
  perform public.seed_we(v_day, 'triceps-frances',              5, 3,10, 12,  60);

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'Pull — Costas e Bíceps', 'Pull', 1, 65)
  returning id into v_day;
  perform public.seed_we(v_day, 'levantamento-terra',   0, 4, 5,  8, 180);
  perform public.seed_we(v_day, 'barra-fixa',           1, 4, 6, 10, 120);
  perform public.seed_we(v_day, 'remada-curvada-barra', 2, 4, 8, 10, 120);
  perform public.seed_we(v_day, 'face-pull',            3, 3,12, 15,  60);
  perform public.seed_we(v_day, 'rosca-direta-barra',   4, 3, 8, 12,  60);
  perform public.seed_we(v_day, 'rosca-martelo',        5, 3,10, 12,  45);

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'Legs — Pernas', 'Legs', 2, 70)
  returning id into v_day;
  perform public.seed_we(v_day, 'agachamento-livre', 0, 4, 6, 10, 150);
  perform public.seed_we(v_day, 'terra-romeno',      1, 4, 8, 10, 120);
  perform public.seed_we(v_day, 'leg-press-45',      2, 3,10, 12, 120);
  perform public.seed_we(v_day, 'mesa-flexora',      3, 3,10, 12,  60);
  perform public.seed_we(v_day, 'cadeira-extensora', 4, 3,12, 15,  60);
  perform public.seed_we(v_day, 'panturrilha-em-pe', 5, 4,12, 20,  45);
end if;


-- ═══════════════════════════════════════════════════════════════════════
-- 4. UPPER LOWER — 4 dias
-- ═══════════════════════════════════════════════════════════════════════
if not exists (select 1 from public.workout_plans where name = 'Upper Lower' and is_template) then

  insert into public.workout_plans
    (owner_id, name, description, goal, level, days_per_week, duration_weeks, source, is_template)
  values
    (null, 'Upper Lower',
     'Alterna superior e inferior em quatro dias. Bom equilíbrio entre frequência e recuperação — a divisão mais versátil para quem treina 4x por semana.',
     'gain_strength', 'intermediate', 4, 12, 'system', true)
  returning id into v_plan;

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'Superior A', 'Sup A', 0, 60)
  returning id into v_day;
  perform public.seed_we(v_day, 'supino-reto-barra',       0, 4, 6, 8, 150);
  perform public.seed_we(v_day, 'remada-curvada-barra',    1, 4, 6, 8, 150);
  perform public.seed_we(v_day, 'desenvolvimento-halteres',2, 3, 8,12,  90);
  perform public.seed_we(v_day, 'puxada-frontal',          3, 3,10,12,  90);
  perform public.seed_we(v_day, 'rosca-direta-barra',      4, 3,10,12,  60);
  perform public.seed_we(v_day, 'triceps-polia-corda',     5, 3,10,15,  60);

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'Inferior A', 'Inf A', 1, 55)
  returning id into v_day;
  perform public.seed_we(v_day, 'agachamento-livre', 0, 4, 5,  8, 180);
  perform public.seed_we(v_day, 'terra-romeno',      1, 3, 8, 10, 120);
  perform public.seed_we(v_day, 'cadeira-extensora', 2, 3,12, 15,  60);
  perform public.seed_we(v_day, 'mesa-flexora',      3, 3,10, 12,  60);
  perform public.seed_we(v_day, 'panturrilha-em-pe', 4, 4,12, 20,  45);

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'Superior B', 'Sup B', 2, 60)
  returning id into v_day;
  perform public.seed_we(v_day, 'supino-inclinado-halteres', 0, 4, 8, 12,  90);
  perform public.seed_we(v_day, 'barra-fixa',                1, 4, 6, 10, 120);
  perform public.seed_we(v_day, 'elevacao-lateral-halteres', 2, 4,12, 15,  45);
  perform public.seed_we(v_day, 'remada-baixa-polia',        3, 3,10, 12,  90);
  perform public.seed_we(v_day, 'rosca-martelo',             4, 3,10, 12,  60);
  perform public.seed_we(v_day, 'triceps-testa-barra-w',     5, 3,10, 12,  60);

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'Inferior B', 'Inf B', 3, 55)
  returning id into v_day;
  perform public.seed_we(v_day, 'leg-press-45',        0, 4,10, 12, 120);
  perform public.seed_we(v_day, 'elevacao-pelvica',    1, 4, 8, 12, 120);
  perform public.seed_we(v_day, 'agachamento-bulgaro', 2, 3,10, 12,  90);
  perform public.seed_we(v_day, 'cadeira-flexora',     3, 3,12, 15,  60);
  perform public.seed_we(v_day, 'panturrilha-sentado', 4, 4,15, 20,  45);
end if;


-- ═══════════════════════════════════════════════════════════════════════
-- 5. ABCDE — 5 dias
-- ═══════════════════════════════════════════════════════════════════════
if not exists (select 1 from public.workout_plans where name = 'ABCDE' and is_template) then

  insert into public.workout_plans
    (owner_id, name, description, goal, level, days_per_week, duration_weeks, source, is_template)
  values
    (null, 'ABCDE',
     'Um grupo muscular por dia, cinco dias por semana. Volume alto e bastante isolamento — indicado para quem já tem base e boa consistência.',
     'gain_muscle', 'advanced', 5, 12, 'system', true)
  returning id into v_plan;

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'A — Peito', 'A', 0, 60)
  returning id into v_day;
  perform public.seed_we(v_day, 'supino-reto-barra',          0, 4, 6, 10, 120);
  perform public.seed_we(v_day, 'supino-inclinado-barra',     1, 4, 8, 10, 120);
  perform public.seed_we(v_day, 'crucifixo-reto-halteres',    2, 3,10, 12,  60);
  perform public.seed_we(v_day, 'crossover-polia',            3, 3,12, 15,  60);
  perform public.seed_we(v_day, 'mergulho-paralelas',         4, 3, 8, 12,  90);

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'B — Costas', 'B', 1, 60)
  returning id into v_day;
  perform public.seed_we(v_day, 'barra-fixa',                 0, 4, 6, 10, 120);
  perform public.seed_we(v_day, 'remada-curvada-barra',       1, 4, 8, 10, 120);
  perform public.seed_we(v_day, 'puxada-triangulo',           2, 3,10, 12,  90);
  perform public.seed_we(v_day, 'remada-serrote',             3, 3,10, 12,  90);
  perform public.seed_we(v_day, 'pulldown-bracos-estendidos', 4, 3,12, 15,  60);

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'C — Pernas', 'C', 2, 75)
  returning id into v_day;
  perform public.seed_we(v_day, 'agachamento-livre', 0, 4, 6, 10, 150);
  perform public.seed_we(v_day, 'leg-press-45',      1, 4,10, 12, 120);
  perform public.seed_we(v_day, 'cadeira-extensora', 2, 4,12, 15,  60);
  perform public.seed_we(v_day, 'terra-romeno',      3, 3, 8, 10, 120);
  perform public.seed_we(v_day, 'mesa-flexora',      4, 3,10, 12,  60);
  perform public.seed_we(v_day, 'panturrilha-em-pe', 5, 4,12, 20,  45);

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'D — Ombros e Trapézio', 'D', 3, 55)
  returning id into v_day;
  perform public.seed_we(v_day, 'desenvolvimento-militar-barra',0, 4, 6, 10, 120);
  perform public.seed_we(v_day, 'elevacao-lateral-halteres',    1, 4,12, 15,  45);
  perform public.seed_we(v_day, 'crucifixo-inverso-halteres',   2, 3,12, 15,  60);
  perform public.seed_we(v_day, 'elevacao-frontal-halteres',    3, 3,12, 15,  45);
  perform public.seed_we(v_day, 'encolhimento-barra',           4, 4,12, 15,  60);

  insert into public.workout_days (plan_id, name, label, order_index, estimated_minutes)
  values (v_plan, 'E — Braços', 'E', 4, 55)
  returning id into v_day;
  -- Bi-set de bíceps e tríceps (superset_group = 1 e 2)
  perform public.seed_we(v_day, 'rosca-direta-barra',     0, 4, 8, 12, 0, 1);
  perform public.seed_we(v_day, 'triceps-testa-barra-w',  1, 4, 8, 12, 90, 1);
  perform public.seed_we(v_day, 'rosca-scott',            2, 3,10, 12, 0, 2);
  perform public.seed_we(v_day, 'triceps-polia-corda',    3, 3,10, 15, 75, 2);
  perform public.seed_we(v_day, 'rosca-martelo',          4, 3,10, 12, 60);
  perform public.seed_we(v_day, 'triceps-frances',        5, 3,10, 12, 60);
end if;

end
$seed$;

-- Remove o helper: ele existe apenas durante o seed.
drop function if exists public.seed_we(uuid, text, int, int, int, int, int, int, text);
