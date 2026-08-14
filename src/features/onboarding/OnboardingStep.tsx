import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { ProgressBar } from '@/components/ui/ProgressBar';

const TOTAL_STEPS = 4;

type Props = {
  step: 1 | 2 | 3 | 4;
  title: string;
  subtitle?: string;
  children: ReactNode;
  nextLabel?: string;
  onNext: () => void;
  nextDisabled?: boolean;
  loading?: boolean;
  /** "Pular por enquanto" — indisponível no primeiro passo (docs/05). */
  onSkip?: () => void;
};

export function OnboardingStep({
  step,
  title,
  subtitle,
  children,
  nextLabel = 'Continuar',
  onNext,
  nextDisabled = false,
  loading = false,
  onSkip,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-neutral-50 dark:bg-neutral-950"
    >
      <Header
        title={`${step} de ${TOTAL_STEPS}`}
        hideBack={step === 1}
        onBack={() => (router.canGoBack() ? router.back() : null)}
      />

      <View className="px-4">
        <ProgressBar value={step / TOTAL_STEPS} label={`Passo ${step} de ${TOTAL_STEPS}`} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-2 py-6">
            <Text className="text-[28px] font-bold leading-9 text-neutral-900 dark:text-neutral-50">
              {title}
            </Text>
            {subtitle ? (
              <Text className="text-base leading-6 text-neutral-500 dark:text-neutral-400">
                {subtitle}
              </Text>
            ) : null}
          </View>

          {children}
        </ScrollView>

        <View style={{ paddingBottom: insets.bottom + 16 }} className="gap-2 px-4">
          <Button
            title={nextLabel}
            size="lg"
            fullWidth
            disabled={nextDisabled}
            loading={loading}
            onPress={onNext}
            testID={`onboarding-next-${step}`}
          />
          {onSkip ? (
            <Button title="Pular por enquanto" variant="ghost" fullWidth onPress={onSkip} />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
