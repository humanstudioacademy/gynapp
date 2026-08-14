-- ═══════════════════════════════════════════════════════════════════════
-- SEED PRINCIPAL
--
-- Executado automaticamente por `supabase db reset`.
-- Para aplicar em um ambiente remoto (dev/staging):
--   psql "$DATABASE_URL" -f supabase/seed.sql
--
-- Todos os arquivos são idempotentes — rodar duas vezes não duplica dados.
-- ═══════════════════════════════════════════════════════════════════════

\echo '── Seed 01: grupos musculares e equipamentos ──'
\ir seed/01_catalog.sql

\echo '── Seed 02: catálogo de exercícios (138) ──'
\ir seed/02_exercises.sql

\echo '── Seed 03: templates de treino do sistema (5) ──'
\ir seed/03_templates.sql

-- ── Verificação ────────────────────────────────────────────────────────
do $$
declare
  v_mg   int;
  v_eq   int;
  v_ex   int;
  v_pl   int;
  v_days int;
  v_we   int;
begin
  select count(*) into v_mg   from public.muscle_groups;
  select count(*) into v_eq   from public.equipment;
  select count(*) into v_ex   from public.exercises      where created_by is null;
  select count(*) into v_pl   from public.workout_plans  where is_template;
  select count(*) into v_days from public.workout_days   d
    join public.workout_plans p on p.id = d.plan_id where p.is_template;
  select count(*) into v_we   from public.workout_exercises we
    join public.workout_days d  on d.id = we.workout_day_id
    join public.workout_plans p on p.id = d.plan_id where p.is_template;

  raise notice '';
  raise notice '═══════════════ SEED CONCLUÍDO ═══════════════';
  raise notice '  Grupos musculares .......... %', v_mg;
  raise notice '  Equipamentos ............... %', v_eq;
  raise notice '  Exercícios do sistema ...... %', v_ex;
  raise notice '  Templates de treino ........ %', v_pl;
  raise notice '  Fichas nos templates ....... %', v_days;
  raise notice '  Exercícios prescritos ...... %', v_we;
  raise notice '══════════════════════════════════════════════';
  raise notice '';

  if v_mg <> 14 then raise warning 'Esperados 14 grupos musculares, encontrados %', v_mg; end if;
  if v_eq <> 12 then raise warning 'Esperados 12 equipamentos, encontrados %', v_eq;      end if;
  if v_ex < 138 then raise warning 'Esperados 138 exercícios, encontrados %', v_ex;       end if;
  if v_pl <>  5 then raise warning 'Esperados 5 templates, encontrados %', v_pl;          end if;
end $$;
