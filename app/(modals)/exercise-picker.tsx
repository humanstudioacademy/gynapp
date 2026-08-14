import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { CatalogFilters, type Scope } from '@/features/exercises/CatalogFilters';
import { ExerciseList } from '@/features/exercises/ExerciseList';
import { useExercises, useFavoriteIds } from '@/features/exercises/hooks';
import { useExercisePicker } from '@/features/exercises/pickerStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useDebouncedValue } from '@/utils/useDebouncedValue';

/**
 * Seletor com seleção múltipla. Confirma pela store (`pickerStore`), já que o
 * Expo Router não devolve valor ao fechar modal. Reusado no editor de ficha
 * na Fase 3.
 */
export default function ExercisePickerScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const confirm = useExercisePicker((state) => state.confirm);

  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [muscleGroupId, setMuscleGroupId] = useState<string | null>(null);
  const [equipmentId, setEquipmentId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const debouncedSearch = useDebouncedValue(search, 300);
  const favorites = useFavoriteIds();
  const exercises = useExercises({
    search: debouncedSearch,
    muscleGroupId,
    equipmentId,
    scope,
  });

  function toggle(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  /** Aberto por deep link não tem histórico para voltar — cai na biblioteca. */
  function dismiss() {
    if (router.canGoBack()) router.back();
    else router.replace('/exercise/library');
  }

  const count = selectedIds.length;

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <Header
        title="Escolher exercícios"
        hideBack
        right={
          <Pressable
            onPress={dismiss}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            className="h-11 w-11 items-center justify-center"
          >
            <X size={22} color={colors.text} />
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
        showScope={false}
      />

      <View className="mt-2 flex-1">
        <ExerciseList
          exercises={exercises.data ?? []}
          isPending={exercises.isPending}
          isError={exercises.isError}
          onRetry={() => void exercises.refetch()}
          onPressExercise={(exercise) => toggle(exercise.id)}
          favoriteIds={favorites.data ?? []}
          selectable
          selectedIds={selectedIds}
          hasActiveSearch={
            debouncedSearch.trim().length > 0 || muscleGroupId !== null || equipmentId !== null
          }
        />
      </View>

      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="gap-2 border-t border-neutral-200 bg-neutral-50 px-4 pt-3 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <Text className="text-center text-[13px] text-neutral-500 dark:text-neutral-400">
          {count === 0
            ? 'Toque nos exercícios para selecionar'
            : `${count} ${count === 1 ? 'exercício selecionado' : 'exercícios selecionados'}`}
        </Text>
        <Button
          title="Adicionar"
          size="lg"
          fullWidth
          disabled={count === 0}
          onPress={() => {
            confirm(selectedIds);
            dismiss();
          }}
        />
      </View>
    </View>
  );
}
