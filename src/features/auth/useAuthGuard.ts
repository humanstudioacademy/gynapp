import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useProfile } from '@/features/profile/hooks';

import { useAuth } from './AuthProvider';

/**
 * Guards de navegação — docs/04, seção 1.5.
 *
 * | Grupo         | Condição                          | Vai para             |
 * |---------------|-----------------------------------|----------------------|
 * | `(auth)/*`    | já tem sessão                     | `/` (tabs)           |
 * | `onboarding/*`| sem sessão                        | `/welcome`           |
 * | `(app)/*`     | sem sessão                        | `/welcome`           |
 * | `(app)/*`     | sessão OK, onboarding incompleto  | `/onboarding/profile`|
 *
 * As rotas de deep link (`/auth/*`) ficam de fora: elas cuidam da própria
 * navegação depois de trocar o code por sessão.
 */
export function useAuthGuard() {
  const { session, isLoading } = useAuth();
  const profile = useProfile();
  const segments = useSegments();
  const router = useRouter();

  const onboardingCompleted = profile.data?.onboarding_completed ?? false;
  const profilePending = profile.isPending;

  useEffect(() => {
    if (isLoading) return;

    const group = segments[0];
    if (group === 'auth') return; // deep links se viram sozinhos

    const inAuth = group === '(auth)';
    const inOnboarding = group === 'onboarding';

    if (!session) {
      if (!inAuth) router.replace('/welcome');
      return;
    }

    // Com sessão, só dá para decidir depois que o perfil chega.
    if (profilePending) return;

    if (!onboardingCompleted) {
      if (!inOnboarding) router.replace('/onboarding/profile');
      return;
    }

    if (inAuth || inOnboarding) router.replace('/');
  }, [isLoading, session, profilePending, onboardingCompleted, segments, router]);
}
