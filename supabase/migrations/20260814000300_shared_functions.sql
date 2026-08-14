-- Funções utilitárias compartilhadas
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 1RM estimado — fórmula de Epley: 1RM = peso × (1 + reps/30)
-- Só estima entre 1 e 15 repetições (acima disso a fórmula perde precisão).
create or replace function public.estimate_1rm(p_weight numeric, p_reps int)
returns numeric
language sql
immutable
as $$
  select case
    when p_weight is null or p_reps is null or p_reps < 1 or p_reps > 15 then null
    when p_reps = 1 then p_weight
    else round(p_weight * (1 + p_reps::numeric / 30), 2)
  end;
$$;
