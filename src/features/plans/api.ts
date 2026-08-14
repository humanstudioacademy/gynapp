import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Enums = Database['public']['Enums'];
type PlanRow = Database['public']['Tables']['workout_plans']['Row'];
type DayRow = Database['public']['Tables']['workout_days']['Row'];

export type Plan = PlanRow;

export type PlanListItem = Pick<
  PlanRow,
  'id' | 'name' | 'description' | 'goal' | 'level' | 'days_per_week' | 'archived_at' | 'is_template'
> & {
  day_count: number;
};

export type PlanDay = Pick<
  DayRow,
  'id' | 'name' | 'label' | 'notes' | 'order_index' | 'estimated_minutes' | 'scheduled_weekday'
> & {
  exercise_count: number;
};

export type PlanDetail = PlanRow & { days: PlanDay[] };

/** Exercício prescrito, já com os dados do exercício do catálogo. */
export type PrescribedExerciseRow = {
  id: string;
  order_index: number;
  target_sets: number;
  target_reps_min: number | null;
  target_reps_max: number | null;
  target_weight_kg: number | null;
  target_duration_seconds: number | null;
  target_rest_seconds: number;
  target_rpe: number | null;
  tempo: string | null;
  superset_group: number | null;
  notes: string | null;
  exercise: {
    id: string;
    name_pt: string;
    tracking_type: Enums['tracking_type'];
    is_unilateral: boolean;
    thumbnail_path: string | null;
    muscle_group: { id: string; name_pt: string; color_hex: string } | null;
    equipment: { id: string; name_pt: string; slug: string } | null;
  } | null;
};

export type DayDetail = DayRow & {
  plan: { id: string; name: string; owner_id: string | null } | null;
  exercises: PrescribedExerciseRow[];
};

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) throw new Error('Sessão expirada.');
  return userId;
}

// ── Rotinas ────────────────────────────────────────────────────────────────

/** Rotinas do usuário. `archived` decide entre ativas e arquivadas. */
export async function fetchPlans(archived = false): Promise<PlanListItem[]> {
  const query = supabase
    .from('workout_plans')
    .select(
      'id, name, description, goal, level, days_per_week, archived_at, is_template, workout_days(count)',
    )
    .eq('is_template', false)
    .order('created_at', { ascending: false });

  const { data, error } = archived
    ? await query.not('archived_at', 'is', null)
    : await query.is('archived_at', null);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const { workout_days: days, ...plan } = row as typeof row & {
      workout_days: { count: number }[];
    };
    return { ...plan, day_count: days?.[0]?.count ?? 0 };
  });
}

export async function fetchTemplates(): Promise<PlanListItem[]> {
  const { data, error } = await supabase
    .from('workout_plans')
    .select(
      'id, name, description, goal, level, days_per_week, archived_at, is_template, workout_days(count)',
    )
    .eq('is_template', true)
    .order('level');

  if (error) throw error;

  return (data ?? []).map((row) => {
    const { workout_days: days, ...plan } = row as typeof row & {
      workout_days: { count: number }[];
    };
    return { ...plan, day_count: days?.[0]?.count ?? 0 };
  });
}

