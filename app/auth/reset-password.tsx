import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage, updatePassword } from '@/features/auth/api';
import { resetPasswordSchema, type ResetPasswordInput } from '@/features/auth/schemas';
import { supabase } from '@/lib/supabase/client';

type Stage = 'exchanging' | 'ready' | 'failed';

/** Destino do link de recuperação (`gymapp://auth/reset-password?code=…`). */
export default function ResetPasswordScreen() {
  const { code, error_description: errorDescription } = useLocalSearchParams<{
    code?: string;
    error_description?: string;
  }>();
  const toast = useToast();
  const [stage, setStage] = useState<Stage>('exchanging');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    let active = true;

    async function exchange() {
      if (errorDescription || !code) {
        setLinkError('Esse link expirou ou já foi usado. Peça um novo e-mail.');
        setStage('failed');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!active) return;

      if (error) {
        setLinkError(authErrorMessage(error));
        setStage('failed');
      } else {
        setStage('ready');
      }
    }

    void exchange();
    return () => {
      active = false;
    };
  }, [code, errorDescription]);

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null);
    try {
      await updatePassword(values.password);
      toast.show('Senha alterada. Bom treino!', 'success');
      router.replace('/');
    } catch (error) {
      setFormError(authErrorMessage(error));
    }
  }

  if (stage === 'exchanging') {
    return (
      <Screen scroll={false}>
        <View className="flex-1 items-center justify-center gap-4">
          <ActivityIndicator />
          <Text className="text-base text-neutral-500 dark:text-neutral-400">
            Validando seu link…
          </Text>
        </View>
      </Screen>
    );
  }

  if (stage === 'failed') {
    return (
      <Screen scroll={false}>
        <Header title="Nova senha" onBack={() => router.replace('/sign-in')} />
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-center text-[22px] font-semibold text-neutral-900 dark:text-neutral-50">
            Link inválido
          </Text>
          <Text className="text-center text-base text-neutral-500 dark:text-neutral-400">
            {linkError}
          </Text>
        </View>
        <View className="pb-4">
          <Button
            title="Pedir novo link"
            size="lg"
            fullWidth
            onPress={() => router.replace('/forgot-password')}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <Header title="Nova senha" hideBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 gap-4 pt-4">
          <Text className="text-base leading-6 text-neutral-500 dark:text-neutral-400">
            Escolha uma nova senha para sua conta.
          </Text>

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <Input
                label="Nova senha"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                hint="Pelo menos 8 caracteres, com letra e número."
                secure
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <Input
                label="Confirmar nova senha"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                secure
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="go"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          {formError ? (
            <Text accessibilityRole="alert" className="text-[15px] text-danger">
              {formError}
            </Text>
          ) : null}
        </View>

        <View className="pb-4">
          <Button
            title="Salvar nova senha"
            size="lg"
            fullWidth
            loading={formState.isSubmitting}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
