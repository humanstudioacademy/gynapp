import { router, useLocalSearchParams } from 'expo-router';
import { Clock, Pencil, Play } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { ExerciseThumb } from '@/components/exercise/ExerciseThumb';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { useDayDetail } from '@/features/plans/hooks';
import { useSettings } from '@/features/profile/hooks';
import { prescriptionSummary, supersetLabel } from '@/features/plans/format';
import { useTheme } from '@/theme/ThemeProvider';
import { estimateDayMinutes } from '@/utils/calculations';

export default function DayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const day = useDayDetail(id);
  const { data: settings } = useSettings();
  const { colors } = useTheme();

  const unitSystem = settings?.unit_system ?? 'metric';
  const data = day.data;

  if (day.isPending) {
    return (
      <Screen scroll={false}>
        <Header />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (day.isError || !data) {
    return (
      <Screen scroll={false}>
        <Header />
        <View className="flex-1 justify-center">
          <ErrorState onRetry={() => void day.refetch()} />
        </View>
      </Screen>
    );
  }

  const minutes = estimateDayMinutes(
    data.exercises.map((item) => ({
      targetSets: item.target_sets,
      targetRepsMin: item.target_reps_min,
      targetRepsMax: item.target_reps_max,
      targetDurationSeconds: item.target_duration_seconds,
      targetRestSeconds: item.target_rest_seconds,
      supersetGroup: item.superset_group,
    })),
  );

  const totalSets = data.exercises.reduce((sum, item) => sum + item.target_sets, 0);

  return (
    <Screen>
      <Header
        right={
          <Pressable
            onPress={() => router.push(`/day/${data.id}/edit`)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Editar ficha"
            className="h-11 w-11 items-center justify-center"
          >
            <Pencil size={20} color={colors.text} />
          </Pressable>
        }
      />

      <View className="gap-6 pb-4">
        <View className="gap-2">
          {data.plan ? (
            <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
              {data.plan.name}
            </Text>
          ) : null}
          <Text className="text-[28px] font-bold leading-9 text-neutral-900 dark:text-neutral-50">
            {data.name}
          </Text>

          {data.exercises.length > 0 ? (
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <Clock size={14} color={colors.textSecondary} />
                <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
                  ~{minutes} min
                </Text>
              </View>
              <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
                {data.exercises.length} exercícios · {totalSets} séries
              </Text>
            </View>
          ) : null}

          {data.notes ? (
            <Text className="text-[15px] leading-6 text-neutral-500 dark:text-neutral-400">
              {data.notes}
            </Text>
          ) : null}
        </View>

        {data.exercises.length === 0 ? (
          <EmptyState
            icon={Pencil}
            title="Ficha vazia"
            description="Adicione os exercícios e defina as metas de séries, repetições e descanso."
            actionLabel="Montar a ficha"
            onAction={() => router.push(`/day/${data.id}/edit`)}
          />
        ) : (
          <View className="gap-2">
            {data.exercises.map((item, index) => {
              const previous = data.exercises[index - 1];
              const startsGroup =
                item.superset_group != null && previous?.superset_group !== item.superset_group;

              return (
                <View key={item.id}>
                  {startsGroup ? (
                    <Text className="mb-1 mt-2 text-[11px] font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-400">
                      Bi-set {supersetLabel(item.superset_group!)}
                    </Text>
                  ) : null}

                  <View
                    className={`flex-row items-center gap-3 rounded-lg border bg-white p-3 dark:bg-neutral-900 ${
                      item.superset_group != null
                        ? 'border-brand-500'
                        : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <ExerciseThumb
                      thumbnailPath={item.exercise?.thumbnail_path}
                      muscleColor={item.exercise?.muscle_group?.color_hex}
                      equipmentSlug={item.exercise?.equipment?.slug}
                      size={44}
                    />
                    <View className="flex-1 gap-0.5">
                      <Text className="text-[15px] font-medium text-neutral-900 dark:text-neutral-50">
                        {item.exercise?.name_pt ?? 'Exercício removido'}
                      </Text>
                      <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
                        {prescriptionSummary(item, unitSystem)}
                      </Text>
                      {item.notes ? (
                        <Text className="text-[13px] italic text-neutral-500 dark:text-neutral-400">
                          {item.notes}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Card className="gap-2">
          <View className="flex-row items-center gap-2">
            <Play size={18} color={colors.textSecondary} />
            <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              Iniciar treino
            </Text>
          </View>
          <Text className="text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
            O player de treino é a Fase 4. Quando ele existir, este botão abre a sessão já com as
            séries pré-preenchidas a partir das metas desta ficha.
          </Text>
          <Button title="Iniciar treino" size="lg" fullWidth disabled onPress={() => undefined} />
        </Card>
      </View>
    </Screen>
  );
}
