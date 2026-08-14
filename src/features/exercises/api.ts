import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Enums = Database['public']['Enums'];
type ExerciseRow = Database['public']['Tables']['exercises']['Row'];

export type ExerciseListItem = {
  id: string;
  name_pt: string;
  difficulty: Enums['experience_level'];
  mechanic: Enums['exercise_mechanic'] | null;
  tracking_type: Enums['tracking_type'];
  is_unilateral: boolean;
  thumbnail_path: string | null;
  created_by: string | null;
  muscle_group: {
    id: string;
    name_pt: string;
    slug: string;
    color_hex: string;
    display_order: number;
  } | null;
  equipment: { id: string; name_pt: string; slug: string; icon: string | null } | null;
};

export type ExerciseDetail = ExerciseListItem &
  Pick<ExerciseRow, 'description' | 'instructions' | 'tips' | 'video_url' | 'force_type' | 'is_public'> & {
    secondary_muscles: { id: string; name_pt: string; color_hex: string }[];
  };

export type ExerciseFilters = {
  search?: string;
  muscleGroupId?: string | null;
  equipmentId?: string | null;
  scope?: 'all' | 'favorites' | 'mine';
  favoriteIds?: string[];
};

const LIST_COLUMNS = `
  id, name_pt, difficulty, mechanic, tracking_type, is_unilateral, thumbnail_path, created_by,
  muscle_group:muscle_groups!exercises_primary_muscle_group_id_fkey (id, name_pt, slug, color_hex, display_order),
  equipment:equipment!exercises_equipment_id_fkey (id, name_pt, slug, icon)
`;

/**
 * Remove acentos do termo digitado. O `search_vector` do banco é gerado com
 * unaccent (migration 20260814001500), então a consulta precisa ir sem acento
 * também — senão "tríceps" não casa com o índice.
 */
export function normalizeSearchTerm(term: string): string {
  return term
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

export async function fetchExercises(filters: ExerciseFilters): Promise<ExerciseListItem[]> {
  let query = supabase.from('exercises').select(LIST_COLUMNS);

  const term = normalizeSearchTerm(filters.search ?? '');
  if (term.length > 0) {
    // websearch: "supino halter" vira AND dos dois termos, que é o que o usuário espera.
    query = query.textSearch('search_vector', term, { type: 'websearch', config: 'portuguese' });
  }

  if (filters.muscleGroupId) query = query.eq('primary_muscle_group_id', filters.muscleGroupId);
  if (filters.equipmentId) query = query.eq('equipment_id', filters.equipmentId);

  if (filters.scope === 'mine') {
    query = query.not('created_by', 'is', null);
  } else if (filters.scope === 'favorites') {
    const ids = filters.favoriteIds ?? [];
    if (ids.length === 0) return [];
    query = query.in('id', ids);
  }

  const { data, error } = await query.order('name_pt').limit(500);
  if (error) throw error;

  return (data ?? []) as unknown as ExerciseListItem[];
}

export async function fetchExerciseDetail(id: string): Promise<ExerciseDetail | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select(
      `${LIST_COLUMNS}, description, instructions, tips, video_url, force_type, is_public,
       exercise_muscle_groups (role, muscle_groups (id, name_pt, color_hex))`,
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const raw = data as unknown as ExerciseDetail & {
    exercise_muscle_groups: {
      role: Enums['muscle_role'];
      muscle_groups: { id: string; name_pt: string; color_hex: string } | null;
    }[];
  };

  return {
    ...raw,
    secondary_muscles: raw.exercise_muscle_groups
      .filter((link) => link.role === 'secondary' && link.muscle_groups !== null)
      .map((link) => link.muscle_groups!),
  };
}

export async function fetchFavoriteIds(): Promise<string[]> {
  const { data, error } = await supabase.from('exercise_favorites').select('exercise_id');
  if (error) throw error;
  return (data ?? []).map((row) => row.exercise_id);
}

export async function setFavorite(exerciseId: string, favorite: boolean): Promise<void> {
  if (favorite) {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) throw new Error('Sessão expirada.');

    const { error } = await supabase
      .from('exercise_favorites')
      .upsert({ user_id: userId, exercise_id: exerciseId }, { onConflict: 'user_id,exercise_id' });
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('exercise_favorites')
    .delete()
    .eq('exercise_id', exerciseId);
  if (error) throw error;
}

export type CustomExerciseInput = {
  namePt: string;
  primaryMuscleGroupId: string;
  equipmentId: string | null;
  trackingType: Enums['tracking_type'];
  difficulty: Enums['experience_level'];
  isUnilateral: boolean;
  mechanic: Enums['exercise_mechanic'] | null;
  instructions: string[];
};

/** `is_public = false` é exigência da policy `exercises_insert_own`. */
export async function createExercise(input: CustomExerciseInput): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada.');

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      name_pt: input.namePt,
      primary_muscle_group_id: input.primaryMuscleGroupId,
      equipment_id: input.equipmentId,
      tracking_type: input.trackingType,
      difficulty: input.difficulty,
      is_unilateral: input.isUnilateral,
      mechanic: input.mechanic,
      instructions: input.instructions.length > 0 ? input.instructions : null,
      created_by: userId,
      is_public: false,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateExercise(id: string, input: CustomExerciseInput): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .update({
      name_pt: input.namePt,
      primary_muscle_group_id: input.primaryMuscleGroupId,
      equipment_id: input.equipmentId,
      tracking_type: input.trackingType,
      difficulty: input.difficulty,
      is_unilateral: input.isUnilateral,
      mechanic: input.mechanic,
      instructions: input.instructions.length > 0 ? input.instructions : null,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase.from('exercises').delete().eq('id', id);
  if (error) throw error;
}

/** Quantas sessões já usaram o exercício — some junto se ele for excluído. */
export async function countExerciseUsage(id: string): Promise<number> {
  const { count, error } = await supabase
    .from('session_exercises')
    .select('*', { count: 'exact', head: true })
    .eq('exercise_id', id);

  if (error) throw error;
  return count ?? 0;
}
