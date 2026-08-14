import { router } from 'expo-router';
import { Pause, Play, Plus, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseCard } from '@/components/session/ExerciseCard';
import { RestTimerBar } from '@/components/session/RestTimerBar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import { useExercisePicker } from '@/features/exercises/pickerStore';
import {
  useActiveSession,
  useAddSessionExercise,
  useAddSet,
  useCancelSession,
  useLastPerformances,
  useRemoveSessionExercise,
  useRemoveSet,
  useTogglePause,
  useUpdateSet,
} from '@/features/session/hooks';
import { useKeepScreenOn } from '@/features/session/useKeepScreenOn';
import { useRestTimer } from '@/features/session/useRestTimer';
import { useSessionClock } from '@/features/session/useSessionClock';
import { useSettings } from '@/features/profile/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { formatTimer } from '@/utils/format';

export default function ActiveSessionScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const toast = useToast();
  const session = useActiveSession();
  const { data: settings } = useSettings();

  const data = session.data;
  const sessionId = data?.id ?? '';
  const unitSystem = settings?.unit_system ?? 'metric';

  // Tela ligada durante o treino, se o usuário quiser (docs/08, Fase 4).
  useKeepScreenOn(settings?.keep_screen_on ?? true);

  const updateSet = useUpdateSet();
  const addSet = useAddSet();
  const removeSet = useRemoveSet();
  const addExercise = useAddSessionExercise(sessionId);
  const removeExercise = useRemoveSessionExercise();
  const cancelSession = useCancelSession();
  const togglePause = useTogglePause();

  const [exitSheet, setExitSheet] = useState(false);
  const [pausedAt, setPausedAt] = useState<number | null>(null);

  const restTimer = useRestTimer({
    soundEnabled: settings?.rest_timer_sound ?? true,
    vibrateEnabled: settings?.rest_timer_vibrate ?? true,
  });

  const elapsed = useSessionClock({
    startedAt: data?.started_at ?? null,
    pausedSeconds: data?.paused_seconds ?? 0,
    pausedAt,
  });

  const exerciseIds = (data?.exercises ?? [])
    .map((item) => item.exercise?.id)
    .filter((id): id is string => Boolean(id));
  const lastPerformances = useLastPerformances(exerciseIds);

  // Exercícios escolhidos no seletor entram na sessão em andamento.
  const { selection, version } = useExercisePicker();
  const seenVersion = useRef(version);

  useEffect(() => {
    if (version === seenVersion.current) return;
    seenVersion.current = version;
    if (selection.length === 0 || !sessionId) return;

    addExercise.mutate(selection, {
      onError: (error) => toast.show(authErrorMessage(error), 'error'),
    });
  }, [version, selection, sessionId, addExercise, toast]);

  if (session.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <ActivityIndicator />
      </View>
    );
  }

  if (session.isError) {
    return (
      <View
        style={{ paddingTop: insets.top }}
        className="flex-1 justify-center bg-neutral-50 dark:bg-neutral-950"
      >
        <ErrorState onRetry={() => void session.refetch()} />
      </View>
    );
  }

  // Sem sessão ativa (finalizada ou descartada), o player mostra o estado vazio
  // em vez de redirecionar: um `router.replace` aqui atropelava a tela de resumo,
  // porque o player continua montado na stack enquanto ela abre por cima.
  if (!data) {
    return (
      <View
        style={{ paddingTop: insets.top }}
        className="flex-1 justify-center bg-neutral-50 dark:bg-neutral-950"
      >
        <EmptyState
          icon={Plus}
          title="Nenhum treino em andamento"
          description="Escolha uma ficha na aba Treinos para começar."
          actionLabel="Ir para Treinos"
          onAction={() => router.replace('/workouts')}
        />
      </View>
    );
  }

  const allSets = data.exercises.flatMap((item) => item.sets);
  const doneSets = allSets.filter((set) => set.is_completed).length;
  const progress = allSets.length > 0 ? doneSets / allSets.length : 0;
  const isPaused = pausedAt != null;

  function fail(error: unknown) {
    toast.show(authErrorMessage(error), 'error');
  }

  /** Marcar série: escrita otimista + inicia o descanso do exercício. */
  function toggleSet(setId: string, completed: boolean, restSeconds: number, name?: string) {
    updateSet.mutate({ setId, patch: { is_completed: completed } }, { onError: fail });

    if (completed && (settings?.rest_timer_auto_start ?? true)) {
      restTimer.start(restSeconds, name);
    }
  }

  function handlePause() {
    if (!data) return;
    togglePause.mutate(
      { sessionId, pausedAt, pausedSeconds: data.paused_seconds ?? 0 },
      {
        onSuccess: () => setPausedAt(pausedAt == null ? Date.now() : null),
        onError: fail,
      },
    );
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <View className="flex-row items-center gap-2 px-2 py-2">
        <Pressable
          onPress={() => setExitSheet(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Sair do treino"
          className="h-11 w-11 items-center justify-center"
        >
          <X size={24} color={colors.text} />
        </Pressable>

        <View className="flex-1">
          <Text numberOfLines={1} className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-50">
            {data.name}
          </Text>
          <Text className="text-[12px] text-neutral-500 dark:text-neutral-400">
            {doneSets}/{allSets.length} séries
          </Text>
        </View>

        <Text
          style={{ fontVariant: ['tabular-nums'] }}
          className="text-[20px] font-bold text-neutral-900 dark:text-neutral-50"
        >
          {formatTimer(elapsed)}
        </Text>

        <Pressable
          onPress={handlePause}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isPaused ? 'Retomar treino' : 'Pausar treino'}
          className="h-11 w-11 items-center justify-center"
        >
          {isPaused ? <Play size={20} color={colors.text} /> : <Pause size={20} color={colors.text} />}
        </Pressable>
      </View>

      <View className="h-1 w-full bg-neutral-200 dark:bg-neutral-800">
        <View style={{ width: `${progress * 100}%` }} className="h-full bg-brand-500" />
      </View>

      {isPaused ? (
        <View className="bg-warning/20 px-4 py-2">
          <Text className="text-center text-[13px] font-medium text-neutral-900 dark:text-neutral-50">
            Treino pausado — o tempo parado não conta na duração
          </Text>
        </View>
      ) : null}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {data.exercises.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Treino livre"
            description="Adicione os exercícios que você for fazer. Dá para escolher vários de uma vez."
            actionLabel="Adicionar exercícios"
            onAction={() => router.push('/exercise-picker')}
          />
        ) : (
          data.exercises.map((item) => (
            <ExerciseCard
              key={item.id}
              item={item}
              unitSystem={unitSystem}
              last={lastPerformances.data?.find((row) => row.exercise_id === item.exercise?.id)}
              onChangeSet={(setId, patch) =>
                updateSet.mutate({ setId, patch }, { onError: fail })
              }
              onToggleSet={(setId, completed) =>
                toggleSet(
                  setId,
                  completed,
                  item.prescription?.target_rest_seconds ?? settings?.default_rest_seconds ?? 90,
                  item.exercise?.name_pt,
                )
              }
              onRemoveSet={(setId) => removeSet.mutate(setId, { onError: fail })}
              onAddSet={() => {
                const lastSet = item.sets[item.sets.length - 1];
                addSet.mutate(
                  {
                    sessionExerciseId: item.id,
                    template: {
                      weight_kg: lastSet?.weight_kg ?? null,
                      reps: lastSet?.reps ?? null,
                      duration_seconds: lastSet?.duration_seconds ?? null,
                    },
                  },
                  { onError: fail },
                );
              }}
              onRemoveExercise={() => removeExercise.mutate(item.id, { onError: fail })}
            />
          ))
        )}

        {data.exercises.length > 0 ? (
          <Button
            title="Adicionar exercício"
            variant="secondary"
            fullWidth
            onPress={() => router.push('/exercise-picker')}
          />
        ) : null}
      </ScrollView>

      {restTimer.remaining != null ? (
        <RestTimerBar
          remaining={restTimer.remaining}
          total={restTimer.total}
          onAdjust={restTimer.adjust}
          onSkip={restTimer.skip}
        />
      ) : null}

      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="border-t border-neutral-200 bg-neutral-50 px-4 pt-3 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <Button
          title="Finalizar treino"
          size="lg"
          fullWidth
          disabled={doneSets === 0}
          onPress={() => router.push(`/session/summary/${sessionId}`)}
          testID="finish-session"
        />
        {doneSets === 0 ? (
          <Text className="mt-2 text-center text-[12px] text-neutral-500 dark:text-neutral-400">
            Marque pelo menos uma série para finalizar
          </Text>
        ) : null}
      </View>

      <Sheet visible={exitSheet} onClose={() => setExitSheet(false)} title="Sair do treino">
        <View className="gap-3">
          <Text className="text-[15px] leading-6 text-neutral-600 dark:text-neutral-400">
            O treino continua salvo se você sair — dá para retomar de onde parou.
          </Text>
          <Button
            title="Continuar depois"
            size="lg"
            fullWidth
            onPress={() => {
              setExitSheet(false);
              router.replace('/');
            }}
          />
          <Button
            title="Descartar treino"
            variant="danger"
            size="lg"
            fullWidth
            loading={cancelSession.isPending}
            onPress={() =>
              cancelSession.mutate(sessionId, {
                onSuccess: () => {
                  setExitSheet(false);
                  toast.show('Treino descartado.', 'info');
                  router.replace('/');
                },
                onError: fail,
              })
            }
          />
          <Button
            title="Cancelar"
            variant="secondary"
            size="lg"
            fullWidth
            onPress={() => setExitSheet(false)}
          />
        </View>
      </Sheet>
    </View>
  );
}
