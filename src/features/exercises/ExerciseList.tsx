import { FlashList } from '@shopify/flash-list';
import { Dumbbell, SearchX } from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { ExerciseListItem } from '@/components/exercise/ExerciseListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

import type { ExerciseListItem as Exercise } from './api';

type Row =
  | { kind: 'header'; key: string; title: string; color: string }
  | { kind: 'item'; key: string; exercise: Exercise };

type Props = {
  exercises: Exercise[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  onPressExercise: (exercise: Exercise) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (exercise: Exercise) => void;
  selectable?: boolean;
  selectedIds?: string[];
  /** Estado vazio muda conforme houver ou não busca ativa. */
  hasActiveSearch?: boolean;
  onCreateExercise?: () => void;
};

/** Agrupa por grupo muscular, preservando a ordem de exibição do catálogo. */
function buildRows(exercises: Exercise[]): Row[] {
  const groups = new Map<string, { title: string; color: string; order: number; items: Exercise[] }>();

  for (const exercise of exercises) {
    const group = exercise.muscle_group;
    const id = group?.id ?? 'sem-grupo';
    let bucket = groups.get(id);
    if (!bucket) {
      bucket = {
        title: group?.name_pt ?? 'Outros',
        color: group?.color_hex ?? '',
        order: group?.display_order ?? 999,
        items: [],
      };
      groups.set(id, bucket);
    }
    bucket.items.push(exercise);
  }

  return [...groups.entries()]
    .sort((a, b) => a[1].order - b[1].order)
    .flatMap(([id, bucket]): Row[] => [
      { kind: 'header', key: `h-${id}`, title: bucket.title, color: bucket.color },
      ...bucket.items.map((exercise): Row => ({ kind: 'item', key: exercise.id, exercise })),
    ]);
}

export function ExerciseList({
  exercises,
  isPending,
  isError,
  onRetry,
  onPressExercise,
  favoriteIds = [],
  onToggleFavorite,
  selectable = false,
  selectedIds = [],
  hasActiveSearch = false,
  onCreateExercise,
}: Props) {
  const rows = useMemo(() => buildRows(exercises), [exercises]);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center">
        <ErrorState onRetry={onRetry} />
      </View>
    );
  }

  if (rows.length === 0) {
    return (
      <View className="flex-1 justify-center">
        {hasActiveSearch ? (
          <EmptyState
            icon={SearchX}
            title="Nenhum exercício encontrado"
            description="Tente outro termo ou limpe os filtros. Se o movimento não existir no catálogo, dá para criar o seu."
            actionLabel={onCreateExercise ? 'Criar exercício' : undefined}
            onAction={onCreateExercise}
          />
        ) : (
          <EmptyState
            icon={Dumbbell}
            title="Nada por aqui ainda"
            description="Favorite os exercícios que você mais usa para encontrá-los rápido no meio do treino."
          />
        )}
      </View>
    );
  }

  return (
    <FlashList
      data={rows}
      keyExtractor={(row) => row.key}
      getItemType={(row) => row.kind}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 24 }}
      renderItem={({ item: row }) =>
        row.kind === 'header' ? (
          <View className="bg-neutral-50 px-4 pb-1 pt-4 dark:bg-neutral-950">
            <Text
              style={row.color ? { color: row.color } : undefined}
              className="text-[13px] font-semibold uppercase tracking-wide"
            >
              {row.title}
            </Text>
          </View>
        ) : (
          <ExerciseListItem
            exercise={row.exercise}
            onPress={() => onPressExercise(row.exercise)}
            isFavorite={favoriteIds.includes(row.exercise.id)}
            onToggleFavorite={
              onToggleFavorite ? () => onToggleFavorite(row.exercise) : undefined
            }
            selectable={selectable}
            selected={selectedIds.includes(row.exercise.id)}
          />
        )
      }
    />
  );
}
