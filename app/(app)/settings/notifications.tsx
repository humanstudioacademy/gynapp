import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import type { UserSettings } from '@/features/profile/api';
import { useSettings, useUpdateSettings } from '@/features/profile/hooks';
import { weekdayLabels } from '@/i18n/labels';
import { maskTime, trimSeconds } from '@/utils/date';

export default function NotificationSettingsScreen() {
  const settings = useSettings();

  return (
    <Screen>
      <Header title="Notificações" />
      {settings.isPending ? (
        <View className="py-12">
          <ActivityIndicator />
        </View>
      ) : settings.isError || !settings.data ? (
        <ErrorState onRetry={() => void settings.refetch()} />
      ) : (
        // A key remonta o formulário quando as preferências do servidor mudam,
        // em vez de sincronizar estado dentro de efeito.
        <NotificationsForm key={settings.data.updated_at} settings={settings.data} />
      )}
    </Screen>
  );
}

function NotificationsForm({ settings }: { settings: UserSettings }) {
  const updateSettings = useUpdateSettings();
  const toast = useToast();

  const [remindersEnabled, setRemindersEnabled] = useState(settings.workout_reminders_enabled);
  const [reminderTime, setReminderTime] = useState(trimSeconds(settings.reminder_time) || '18:00');
  const [weekdays, setWeekdays] = useState<number[]>(settings.reminder_weekdays);
  const [soundEnabled, setSoundEnabled] = useState(settings.rest_timer_sound);
  const [vibrateEnabled, setVibrateEnabled] = useState(settings.rest_timer_vibrate);
  const [autoStart, setAutoStart] = useState(settings.rest_timer_auto_start);
  const [timeError, setTimeError] = useState<string | null>(null);

  function toggleWeekday(day: number) {
    setWeekdays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort(),
    );
  }

  async function onSave() {
    if (remindersEnabled && !/^([01]\d|2[0-3]):[0-5]\d$/.test(reminderTime)) {
      setTimeError('Horário inválido. Use HH:MM.');
      return;
    }
    setTimeError(null);

    try {
      await updateSettings.mutateAsync({
        workout_reminders_enabled: remindersEnabled,
        reminder_time: reminderTime,
        reminder_weekdays: weekdays,
        rest_timer_sound: soundEnabled,
        rest_timer_vibrate: vibrateEnabled,
        rest_timer_auto_start: autoStart,
      });
      toast.show('Preferências salvas.', 'success');
    } catch (error) {
      toast.show(authErrorMessage(error), 'error');
    }
  }

  return (
    <View className="gap-6 py-2">
      <Card className="gap-4">
        <ToggleRow
          title="Lembrete de treino"
          description="Uma notificação nos dias e horário escolhidos."
          value={remindersEnabled}
          onValueChange={setRemindersEnabled}
        />

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
                          ? 'border-brand-400 bg-brand-400'
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

      <Card className="gap-4">
        <Text className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Timer de descanso
        </Text>
        <ToggleRow
          title="Iniciar sozinho"
          description="Começa a contar assim que você marca uma série."
          value={autoStart}
          onValueChange={setAutoStart}
        />
        <ToggleRow title="Som ao terminar" value={soundEnabled} onValueChange={setSoundEnabled} />
        <ToggleRow
          title="Vibrar ao terminar"
          value={vibrateEnabled}
          onValueChange={setVibrateEnabled}
        />
      </Card>

      <Button
        title="Salvar"
        size="lg"
        fullWidth
        loading={updateSettings.isPending}
        onPress={() => void onSave()}
      />

      <Text className="text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
        O agendamento das notificações locais entra na Fase 6, junto do restante das metas.
      </Text>
    </View>
  );
}

function ToggleRow({
  title,
  description,
  value,
  onValueChange,
}: {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-1">
        <Text className="text-base text-neutral-900 dark:text-neutral-50">{title}</Text>
        {description ? (
          <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">{description}</Text>
        ) : null}
      </View>
      <Switch label={title} value={value} onValueChange={onValueChange} />
    </View>
  );
}
