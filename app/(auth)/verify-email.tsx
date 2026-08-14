import { router, useLocalSearchParams } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage, resendConfirmation } from '@/features/auth/api';
import { useTheme } from '@/theme/ThemeProvider';

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { colors } = useTheme();
  const toast = useToast();
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function onResend() {
    if (!email) return;
    setSending(true);
    try {
      await resendConfirmation(email);
      setCooldown(COOLDOWN_SECONDS);
      toast.show('E-mail reenviado. Confira sua caixa de entrada.', 'success');
    } catch (error) {
      toast.show(authErrorMessage(error), 'error');
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen scroll={false}>
      <Header title="Verifique seu e-mail" onBack={() => router.replace('/sign-in')} />

      <View className="flex-1 items-center justify-center gap-4 px-2">
        <MailCheck size={56} color={colors.primary} strokeWidth={1.5} />
        <Text className="text-center text-[22px] font-semibold text-neutral-900 dark:text-neutral-50">
          Enviamos um link para você
        </Text>
        <Text className="text-center text-base leading-6 text-neutral-500 dark:text-neutral-400">
          {email
            ? `Abra o e-mail que mandamos para ${email} e toque no link para confirmar sua conta.`
            : 'Abra o e-mail que mandamos e toque no link para confirmar sua conta.'}
        </Text>
        <Text className="text-center text-[13px] text-neutral-500 dark:text-neutral-400">
          Não chegou? Verifique a caixa de spam.
        </Text>
      </View>

      <View className="gap-3 pb-4">
        <Button
          title={cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar e-mail'}
          size="lg"
          fullWidth
          variant="secondary"
          disabled={cooldown > 0 || !email}
          loading={sending}
          onPress={() => void onResend()}
        />
        <Button
          title="Voltar para entrar"
          variant="ghost"
          fullWidth
          onPress={() => router.replace('/sign-in')}
        />
      </View>
    </Screen>
  );
}