export async function fetchPlanDetail(planId: string): Promise<PlanDetail | null> {
  const { data, error } = await supabase
    .from('workout_plans')
    .select(
      '*, workout_days (id, name, label, notes, order_index, estimated_minutes, scheduled_weekday, workout_exercises(count))',
    )
    .eq('id', planId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { workout_days: days, ...plan } = data as typeof data & {
    workout_days: (PlanDay & { workout_exercises: { count: number }[] })[];
  };

  return {
    ...(plan as PlanRow),
    days: (days ?? [])
      .map((day) => {
        const { workout_exercises: exercises, ...rest } = day;
        return { ...rest, exercise_count: exercises?.[0]?.count ?? 0 };
      })
      .sort((a, b) => a.order_index - b.order_index),
  };
}

export type PlanInput = {
  name: string;
  description: string | null;
  goal: Enums['fitness_goal'] | null;
  level: Enums['experience_level'] | null;
  daysPerWeek: number | null;
};

export async function createPlan(input: PlanInput): Promise<string> {
  const ownerId = await requireUserId();

  const { data, error } = await supabase
    .from('workout_plans')
    .insert({
      owner_id: ownerId,
      name: input.name,
      description: input.description,
      goal: input.goal,
      level: input.level,
      days_per_week: input.daysPerWeek,
      source: 'user',
      is_template: false,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updatePlan(planId: string, input: PlanInput): Promise<void> {
  const { error } = await supabase
    .from('workout_plans')
    .update({
      name: input.name,
      description: input.description,
      goal: input.goal,
      level: input.level,
      days_per_week: input.daysPerWeek,
    })
    .eq('id', planId);

  if (error) throw error;
}

/** Arquivar é soft delete: o histórico de sessões continua apontando para a rotina. */
export async function setPlanArchived(planId: string, archived: boolean): Promise<void> {
  const { error } = await supabase
    .from('workout_plans')
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq('id', planId);

  if (error) throw error;
}

export async function deletePlan(planId: string): Promise<void> {
  const { error } = await supabase.from('workout_plans').delete().eq('id', planId);
  if (error) throw error;
}

/**
 * Duplicar reusa a mesma RPC do template: ela copia fichas e exercícios
 * prescritos para uma rotina nova do usuário atual.
 */
export async function copyPlan(planId: string, newName?: string): Promise<string> {
  const { data, error } = await supabase.rpc('copy_plan_template', {
    p_plan_id: planId,
    p_new_name: newName ?? '',
  });

  if (error) throw error;
  return data as unknown as string;
}

export async function setActivePlan(planId: string | null): Promise<void> {
  const userId = await requireUserId();
  const { error } = await supabase
    .from('profiles')
    .update({ active_plan_id: planId })
    .eq('id', userId);

  if (error) throw error;
}

// ── Fichas ─────────────────────────────────────────────────────────────────

export async function fetchDayDetail(dayId: string): Promise<DayDetail | null> {
  const { data, error } = await supabase
    .from('workout_days')
    .select(
      `*,
       plan:workout_plans!workout_days_plan_id_fkey (id, name, owner_id),
       workout_exercises (
         id, order_index, target_sets, target_reps_min, target_reps_max, target_weight_kg,
         target_duration_seconds, target_rest_seconds, target_rpe, tempo, superset_group, notes,
         exercise:exercises!workout_exercises_exercise_id_fkey (
           id, name_pt, tracking_type, is_unilateral, thumbnail_path,
           muscle_group:muscle_groups!exercises_primary_muscle_group_id_fkey (id, name_pt, color_hex),
           equipment:equipment!exercises_equipment_id_fkey (id, name_pt, slug)
         )
       )`,
    )
    .eq('id', dayId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { workout_exercises: exercises, ...day } = data as unknown as DayDetail & {
    workout_exercises: PrescribedExerciseRow[];
  };

  return {
    ...(day as DayDetail),
    exercises: (exercises ?? []).sort((a, b) => a.order_index - b.order_index),
  };
}

export async function createDay(
  planId: string,
  input: { name: string; label: string | null; orderIndex: number },
): Promise<string> {
  const { data, error } = await supabase
    .from('workout_days')
    .insert({
      plan_id: planId,
      name: input.name,
      label: input.label,
      order_index: input.orderIndex,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateDay(
  dayId: string,
  input: { name?: string; label?: string | null; notes?: string | null; estimatedMinutes?: number | null },
): Promise<void> {
  const { error } = await supabase
    .from('workout_days')
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.label !== undefined ? { label: input.label } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.estimatedMinutes !== undefined ? { estimated_minutes: input.estimatedMinutes } : {}),
    })
    .eq('id', dayId);

  if (error) throw error;
}

export async function deleteDay(dayId: string): Promise<void> {
  const { error } = await supabase.from('workout_days').delete().eq('id', dayId);
  if (error) throw error;
}

/**
 * Reordena as fichas. `uq_workout_days_order` é DEFERRABLE, mas o PostgREST
 * manda um request por linha — então passamos por um offset alto primeiro
 * para não colidir no meio do caminho.
 */
export async function reorderDays(ids: string[]): Promise<void> {
  const OFFSET = 1000;

  for (const [index, id] of ids.entries()) {
    const { error } = await supabase
      .from('workout_days')
      .update({ order_index: OFFSET + index })
      .eq('id', id);
    if (error) throw error;
  }

  for (const [index, id] of ids.entries()) {
    const { error } = await supabase
      .from('workout_days')
      .update({ order_index: index })
      .eq('id', id);
    if (error) throw error;
  }
}

/** Duplica a ficha e seus exercícios prescritos dentro da mesma rotina. */
export async function duplicateDay(dayId: string): Promise<string> {
  const day = await fetchDayDetail(dayId);
  if (!day) throw new Error('Ficha não encontrada.');

  const { data: siblings, error: countError } = await supabase
    .from('workout_days')
    .select('order_index')
    .eq('plan_id', day.plan_id)
    .order('order_index', { ascending: false })
    .limit(1);

  if (countError) throw countError;
  const nextIndex = (siblings?.[0]?.order_index ?? -1) + 1;

  const newDayId = await createDay(day.plan_id, {
    name: `${day.name} (cópia)`,
    label: day.label,
    orderIndex: nextIndex,
  });

  if (day.exercises.length > 0) {
    const { error } = await supabase.from('workout_exercises').insert(
      day.exercises.map((item) => ({
        workout_day_id: newDayId,
        exercise_id: item.exercise?.id ?? '',
        order_index: item.order_index,
        target_sets: item.target_sets,
        target_reps_min: item.target_reps_min,
        target_reps_max: item.target_reps_max,
        target_weight_kg: item.target_weight_kg,
        target_duration_seconds: item.target_duration_seconds,
        target_rest_seconds: item.target_rest_seconds,
        target_rpe: item.target_rpe,
        tempo: item.tempo,
        superset_group: item.superset_group,
        notes: item.notes,
      })),
    );
    if (error) throw error;
  }

  return newDayId;
}

// ── Exercícios prescritos ──────────────────────────────────────────────────

export async function addExercisesToDay(dayId: string, exerciseIds: string[]): Promise<void> {
  const { data: last, error: lastError } = await supabase
    .from('workout_exercises')
    .select('order_index')
    .eq('workout_day_id', dayId)
    .order('order_index', { ascending: false })
    .limit(1);

  if (lastError) throw lastError;
  const start = (last?.[0]?.order_index ?? -1) + 1;

  const { error } = await supabase.from('workout_exercises').insert(
    exerciseIds.map((exerciseId, index) => ({
      workout_day_id: dayId,
      exercise_id: exerciseId,
      order_index: start + index,
    })),
  );

  if (error) throw error;
}

export type PrescriptionInput = {
  targetSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetWeightKg: number | null;
  targetDurationSeconds: number | null;
  targetRestSeconds: number;
  targetRpe: number | null;
  notes: string | null;
};

export async function updatePrescription(
  workoutExerciseId: string,
  input: PrescriptionInput,
): Promise<void> {
  const { error } = await supabase
    .from('workout_exercises')
    .update({
      target_sets: input.targetSets,
      target_reps_min: input.targetRepsMin,
      target_reps_max: input.targetRepsMax,
      target_weight_kg: input.targetWeightKg,
      target_duration_seconds: input.targetDurationSeconds,
      target_rest_seconds: input.targetRestSeconds,
      target_rpe: input.targetRpe,
      notes: input.notes,
    })
    .eq('id', workoutExerciseId);

  if (error) throw error;
}

export async function removePrescription(workoutExerciseId: string): Promise<void> {
  const { error } = await supabase.from('workout_exercises').delete().eq('id', workoutExerciseId);
  if (error) throw error;
}

export async function reorderPrescriptions(ids: string[]): Promise<void> {
  for (const [index, id] of ids.entries()) {
    const { error } = await supabase
      .from('workout_exercises')
      .update({ order_index: index })
      .eq('id', id);
    if (error) throw error;
  }
}

/** `null` desfaz o agrupamento; um número junta os exercícios no mesmo bi-set. */
export async function setSupersetGroup(
  workoutExerciseIds: string[],
  group: number | null,
): Promise<void> {
  const { error } = await supabase
    .from('workout_exercises')
    .update({ superset_group: group })
    .in('id', workoutExerciseIds);

  if (error) throw error;
}
