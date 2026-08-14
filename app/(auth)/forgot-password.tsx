import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { authErrorMessage, requestPasswordReset } from '@/features/auth/api';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/features/auth/schemas';
import { useTheme } from '@/theme/ThemeProvider';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(null);
    const email = values.email.trim().toLowerCase();
    try {
      await requestPasswordReset(email);
      setSentTo(email);
    } catch (error) {
      setFormError(authErrorMessage(error));
    }
  }

  if (sentTo) {
    return (
      <Screen scroll={false}>
        <Header title="Esqueci a senha" />
        <View className="flex-1 items-center justify-center gap-4 px-2">
          <MailCheck size={56} color={colors.primary} strokeWidth={1.5} />
          <Text className="text-center text-[22px] font-semibold text-neutral-900 dark:text-neutral-50">
            Link enviado
          </Text>
          <Text className="text-center text-base leading-6 text-neutral-500 dark:text-neutral-400">
            Se existe uma conta com {sentTo}, você vai receber um e-mail com o link para criar uma
            nova senha.
          </Text>
        </View>
        <View className="pb-4">
          <Button
            title="Voltar para entrar"
            size="lg"
            fullWidth
            onPress={() => router.replace('/sign-in')}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <Header title="Esqueci a senha" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 gap-4 pt-4">
          <Text className="text-base leading-6 text-neutral-500 dark:text-neutral-400">
            Informe o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha.
          </Text>

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
            title="Enviar link"
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
