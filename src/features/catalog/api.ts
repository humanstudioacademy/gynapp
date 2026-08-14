import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

export type MuscleGroup = Database['public']['Tables']['muscle_groups']['Row'];
export type Equipment = Database['public']['Tables']['equipment']['Row'];

export async function fetchMuscleGroups(): Promise<MuscleGroup[]> {
  const { data, error } = await supabase
    .from('muscle_groups')
    .select('*')
    .order('display_order');

  if (error) throw error;
  return data ?? [];
}

export async function fetchEquipment(): Promise<Equipment[]> {
  const { data, error } = await supabase.from('equipment').select('*').order('display_order');

  if (error) throw error;
  return data ?? [];
}

/** Contagens usadas na verificação da Fase 0. */
export async function fetchCatalogCounts() {
  const [exercises, templates, groups] = await Promise.all([
    supabase.from('exercises').select('*', { count: 'exact', head: true }),
    supabase
      .from('workout_plans')
      .select('*', { count: 'exact', head: true })
      .eq('is_template', true),
    supabase.from('muscle_groups').select('*', { count: 'exact', head: true }),
  ]);

  const firstError = exercises.error ?? templates.error ?? groups.error;
  if (firstError) throw firstError;

  return {
    exercises: exercises.count ?? 0,
    templates: templates.count ?? 0,
    muscleGroups: groups.count ?? 0,
  };
}
