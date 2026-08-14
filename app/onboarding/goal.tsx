import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { OptionCard } from '@/components/ui/OptionCard';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import type { ExperienceLevel, FitnessGoal } from '@/features/onboarding/api';
import { useSaveGoalStep } from '@/features/onboarding/hooks';
import { OnboardingStep } from '@/features/onboarding/OnboardingStep';
import { useProfile } from '@/features/profile/hooks';
import {
  GOAL_OPTIONS,
  goalDescription,
  goalLabel,
  LEVEL_OPTIONS,
  levelDescription,
  levelLabel,
} from '@/i18n/labels';

export default function OnboardingGoalScreen() {
  const { data: profile } = useProfile();
  const saveStep = useSaveGoalStep();
  const toast = useToast();

  const [primaryGoal, setPrimaryGoal] = useState<FitnessGoal>(profile?.primary_goal ?? 'gain_muscle');
  const [level, setLevel] = useState<ExperienceLevel>(profile?.experience_level ?? 'beginner');

  async function onNext() {
    try {
      await saveStep.mutateAsync({ primaryGoal, experienceLevel: level });
      router.push('/onboarding/frequency');
    } catch (error) {
      toast.show(authErrorMessage(error), 'error');
    }
  }

  return (
    <OnboardingStep
      step={3}
      title="O que você quer alcançar?"
      subtitle="Usamos isso para sugerir a rotina pronta que mais combina com você."
      onNext={() => void onNext()}
      onSkip={() => router.push('/onboarding/frequency')}
      loading={saveStep.isPending}
    >
      <View className="gap-6">
        <View accessibilityRole="radiogroup" accessibilityLabel="Objetivo principal" className="gap-2">
          {GOAL_OPTIONS.map((option) => (
            <OptionCard
              key={option}
              title={goalLabel[option]}
              description={goalDescription[option]}
              selected={primaryGoal === option}
              onPress={() => setPrimaryGoal(option)}
            />
          ))}
        </View>

        <View className="gap-2">
          <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
            Seu nível hoje
          </Text>
          <View accessibilityRole="radiogroup" accessibilityLabel="Nível de experiência" className="gap-2">
            {LEVEL_OPTIONS.map((option) => (
              <OptionCard
                key={option}
                title={levelLabel[option]}
                description={levelDescription[option]}
                selected={level === option}
                onPress={() => setLevel(option)}
              />
            ))}
          </View>
        </View>
      </View>
    </OnboardingStep>
  );
}
