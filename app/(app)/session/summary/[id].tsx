import { router, useLocalSearchParams } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import type { FinishResult } from '@/features/session/api';
import { useFinishSession, useSaveSessionFeedback } from '@/features/session/hooks';
import { FEELING_EMOJI, RECORD_LABEL, RECORD_UNIT } from '@/features/session/labels';
import { useSettings } from '@/features/profile/hooks';
import { palette } from '@/theme/tokens';
import { formatDuration, formatVolume, formatWeight } from '@/utils/format';
import { displayWeight, weightUnit, type UnitSystem } from '@/utils/units';

function recordValue(
  type: keyof typeof RECORD_UNIT,
  value: number,
  unitSystem: UnitSystem,
): string {
  switch (RECORD_UNIT[type]) {
    case 'weight':
      return formatWeight(displayWeight(value, unitSystem), weightUnit(unitSystem));
    case 'reps':
      return `${Math.round(value)} reps`;
    case 'seconds':
      return `${Math.round(value)}s`;
    case 'meters':
      return `${Math.round(value)} m`;
  }
}

export default function SessionSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = id ?? '';
  const finishSession = useFinishSession();
  const saveFeedback = useSaveSessionFeedback();
  const { data: settings } = useSettings();
  const toast = useToast();

  const unitSystem = settings?.unit_system ?? 'metric';

  const [result, setResult] = useState<FinishResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feeling, setFeeling] = useState<number | null>(null);
  const [effort, setEffort] = useState('');
  const [notes, setNotes] = useState('');

  // Fecha a sessão uma única vez ao entrar — a RPC calcula os totais e devolve
  // os recordes. `finished` evita disparar de novo em re-render.
  const finished = useRef(false);

  useEffect(() => {
    if (finished.current || !sessionId) return;
    finished.current = true;

    finishSession.mutate(
      { sessionId },
      {
        onSuccess: setResult,
        onError: (caught) => setError(authErrorMessage(caught)),
      },
    );
  }, [sessionId, finishSession]);

  if (error) {
    return (
      <Screen scroll={false}>
        <View className="flex-1 justify-center">
          <ErrorState message={error} onRetry={() => router.replace('/')} />
        </View>
      </Screen>
    );
  }

  if (!result) {
    return (
      <Screen scroll={false}>
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator />
          <Text className="text-[15px] text-neutral-500 dark:text-neutral-400">
            Fechando seu treino…
          </Text>
        </View>
      </Screen>
    );
  }

  const records = result.records ?? [];

  return (
    <Screen>
      <View className="gap-6 py-6">
        <View className="items-center gap-2">
          <Text className="text-5xl">🎉</Text>
          <Text className="text-center text-[28px] font-bold text-neutral-900 dark:text-neutral-50">
            Treino concluído!
          </Text>
        </View>

        <View className="flex-row gap-3">
          <Stat label="duração" value={formatDuration(result.duration)} />
          <Stat label="volume" value={formatVolume(result.total_volume)} />
          <Stat label="séries" value={String(result.total_sets)} />
        </View>

        {records.length > 0 ? (
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Trophy size={18} color={palette.accent.pr} />
              <Text className="text-[13px] font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-50">
                {records.length} {records.length === 1 ? 'novo recorde' : 'novos recordes'}
              </Text>
            </View>

            {records.map((record) => {
              const gain =
                record.previous != null ? record.value - record.previous : null;

              return (
                <Card key={`${record.exercise_id}-${record.record_type}`} className="gap-1">
                  <Text className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50">
                    {record.exercise_name}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[15px] text-neutral-600 dark:text-neutral-300">
                      {RECORD_LABEL[record.record_type]}:{' '}
                      {recordValue(record.record_type, record.value, unitSystem)}
                    </Text>
                    {gain != null && gain > 0 ? (
                      <Text className="text-[13px] font-semibold text-success-ink dark:text-success">
                        ▲ +{recordValue(record.record_type, gain, unitSystem)}
                      </Text>
                    ) : null}
                  </View>
                </Card>
              );
            })}
          </View>
        ) : null}

        <View className="gap-3">
          <Text className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Como foi o treino?
          </Text>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Como foi o treino"
            className="flex-row justify-between"
          >
            {FEELING_EMOJI.map((emoji, index) => {
              const value = index + 1;
              const selected = feeling === value;
              return (
                <Pressable
                  key={emoji}
                  onPress={() => setFeeling(selected ? null : value)}
                  accessibilityRole="radio"
                  accessibilityLabel={`Sensação ${value} de 5`}
                  accessibilityState={{ selected }}
                  className={`h-14 w-14 items-center justify-center rounded-full border ${
                    selected
                      ? 'border-brand-500 bg-brand-50 dark:bg-neutral-800'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <Text className="text-2xl">{emoji}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Input
          label="Esforço percebido (1 a 10)"
          value={effort}
          onChangeText={setEffort}
          keyboardType="number-pad"
          placeholder="7"
          maxLength={2}
        />

        <Input
          label="Anotações (opcional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Como você se sentiu, o que mudar da próxima vez…"
          autoCapitalize="sentences"
        />

        <Button
          title="Concluir"
          size="lg"
          fullWidth
          loading={saveFeedback.isPending}
          onPress={() => {
            const effortValue = effort.trim() === '' ? null : Number(effort);
            if (effortValue != null && (!Number.isFinite(effortValue) || effortValue < 1 || effortValue > 10)) {
              toast.show('O esforço vai de 1 a 10.', 'error');
              return;
            }

            saveFeedback.mutate(
              {
                sessionId,
                effort: effortValue,
                feeling,
                notes: notes.trim() === '' ? null : notes.trim(),
              },
              {
                onSuccess: () => router.replace('/'),
                onError: (caught) => toast.show(authErrorMessage(caught), 'error'),
              },
            );
          }}
          testID="summary-done"
        />
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center rounded-lg border border-neutral-200 bg-white py-4 dark:border-neutral-800 dark:bg-neutral-900">
      <Text
        style={{ fontVariant: ['tabular-nums'] }}
        className="text-[20px] font-bold text-neutral-900 dark:text-neutral-50"
      >
        {value}
      </Text>
      <Text className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </Text>
    </View>
  );
}
