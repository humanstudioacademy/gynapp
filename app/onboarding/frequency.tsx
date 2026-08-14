import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import { useCompleteOnboarding } from '@/features/onboarding/hooks';
import { OnboardingStep } from '@/features/onboarding/OnboardingStep';
import { useProfile, useSettings } from '@/features/profile/hooks';
import { weekdayLabels } from '@/i18n/labels';
import { maskTime, trimSeconds } from '@/utils/date';

const FREQUENCY_OPTIONS = [2, 3, 4, 5, 6] as const;

export default function OnboardingFrequencyScreen() {
  const { data: profile } = useProfile();
  const { data: settings } = useSettings();
  const complete = useCompleteOnboarding();
  const toast = useToast();

  const [weeklyGoal, setWeeklyGoal] = useState<number>(profile?.weekly_session_goal ?? 3);
  const [remindersEnabled, setRemindersEnabled] = useState(
    settings?.workout_reminders_enabled ?? true,
  );
  const [reminderTime, setReminderTime] = useState(trimSeconds(settings?.reminder_time) || '18:00');
  const [weekdays, setWeekdays] = useState<number[]>(settings?.reminder_weekdays ?? [1, 3, 5]);
  const [timeError, setTimeError] = useState<string | null>(null);

  function toggleWeekday(day: number) {
    setWeekdays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort(),
    );
  }

  async function finish() {
    if (remindersEnabled && !/^([01]\d|2[0-3]):[0-5]\d$/.test(reminderTime)) {
      setTimeError('Horário inválido. Use HH:MM.');
      return;
    }
    setTimeError(null);

    try {
      // A mutation grava o perfil novo no cache antes de navegar — é isso que
      // deixa o guard ver `onboarding_completed = true` já na primeira checagem.
      await complete.mutateAsync({
        weeklySessionGoal: weeklyGoal,
        remindersEnabled,
        reminderTime,
        reminderWeekdays: weekdays,
      });
      router.replace('/');
    } catch (error) {
      toast.show(authErrorMessage(error), 'error');
    }
  }

  return (
    <OnboardingStep
      step={4}
      title="Com que frequência você treina?"
      subtitle="Vira sua meta semanal — é o que alimenta a ofensiva e o card de progresso."
      nextLabel="Concluir"
      onNext={() => void finish()}
      loading={complete.isPending}
    >
      <View className="gap-6">
        <View className="gap-2">
          <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
            Treinos por semana
          </Text>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Treinos por semana"
            className="flex-row gap-2"
          >
            {FREQUENCY_OPTIONS.map((option) => {
              const selected = weeklyGoal === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setWeeklyGoal(option)}
                  accessibilityRole="radio"
                  accessibilityLabel={`${option} treinos por semana`}
                  accessibilityState={{ selected }}
                  className={`h-14 flex-1 items-center justify-center rounded-md border ${
                    selected
                      ? 'border-brand-500 bg-brand-500'
                      : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
                  }`}
                >
                  <Text
                    className={`text-lg font-semibold ${
                      selected ? 'text-neutral-950' : 'text-neutral-900 dark:text-neutral-50'
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Card className="gap-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-base font-medium text-neutral-900 dark:text-neutral-50">
                Lembrete de treino
              </Text>
              <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
                Uma notificação nos dias escolhidos.
              </Text>
            </View>
            <Switch
              label="Lembrete de treino"
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
            />
          </View>

          {remindersEnabled ? (
            <View className="gap-4">
              <Input
                label="Horário"
                value={reminderTime}
                onChangeText={(text) => setReminderTime(maskTime(text))}
                error={timeError ?? undefined}
                placeholder="18:00"
                keyboardType="number-pad"
                maxLength={5}
              />

              <View className="gap-2">
                <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
                  Dias
                </Text>
                <View className="flex-row gap-1.5">
                  {weekdayLabels.map((label, day) => {
                    const selected = weekdays.includes(day);
                    return (
                      <Pressable
                        key={label}
                        onPress={() => toggleWeekday(day)}
                        accessibilityRole="checkbox"
                        accessibilityLabel={label}
                        accessibilityState={{ checked: selected }}
                        className={`h-11 flex-1 items-center justify-center rounded-sm border ${
                          selected
                            ? 'border-brand-500 bg-brand-500'
                            : 'border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        <Text
                          className={`text-[13px] font-medium ${
                            selected ? 'text-neutral-950' : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          ) : null}
        </Card>
      </View>
    </OnboardingStep>
  );
}
