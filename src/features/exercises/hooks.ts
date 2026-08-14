import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import { qk } from '@/lib/query/keys';

import {
  countExerciseUsage,
  createExercise,
  deleteExercise,
  fetchExerciseDetail,
  fetchExercises,
  fetchFavoriteIds,
  setFavorite,
  updateExercise,
  type CustomExerciseInput,
  type ExerciseFilters,
} from './api';

export function useFavoriteIds() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: qk.exercises.favorites(),
    queryFn: fetchFavoriteIds,
    enabled: userId !== null,
  });
}

export function useExercises(filters: ExerciseFilters) {
  const { userId } = useAuth();
  const favorites = useFavoriteIds();

  // A aba "Favoritos" filtra por id: precisa da lista carregada antes de consultar.
  const waitingForFavorites = filters.scope === 'favorites' && favorites.isPending;

  return useQuery({
    queryKey: qk.exercises.list({ ...filters, favoriteIds: undefined }),
    queryFn: () => fetchExercises({ ...filters, favoriteIds: favorites.data ?? [] }),
    enabled: userId !== null && !waitingForFavorites,
    placeholderData: (previous) => previous, // evita piscar a lista a cada tecla
  });
}

export function useExerciseDetail(id: string | undefined) {
  return useQuery({
    queryKey: qk.exercises.detail(id ?? ''),
    queryFn: () => fetchExerciseDetail(id!),
    enabled: Boolean(id),
  });
}

/** Alterna favorito com atualização otimista (US-3.4). */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ exerciseId, favorite }: { exerciseId: string; favorite: boolean }) =>
      setFavorite(exerciseId, favorite),

    onMutate: async ({ exerciseId, favorite }) => {
      await queryClient.cancelQueries({ queryKey: qk.exercises.favorites() });
      const previous = queryClient.getQueryData<string[]>(qk.exercises.favorites()) ?? [];

      queryClient.setQueryData<string[]>(qk.exercises.favorites(), (current) => {
        const ids = current ?? [];
        if (favorite) return ids.includes(exerciseId) ? ids : [...ids, exerciseId];
        return ids.filter((id) => id !== exerciseId);
      });

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(qk.exercises.favorites(), context.previous);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.exercises.favorites() });
    },
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CustomExerciseInput) => createExercise(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.exercises.all() });
    },
  });
}

export function useUpdateExercise(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CustomExerciseInput) => updateExercise(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.exercises.all() });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.exercises.all() });
    },
  });
}

export function useExerciseUsage(id: string | undefined) {
  return useQuery({
    queryKey: ['exercises', 'usage', id],
    queryFn: () => countExerciseUsage(id!),
    enabled: Boolean(id),
  });
}
