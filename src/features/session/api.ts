import { randomUUID } from 'expo-crypto';

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Enums = Database['public']['Enums'];
type SessionRow = Database['public']['Tables']['workout_sessions']['Row'];

export type SessionSet = {
  id: string;
  set_number: number;
  set_type: Enums['set_type'];
  weight_kg: number | null;
  reps: number | null;
  duration_seconds: number | null;
  rpe: number | null;
  side: string | null;
  is_completed: boolean;
  notes: string | null;
};

export type SessionExercise = {
  id: string;
  order_index: number;
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
  /** Metas da ficha — usadas para o descanso sugerido e a faixa de reps. */
  prescription: {
    target_rest_seconds: number;
    target_reps_min: number | null;
    target_reps_max: number | null;
  } | null;
  sets: SessionSet[];
};

export type SessionDetail = SessionRow & { exercises: SessionExercise[] };

export type LastPerformance = {
  exercise_id: string;
  weight_kg: number | null;
  reps: number | null;
  performed_at: string;
};

const SESSION_SELECT = `
  *,
  session_exercises (
    id, order_index, notes,
    exercise:exercises!session_exercises_exercise_id_fkey (
      id, name_pt, tracking_type, is_unilateral, thumbnail_path,
      muscle_group:muscle_groups!exercises_primary_muscle_group_id_fkey (id, name_pt, color_hex),
      equipment:equipment!exercises_equipment_id_fkey (id, name_pt, slug)
    ),
    prescription:workout_exercises!session_exercises_workout_exercise_id_fkey (
      target_rest_seconds, target_reps_min, target_reps_max
    ),
    session_sets (
      id, set_number, set_type, weight_kg, reps, duration_seconds, rpe, side,
      is_completed, notes
    )
  )
`;

function normalize(raw: unknown): SessionDetail {
  const data = raw as SessionRow & {
    session_exercises: (Omit<SessionExercise, 'sets'> & { session_sets: SessionSet[] })[];
  };

  const { session_exercises: exercises, ...session } = data;

  return {
    ...(session as SessionRow),
    exercises: (exercises ?? [])
      .map((item) => {
        const { session_sets: sets, ...rest } = item;
        return {
          ...rest,
          sets: (sets ?? []).sort((a, b) => a.set_number - b.set_number),
        };
      })
      .sort((a, b) => a.order_index - b.order_index),
  };
}

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) throw new Error('Sessão expirada.');
  return userId;
}

/**
 * Inicia a sessão a partir de uma ficha. A RPC já cria os exercícios e as séries
 * pré-preenchidas com as metas; `client_id` garante que um retry offline não
 * duplique nada.
 */
export async function startSession(workoutDayId: string): Promise<string> {
  const { data, error } = await supabase.rpc('start_workout_session', {
    p_workout_day_id: workoutDayId,
    p_client_id: randomUUID(),
  });

  if (error) throw error;
  return data as unknown as string;
}

/** Treino livre, sem ficha (US-5.1). */
export async function startFreeSession(name?: string): Promise<string> {
  const { data, error } = await supabase.rpc('start_free_session', {
    p_name: name ?? 'Treino livre',
    p_client_id: randomUUID(),
  });

  if (error) throw error;
  return data as unknown as string;
}

/** A sessão em andamento, se houver — é o que permite retomar ao reabrir o app. */
export async function fetchActiveSession(): Promise<SessionDetail | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(SESSION_SELECT)
    .in('status', ['in_progress', 'paused'])
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? normalize(data) : null;
}

export async function fetchSession(sessionId: string): Promise<SessionDetail | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(SESSION_SELECT)
    .eq('id', sessionId)
    .maybeSingle();

  if (error) throw error;
  return data ? normalize(data) : null;
}

/** Última carga × reps por exercício — o contexto que economiza tempo no player. */
export async function fetchLastPerformances(exerciseIds: string[]): Promise<LastPerformance[]> {
  if (exerciseIds.length === 0) return [];

  const { data, error } = await supabase
    .from('v_exercise_last_performance')
    .select('exercise_id, weight_kg, reps, performed_at')
    .in('exercise_id', exerciseIds);

  if (error) throw error;
  return (data ?? []) as LastPerformance[];
}

