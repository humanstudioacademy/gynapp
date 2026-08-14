import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Profile, UserSettings } from '@/features/profile/api';
import { qk } from '@/lib/query/keys';

import { completeOnboarding, saveBodyStep, saveGoalStep, saveProfileStep } from './api';

/**
 * Cada passo escreve o resultado do servidor direto no cache.
 * Sem isso o guard de rota continuaria lendo `onboarding_completed = false`
 * e devolveria o usuário ao passo 1 logo depois de concluir.
 */
function useCacheWriter() {
  const queryClient = useQueryClient();

  return {
    setProfile: (profile: Profile) => queryClient.setQueryData(qk.profile(), profile),
    setSettings: (settings: UserSettings) => queryClient.setQueryData(qk.settings(), settings),
    invalidateMeasurements: () =>
      queryClient.invalidateQueries({ queryKey: qk.body.measurements() }),
  };
}

export function useSaveProfileStep() {
  const cache = useCacheWriter();

  return useMutation({
    mutationFn: saveProfileStep,
    onSuccess: cache.setProfile,
  });
}

export function useSaveBodyStep() {
  const cache = useCacheWriter();

  return useMutation({
    mutationFn: saveBodyStep,
    onSuccess: ({ profile, settings }) => {
      cache.setProfile(profile);
      cache.setSettings(settings);
      void cache.invalidateMeasurements();
    },
  });
}

export function useSaveGoalStep() {
  const cache = useCacheWriter();

  return useMutation({
    mutationFn: saveGoalStep,
    onSuccess: cache.setProfile,
  });
}

export function useCompleteOnboarding() {
  const cache = useCacheWriter();

  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: ({ profile, settings }) => {
      cache.setProfile(profile);
      cache.setSettings(settings);
    },
  });
}
