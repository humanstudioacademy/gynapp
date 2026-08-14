import { router, useLocalSearchParams } from 'expo-router';
import { Pencil, Star } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { ExerciseThumb } from '@/components/exercise/ExerciseThumb';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import { useExerciseDetail, useFavoriteIds, useToggleFavorite } from '@/features/exercises/hooks';
import { levelLabel } from '@/i18n/labels';
import { palette } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

const MECHANIC_LABEL = { compound: 'Composto', isolation: 'Isolado' } as const;
const FORCE_LABEL = { push: 'Empurrar', pull: 'Puxar', static: 'Isométrico' } as const;
const TRACKING_LABEL = {
  weight_reps: 'Carga × repetições',
  reps_only: 'Só repetições',
  duration: 'Tempo',
  distance_duration: 'Distância e tempo',
  weight_duration: 'Carga e tempo',
} as const;

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useExerciseDetail(id);
  const favorites = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const { colors } = useTheme();
  const toast = useToast();

  const isFavorite = (favorites.data ?? []).includes(id ?? '');
  const exercise = detail.data;

  if (detail.isPending) {
    return (
      <Screen scroll={false}>
        <Header />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (detail.isError || !exercise) {
    return (
      <Screen scroll={false}>
        <Header />
        <View className="flex-1 justify-center">
          <ErrorState
            message="Não foi possível carregar esse exercício."
            onRetry={() => void detail.refetch()}
          />
        </View>
      </Screen>
    );
  }

  const isMine = exercise.created_by !== null;

  return (
    <Screen>
      <Header
        right={
          <View className="flex-row">
            {isMine ? (
              <Pressable
                onPress={() => router.push(`/exercise/${exercise.id}/edit`)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Editar exercício"
                className="h-11 w-11 items-center justify-center"
              >
                <Pencil size={20} color={colors.text} />
              </Pressable>
            ) : null}
            <Pressable
              onPress={() =>
                toggleFavorite.mutate(
                  { exerciseId: exercise.id, favorite: !isFavorite },
                  { onError: (error) => toast.show(authErrorMessage(error), 'error') },
                )
              }
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              accessibilityState={{ selected: isFavorite }}
              className="h-11 w-11 items-center justify-center"
            >
              <Star
                size={22}
                color={isFavorite ? palette.accent.pr : colors.textSecondary}
                fill={isFavorite ? palette.accent.pr : 'transparent'}
              />
            </Pressable>
          </View>
        }
      />

      <View className="gap-6 pb-4">
        <View className="items-center gap-3">
          <ExerciseThumb
            thumbnailPath={exercise.thumbnail_path}
            muscleColor={exercise.muscle_group?.color_hex}
            equipmentSlug={exercise.equipment?.slug}
            size={112}
          />
          <Text className="text-center text-[26px] font-bold leading-8 text-neutral-900 dark:text-neutral-50">
            {exercise.name_pt}
          </Text>
          {isMine ? (
            <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
              Exercício criado por você — só você vê
            </Text>
          ) : null}
        </View>

        <View className="flex-row flex-wrap gap-2">
          {exercise.muscle_group ? (
            <Tag label={exercise.muscle_group.name_pt} color={exercise.muscle_group.color_hex} />
          ) : null}
          {exercise.equipment ? <Tag label={exercise.equipment.name_pt} /> : null}
          <Tag label={levelLabel[exercise.difficulty]} />
          {exercise.mechanic ? <Tag label={MECHANIC_LABEL[exercise.mechanic]} /> : null}
          {exercise.force_type ? <Tag label={FORCE_LABEL[exercise.force_type]} /> : null}
          {exercise.is_unilateral ? <Tag label="Unilateral" /> : null}
        </View>

        {exercise.secondary_muscles.length > 0 ? (
          <Section title="Músculos secundários">
            <View className="flex-row flex-wrap gap-2">
              {exercise.secondary_muscles.map((muscle) => (
                <Tag key={muscle.id} label={muscle.name_pt} color={muscle.color_hex} />
              ))}
            </View>
          </Section>
        ) : null}

        {exercise.description ? (
          <Section title="Sobre">
            <Text className="text-[15px] leading-6 text-neutral-600 dark:text-neutral-300">
              {exercise.description}
            </Text>
          </Section>
        ) : null}

        {exercise.instructions && exercise.instructions.length > 0 ? (
          <Section title="Como executar">
            <View className="gap-3">
              {exercise.instructions.map((step, index) => (
                <View key={step} className="flex-row gap-3">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-500">
                    <Text className="text-[13px] font-bold text-neutral-950">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-[15px] leading-6 text-neutral-600 dark:text-neutral-300">
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        {exercise.tips && exercise.tips.length > 0 ? (
          <Section title="Dicas">
            <View className="gap-2">
              {exercise.tips.map((tip) => (
                <View key={tip} className="flex-row gap-2">
                  <Text className="text-[15px] text-brand-600 dark:text-brand-500">•</Text>
                  <Text className="flex-1 text-[15px] leading-6 text-neutral-600 dark:text-neutral-300">
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        <Card>
          <Text className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Como o app registra
          </Text>
          <Text className="mt-1 text-[15px] text-neutral-900 dark:text-neutral-50">
            {TRACKING_LABEL[exercise.tracking_type]}
          </Text>
        </Card>

        <Text className="text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
          Seu histórico neste exercício, o gráfico de evolução e os recordes aparecem aqui a partir
          da Fase 5, quando as sessões de treino existirem.
        </Text>
      </View>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-[13px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Tag({ label, color }: { label: string; color?: string }) {
  return (
    <View
      style={color ? { backgroundColor: `${color}22` } : undefined}
      className="rounded-full bg-neutral-100 px-3 py-1.5 dark:bg-neutral-800"
    >
      <Text
        style={color ? { color } : undefined}
        className="text-[13px] font-medium text-neutral-600 dark:text-neutral-300"
      >
        {label}
      </Text>
    </View>
  );
}
