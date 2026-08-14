import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { authErrorMessage, signUp } from '@/features/auth/api';
import { signUpSchema, type SignUpInput } from '@/features/auth/schemas';
import { useTheme } from '@/theme/ThemeProvider';

export default function SignUpScreen() {
  const [formError, setFormError] = useState<string | null>(null);
  const { colors } = useTheme();

  const { control, handleSubmit, formState } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false as unknown as true,
    },
  });

  async function onSubmit(values: SignUpInput) {
    setFormError(null);
    const email = values.email.trim().toLowerCase();
    try {
      const { needsEmailConfirmation } = await signUp(email, values.password, values.fullName.trim());
      if (needsEmailConfirmation) {
        router.replace({ pathname: '/verify-email', params: { email } });
      }
      // Com confirmação desabilitada a sessão já vem pronta e o guard assume.
    } catch (error) {
      setFormError(authErrorMessage(error));
    }
  }

  return (
    <Screen scroll={false}>
      <Header title="Criar conta" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 gap-4 pt-4">
          <Controller
            control={control}
            name="fullName"
            render={({ field, fieldState }) => (
              <Input
                label="Nome"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                placeholder="Como quer ser chamado"
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
              />
            )}
          />

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
                hint="Pelo menos 8 caracteres, com letra e número."
                placeholder="crie uma senha"
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
                label="Confirmar senha"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                placeholder="repita a senha"
                secure
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="go"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <Controller
            control={control}
            name="acceptedTerms"
            render={({ field, fieldState }) => (
              <View className="gap-1.5">
                <Pressable
                  onPress={() => field.onChange(!field.value)}
                  accessibilityRole="checkbox"
                  accessibilityLabel="Aceito os Termos de Uso e a Política de Privacidade"
                  accessibilityState={{ checked: Boolean(field.value) }}
                  className="min-h-[44px] flex-row items-center gap-3"
                >
                  <View
                    className={`h-6 w-6 items-center justify-center rounded-sm border ${
                      field.value
                        ? 'border-brand-500 bg-brand-500'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    {field.value ? <Check size={16} color={colors.textInverse} /> : null}
                  </View>
                  <Text className="flex-1 text-[15px] text-neutral-600 dark:text-neutral-400">
                    Li e aceito os Termos de Uso e a Política de Privacidade.
                  </Text>
                </Pressable>
                {fieldState.error ? (
                  <Text accessibilityRole="alert" className="text-[13px] text-danger">
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </View>
            )}
          />

          {formError ? (
            <Text accessibilityRole="alert" className="text-[15px] text-danger">
              {formError}
            </Text>
          ) : null}
        </View>

        <View className="gap-3 pb-4">
          <Button
            title="Criar conta"
            size="lg"
            fullWidth
            loading={formState.isSubmitting}
            onPress={handleSubmit(onSubmit)}
            testID="sign-up-submit"
          />
          <Pressable
            onPress={() => router.replace('/sign-in')}
            accessibilityRole="link"
            accessibilityLabel="Já tenho conta"
            className="h-11 items-center justify-center"
          >
            <Text className="text-[15px] text-neutral-500 dark:text-neutral-400">
              Já tem conta?{' '}
              <Text className="font-semibold text-brand-600 dark:text-brand-500">Entrar</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
