import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { authErrorMessage } from '@/features/auth/api';
import { supabase } from '@/lib/supabase/client';

/**
 * Destino do link de confirmação de e-mail (`gymapp://auth/callback?code=…`).
 * Troca o code por sessão e devolve o usuário ao fluxo normal — o guard decide
 * se cai no onboarding ou nas tabs.
 */
export default function AuthCallbackScreen() {
  const { code, error_description: errorDescription } = useLocalSearchParams<{
    code?: string;
    error_description?: string;
  }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function exchange() {
      if (errorDescription) {
        setError('Esse link expirou. Peça um novo e-mail de confirmação.');
        return;
      }
      if (!code) {
        setError('Link inválido. Peça um novo e-mail de confirmação.');
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (!active) return;

      if (exchangeError) setError(authErrorMessage(exchangeError));
      else router.replace('/');
    }

    void exchange();
    return () => {
      active = false;
    };
  }, [code, errorDescription]);

  return (
    <Screen scroll={false}>
      <View className="flex-1 items-center justify-center gap-4">
        {error ? (
          <>
            <Text className="text-center text-[22px] font-semibold text-neutral-900 dark:text-neutral-50">
              Não foi possível confirmar
            </Text>
            <Text className="text-center text-base text-neutral-500 dark:text-neutral-400">
              {error}
            </Text>
            <View className="mt-2 w-full">
              <Button
                title="Voltar para entrar"
                size="lg"
                fullWidth
                onPress={() => router.replace('/sign-in')}
              />
            </View>
          </>
        ) : (
          <>
            <ActivityIndicator />
            <Text className="text-base text-neutral-500 dark:text-neutral-400">
              Confirmando sua conta…
            </Text>
          </>
        )}
      </View>
    </Screen>
  );
}
