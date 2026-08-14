import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import { qk } from '@/lib/query/keys';
import { supabase } from '@/lib/supabase/client';

import {
  addExerciseToSession,
  addSet,
  cancelSession,
  fetchActiveSession,
  fetchLastPerformances,
  fetchSession,
  finishSession,
  removeSessionExercise,
  removeSet,
  saveSessionFeedback,
  startFreeSession,
  startSession,
  updateSet,
  type SessionDetail,
  type SetPatch,
} from './api';

export function useActiveSession() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: qk.sessions.active(),
    queryFn: fetchActiveSession,
    enabled: userId !== null,
    // O treino é o dado mais quente do app: nunca servir cache velho.
    staleTime: 0,
  });
}

export function useSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: qk.sessions.detail(sessionId ?? ''),
    queryFn: () => fetchSession(sessionId!),
    enabled: Boolean(sessionId),
  });
}

export function useLastPerformances(exerciseIds: string[]) {
  const { userId } = useAuth();
  const key = [...exerciseIds].sort().join(',');

  return useQuery({
    queryKey: [...qk.progress.lastPerformance(), key],
    queryFn: () => fetchLastPerformances(exerciseIds),
    enabled: userId !== null && exerciseIds.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workoutDayId: string) => startSession(workoutDayId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.sessions.all() });
    },
  });
}

export function useStartFreeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name?: string) => startFreeSession(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.sessions.all() });
    },
  });
}

/**
 * Atualiza uma série com escrita otimista: o check precisa responder em menos de
 * 100ms (critério de saída da Fase 4), então a UI não espera a rede.
 */
export function useUpdateSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, patch }: { setId: string; patch: SetPatch }) => updateSet(setId, patch),

    onMutate: async ({ setId, patch }) => {
      await queryClient.cancelQueries({ queryKey: qk.sessions.active() });
      const previous = queryClient.getQueryData<SessionDetail | null>(qk.sessions.active());

      queryClient.setQueryData<SessionDetail | null>(qk.sessions.active(), (current) => {
        if (!current) return current;
        return {
          ...current,
          exercises: current.exercises.map((exercise) => ({
            ...exercise,
            sets: exercise.sets.map((set) => (set.id === setId ? { ...set, ...patch } : set)),
          })),
        };
      });

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(qk.sessions.active(), context.previous);
    },
  });
}

function useSessionInvalidator() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: qk.sessions.all() });
}

export function useAddSet() {
  const invalidate = useSessionInvalidator();

  return useMutation({
    mutationFn: ({
      sessionExerciseId,
      template,
    }: {
      sessionExerciseId: string;
      template: { weight_kg: number | null; reps: number | null; duration_seconds: number | null };
    }) => addSet(sessionExerciseId, template),
    onSuccess: () => void invalidate(),
  });
}

export function useRemoveSet() {
  const invalidate = useSessionInvalidator();

  return useMutation({
    mutationFn: (setId: string) => removeSet(setId),
    onSuccess: () => void invalidate(),
  });
}

export function useAddSessionExercise(sessionId: string) {
  const invalidate = useSessionInvalidator();

  return useMutation({
    mutationFn: async (exerciseIds: string[]) => {
      for (const exerciseId of exerciseIds) {
        await addExerciseToSession(sessionId, exerciseId);
      }
    },
    onSuccess: () => void invalidate(),
  });
}

export function useRemoveSessionExercise() {
  const invalidate = useSessionInvalidator();

  return useMutation({
    mutationFn: (sessionExerciseId: string) => removeSessionExercise(sessionExerciseId),
    onSuccess: () => void invalidate(),
  });
}

export function useFinishSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      effort,
      feeling,
      notes,
    }: {
      sessionId: string;
      effort?: number | null;
      feeling?: number | null;
      notes?: string | null;
    }) => finishSession(sessionId, { effort, feeling, notes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.sessions.all() });
      void queryClient.invalidateQueries({ queryKey: qk.progress.dashboard() });
      void queryClient.invalidateQueries({ queryKey: qk.progress.records() });
    },
  });
}

export function useSaveSessionFeedback() {
  const invalidate = useSessionInvalidator();

  return useMutation({
    mutationFn: ({
      sessionId,
      effort,
      feeling,
      notes,
    }: {
      sessionId: string;
      effort: number | null;
      feeling: number | null;
      notes: string | null;
    }) => saveSessionFeedback(sessionId, { effort, feeling, notes }),
    onSuccess: () => void invalidate(),
  });
}

export function useCancelSession() {
  const invalidate = useSessionInvalidator();

  return useMutation({
    mutationFn: (sessionId: string) => cancelSession(sessionId),
    onSuccess: () => void invalidate(),
  });
}

/** Pausa/retoma acumulando `paused_seconds` — a duração final desconta isso. */
export function useTogglePause() {
  const invalidate = useSessionInvalidator();

  return useMutation({
    mutationFn: async ({
      sessionId,
      pausedAt,
      pausedSeconds,
    }: {
      sessionId: string;
      pausedAt: number | null;
      pausedSeconds: number;
    }) => {
      const resuming = pausedAt != null;
      const accumulated = resuming
        ? pausedSeconds + Math.floor((Date.now() - pausedAt) / 1000)
        : pausedSeconds;

      const { error } = await supabase
        .from('workout_sessions')
        .update({
          status: resuming ? 'in_progress' : 'paused',
          paused_seconds: accumulated,
        })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => void invalidate(),
  });
}
