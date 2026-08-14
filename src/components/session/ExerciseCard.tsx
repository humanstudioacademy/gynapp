import { Plus, Trash2 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { ExerciseThumb } from '@/components/exercise/ExerciseThumb';
import type { SessionExercise } from '@/features/session/api';
import { useTheme } from '@/theme/ThemeProvider';
import { formatWeight } from '@/utils/format';
import { displayWeight, weightUnit, type UnitSystem } from '@/utils/units';

import { SetRow } from './SetRow';

type Props = {
  item: SessionExercise;
  unitSystem: UnitSystem;
  last?: { weight_kg: number | null; reps: number | null } | null;
  onChangeSet: (
    setId: string,
    patch: { weight_kg?: number | null; reps?: number | null; duration_seconds?: number | null },
  ) => void;
  onToggleSet: (setId: string, completed: boolean) => void;
  onRemoveSet: (setId: string) => void;
  onAddSet: () => void;
  onRemoveExercise: () => void;
};

export function ExerciseCard({
  item,
  unitSystem,
  last,
  onChangeSet,
  onToggleSet,
  onRemoveSet,
  onAddSet,
  onRemoveExercise,
}: Props) {
  const { colors } = useTheme();
  const tracking = item.exercise?.tracking_type ?? 'weight_reps';

  const lastLabel =
    last && last.weight_kg != null && last.reps != null
      ? `${formatWeight(displayWeight(last.weight_kg, unitSystem), weightUnit(unitSystem))} × ${last.reps}`
      : null;

  const target =
    item.prescription?.target_reps_min != null
      ? `${item.prescription.target_reps_min}${
          item.prescription.target_reps_max && item.prescription.target_reps_max !== item.prescription.target_reps_min
            ? `–${item.prescription.target_reps_max}`
            : ''
        } reps`
      : null;

  return (
    <View className="gap-2 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      <View className="flex-row items-center gap-3">
        <ExerciseThumb
          thumbnailPath={item.exercise?.thumbnail_path}
          muscleColor={item.exercise?.muscle_group?.color_hex}
          equipmentSlug={item.exercise?.equipment?.slug}
          size={40}
        />
        <View className="flex-1 gap-0.5">
          <Text className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-50">
            {item.exercise?.name_pt ?? 'Exercício'}
          </Text>
          <Text className="text-[12px] text-neutral-500 dark:text-neutral-400">
            {[item.exercise?.muscle_group?.name_pt, item.exercise?.equipment?.name_pt, target]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>
        <Pressable
          onPress={onRemoveExercise}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${item.exercise?.name_pt ?? 'exercício'} do treino`}
          className="h-11 w-9 items-center justify-center"
        >
          <Trash2 size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Contexto que economiza tempo: o app já sabe a última carga (docs/00). */}
      {lastLabel ? (
        <Text className="text-[12px] text-neutral-500 dark:text-neutral-400">
          📌 Última vez: {lastLabel}
        </Text>
      ) : null}

      <View className="flex-row items-center gap-2 px-1">
        <Text className="w-6 text-center text-[10px] font-semibold uppercase text-neutral-400 dark:text-neutral-500">
          Sér
        </Text>
        <Text className="w-14 text-[10px] font-semibold uppercase text-neutral-400 dark:text-neutral-500">
          Anterior
        </Text>
        <View className="flex-1 flex-row justify-center gap-2">
          {tracking === 'weight_reps' || tracking === 'weight_duration' ? (
            <Text className="w-[62px] text-center text-[10px] font-semibold uppercase text-neutral-400 dark:text-neutral-500">
              {weightUnit(unitSystem)}
            </Text>
          ) : null}
          {tracking === 'weight_reps' || tracking === 'reps_only' ? (
            <Text className="w-[62px] text-center text-[10px] font-semibold uppercase text-neutral-400 dark:text-neutral-500">
              Reps
            </Text>
          ) : null}
          {tracking === 'duration' || tracking === 'weight_duration' ? (
            <Text className="w-[62px] text-center text-[10px] font-semibold uppercase text-neutral-400 dark:text-neutral-500">
              Seg
            </Text>
          ) : null}
        </View>
        <View className="w-11" />
      </View>

      {item.sets.map((set, index) => (
        <SetRow
          key={set.id}
          set={set}
          index={index}
          trackingType={tracking}
          unitSystem={unitSystem}
          previous={lastLabel}
          onChange={(patch) => onChangeSet(set.id, patch)}
          onToggleComplete={(completed) => onToggleSet(set.id, completed)}
          onRemove={() => onRemoveSet(set.id)}
        />
      ))}

      <Pressable
        onPress={onAddSet}
        accessibilityRole="button"
        accessibilityLabel={`Adicionar série em ${item.exercise?.name_pt ?? 'exercício'}`}
        className="min-h-[44px] flex-row items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700"
      >
        <Plus size={16} color={colors.textSecondary} />
        <Text className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
          Adicionar série
        </Text>
      </Pressable>
    </View>
  );
}