export type SetPatch = {
  weight_kg?: number | null;
  reps?: number | null;
  duration_seconds?: number | null;
  rpe?: number | null;
  set_type?: Enums['set_type'];
  is_completed?: boolean;
  notes?: string | null;
};

export async function updateSet(setId: string, patch: SetPatch): Promise<void> {
  const { error } = await supabase
    .from('session_sets')
    .update({
      ...patch,
      ...(patch.is_completed !== undefined
        ? { completed_at: patch.is_completed ? new Date().toISOString() : null }
        : {}),
    })
    .eq('id', setId);

  if (error) throw error;
}

export async function addSet(
  sessionExerciseId: string,
  template: { weight_kg: number | null; reps: number | null; duration_seconds: number | null },
): Promise<void> {
  const { data: last, error: lastError } = await supabase
    .from('session_sets')
    .select('set_number')
    .eq('session_exercise_id', sessionExerciseId)
    .order('set_number', { ascending: false })
    .limit(1);

  if (lastError) throw lastError;

  const { error } = await supabase.from('session_sets').insert({
    client_id: randomUUID(),
    session_exercise_id: sessionExerciseId,
    set_number: (last?.[0]?.set_number ?? 0) + 1,
    weight_kg: template.weight_kg,
    reps: template.reps,
    duration_seconds: template.duration_seconds,
    is_completed: false,
  });

  if (error) throw error;
}

export async function removeSet(setId: string): Promise<void> {
  const { error } = await supabase.from('session_sets').delete().eq('id', setId);
  if (error) throw error;
}

/** Adiciona um exercício no meio do treino, já com 3 séries em branco. */
export async function addExerciseToSession(
  sessionId: string,
  exerciseId: string,
  setCount = 3,
): Promise<void> {
  const { data: last, error: lastError } = await supabase
    .from('session_exercises')
    .select('order_index')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: false })
    .limit(1);

  if (lastError) throw lastError;

  const { data: created, error } = await supabase
    .from('session_exercises')
    .insert({
      client_id: randomUUID(),
      session_id: sessionId,
      exercise_id: exerciseId,
      order_index: (last?.[0]?.order_index ?? -1) + 1,
    })
    .select('id')
    .single();

  if (error) throw error;

  const { error: setsError } = await supabase.from('session_sets').insert(
    Array.from({ length: setCount }, (_, index) => ({
      client_id: randomUUID(),
      session_exercise_id: created.id,
      set_number: index + 1,
      is_completed: false,
    })),
  );

  if (setsError) throw setsError;
}

export async function removeSessionExercise(sessionExerciseId: string): Promise<void> {
  const { error } = await supabase
    .from('session_exercises')
    .delete()
    .eq('id', sessionExerciseId);

  if (error) throw error;
}

/** Espelha o `jsonb_build_object` de `finish_workout_session` — não renomear. */
export type FinishResult = {
  session_id: string;
  duration: number;
  total_volume: number;
  total_sets: number;
  total_reps: number;
  records: {
    exercise_id: string;
    exercise_name: string;
    record_type: Enums['record_type'];
    value: number;
    previous: number | null;
  }[];
};

export async function finishSession(
  sessionId: string,
  input: { effort?: number | null; feeling?: number | null; notes?: string | null },
): Promise<FinishResult> {
  const { data, error } = await supabase.rpc('finish_workout_session', {
    p_session_id: sessionId,
    p_effort: input.effort ?? undefined,
    p_feeling: input.feeling ?? undefined,
    p_notes: input.notes ?? undefined,
  });

  if (error) throw error;
  return data as unknown as FinishResult;
}

/** Sensação, esforço e anotações — preenchidos no resumo, depois do finish. */
export async function saveSessionFeedback(
  sessionId: string,
  input: { effort: number | null; feeling: number | null; notes: string | null },
): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({
      perceived_effort: input.effort,
      feeling: input.feeling,
      notes: input.notes,
    })
    .eq('id', sessionId);

  if (error) throw error;
}

/** Descartar o treino: marca como cancelada e não entra no histórico de volume. */
export async function cancelSession(sessionId: string): Promise<void> {
  const userId = await requireUserId();

  const { error } = await supabase
    .from('workout_sessions')
    .update({ status: 'cancelled', finished_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) throw error;
}
