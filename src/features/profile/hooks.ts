import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import { qk } from '@/lib/query/keys';

import {
  fetchProfile,
  fetchSettings,
  updateProfile,
  updateSettings,
  uploadAvatar,
  type ProfileUpdate,
  type UserSettingsUpdate,
} from './api';

export function useProfile() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: qk.profile(),
    queryFn: fetchProfile,
    enabled: userId !== null,
  });
}

export function useSettings() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: qk.settings(),
    queryFn: fetchSettings,
    enabled: userId !== null,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: ProfileUpdate) => updateProfile(patch),
    onSuccess: (profile) => {
      queryClient.setQueryData(qk.profile(), profile);
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: UserSettingsUpdate) => updateSettings(patch),
    onSuccess: (settings) => {
      queryClient.setQueryData(qk.settings(), settings);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localUri: string) => uploadAvatar(localUri),
    onSuccess: (profile) => {
      queryClient.setQueryData(qk.profile(), profile);
    },
  });
}
