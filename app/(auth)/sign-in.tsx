import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { authErrorMessage, signIn } from '@/features/auth/api';
import { signInSchema, type SignInInput } from '@/features/auth/schemas';

export default function SignInScreen() {
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: SignInInput) {
    setFormError(null);
    try {
      await signIn(values.email.trim().toLowerCase(), values.password);
      // O guard leva para as tabs (ou para o onboarding) assim que a sessão chega.
    } catch (error) {
      setFormError(authErrorMessage(error));
    }
  }

  return (
    <Screen scroll={false}>
      <Header title="Entrar" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 gap-4 pt-4">
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Input
                label="E-mail"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                placeholder="voce@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                textContentType="emailAddress"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <Input
                label="Senha"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                placeholder="sua senha"
                secure
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <Pressable
            onPress={() => router.push('/forgot-password')}
            hitSlop={8}
            accessibilityRole="link"
            accessibilityLabel="Esqueci minha senha"
            className="self-start"
          >
            <Text className="text-[15px] font-medium text-brand-600 dark:text-brand-500">
              Esqueci minha senha
            </Text>
          </Pressable>

          {formError ? (
            <Text accessibilityRole="alert" className="text-[15px] text-danger">
              {formError}
            </Text>
          ) : null}
        </View>

        <View className="gap-3 pb-4">
          <Button
            title="Entrar"
            size="lg"
            fullWidth
            loading={formState.isSubmitting}
            onPress={handleSubmit(onSubmit)}
            testID="sign-in-submit"
          />
          <Pressable
            onPress={() => router.replace('/sign-up')}
            accessibilityRole="link"
            accessibilityLabel="Criar uma conta"
            className="h-11 items-center justify-center"
          >
            <Text className="text-[15px] text-neutral-500 dark:text-neutral-400">
              Não tem conta? <Text className="font-semibold text-brand-600 dark:text-brand-500">Criar agora</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
