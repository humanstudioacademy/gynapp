-- Busca de exercícios: sem acento e cobrindo grupo muscular e equipamento.
--
-- Dois problemas do `search_vector` original:
--
-- 1. Usava `to_tsvector('portuguese', ...)` puro. O dicionário português não
--    remove acento, então "triceps" não encontrava "Tríceps" — 8 exercícios
--    ficavam invisíveis para quem digita sem acento. O doc 05 exige busca
--    "sem acento e sem diferenciar maiúsculas".
--
-- 2. Indexava só nome e descrição. Quem busca "biceps" não achava nada, porque
--    os exercícios se chamam "Rosca Direta", "Rosca Scott"… — é o grupo muscular
--    que se chama Bíceps. Mesma coisa para "halter", "peito", "cabo".
--
-- Solução: um `search_terms` mantido por trigger junta nome, descrição, grupo
-- muscular e equipamento; o `search_vector` continua sendo coluna gerada, agora
-- derivada dele. Coluna gerada não enxerga outras tabelas — daí o trigger.

-- `unaccent()` é STABLE e coluna gerada exige IMMUTABLE. Fixar o dicionário no
-- corpo da função torna o resultado determinístico.
create or replace function public.immutable_unaccent(text)
returns text
language sql
immutable
parallel safe
strict
set search_path = public, extensions
as $$ select unaccent('unaccent', $1) $$;

drop index if exists public.idx_exercises_search;
alter table public.exercises drop column if exists search_vector;
alter table public.exercises add column if not exists search_terms text;

create or replace function public.exercises_refresh_search_terms()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.search_terms :=
    coalesce(new.name_pt, '') || ' ' ||
    coalesce(new.name_en, '') || ' ' ||
    coalesce(new.description, '') || ' ' ||
    coalesce((select mg.name_pt || ' ' || mg.name_en
              from public.muscle_groups mg
              where mg.id = new.primary_muscle_group_id), '') || ' ' ||
    coalesce((select eq.name_pt || ' ' || eq.name_en
              from public.equipment eq
              where eq.id = new.equipment_id), '');
  return new;
end;
$$;

drop trigger if exists trg_exercises_search_terms on public.exercises;
create trigger trg_exercises_search_terms
  before insert or update of name_pt, name_en, description,
                             primary_muscle_group_id, equipment_id
  on public.exercises
  for each row execute function public.exercises_refresh_search_terms();

alter table public.exercises
  add column search_vector tsvector generated always as (
    to_tsvector('portuguese', public.immutable_unaccent(coalesce(search_terms, '')))
  ) stored;

create index idx_exercises_search on public.exercises using gin (search_vector);

-- Backfill do catálogo já seedado (o trigger só pega escritas novas).
-- Precisa tocar uma das colunas listadas no `update of` do trigger.
update public.exercises set name_pt = name_pt;

-- O termo digitado também precisa ir sem acento para o to_tsquery. O app
-- normaliza no cliente (NFD + remoção de diacríticos) e usa `.textSearch()`.
