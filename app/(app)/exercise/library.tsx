import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/ui/Header';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import { CatalogFilters, type Scope } from '@/features/exercises/CatalogFilters';
import { ExerciseList } from '@/features/exercises/ExerciseList';
import { useExercises, useFavoriteIds, useToggleFavorite } from '@/features/exercises/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { useDebouncedValue } from '@/utils/useDebouncedValue';

export default function ExerciseLibraryScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [muscleGroupId, setMuscleGroupId] = useState<string | null>(null);
  const [equipmentId, setEquipmentId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const favorites = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const exercises = useExercises({
    search: debouncedSearch,
    muscleGroupId,
    equipmentId,
    scope,
  });

  const hasActiveFilter =
    debouncedSearch.trim().length > 0 || muscleGroupId !== null || equipmentId !== null;

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <Header
        title="Exercícios"
        right={
          <Pressable
            onPress={() => router.push('/exercise/new')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Criar exercício personalizado"
            className="h-11 w-11 items-center justify-center"
          >
            <Plus size={24} color={colors.text} />
          </Pressable>
        }
      />

      <CatalogFilters
        search={search}
        onSearchChange={setSearch}
        scope={scope}
        onScopeChange={setScope}
        muscleGroupId={muscleGroupId}
        onMuscleGroupChange={setMuscleGroupId}
        equipmentId={equipmentId}
        onEquipmentChange={setEquipmentId}
      />

      <View className="mt-2 flex-1">
        <ExerciseList
          exercises={exercises.data ?? []}
          isPending={exercises.isPending}
          isError={exercises.isError}
          onRetry={() => void exercises.refetch()}
          onPressExercise={(exercise) => router.push(`/exercise/${exercise.id}`)}
          favoriteIds={favorites.data ?? []}
          onToggleFavorite={(exercise) => {
            const isFavorite = (favorites.data ?? []).includes(exercise.id);
            toggleFavorite.mutate(
              { exerciseId: exercise.id, favorite: !isFavorite },
              { onError: (error) => toast.show(authErrorMessage(error), 'error') },
            );
          }}
          hasActiveSearch={hasActiveFilter}
          onCreateExercise={() => router.push('/exercise/new')}
        />
      </View>
    </View>
  );
}
