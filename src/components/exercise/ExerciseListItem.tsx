import { Check, Star } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { ExerciseListItem as Exercise } from '@/features/exercises/api';
import { palette } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

import { ExerciseThumb } from './ExerciseThumb';

type Props = {
  exercise: Exercise;
  onPress: () => void;
  /** Estrela de favorito. Omitido no seletor de exercícios. */
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  /** Modo seleção (seletor da Fase 3): troca a estrela por um check. */
  selectable?: boolean;
  selected?: boolean;
};

/** Linha de 64pt com thumb, nome e subtítulo "Equipamento · Mecânica". */
export function ExerciseListItem({
  exercise,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  selectable = false,
  selected = false,
}: Props) {
  const { colors } = useTheme();

  const subtitle = [
    exercise.equipment?.name_pt,
    exercise.mechanic === 'compound'
      ? 'Composto'
      : exercise.mechanic === 'isolation'
        ? 'Isolado'
        : null,
    exercise.created_by ? 'Meu exercício' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    // A estrela é irmã do Pressable da linha, não filha: botão dentro de botão é
    // HTML inválido e o leitor de tela não consegue alcançar o de dentro.
    <View className="min-h-[64px] flex-row items-center">
      <Pressable
        onPress={onPress}
        accessibilityRole={selectable ? 'checkbox' : 'button'}
        accessibilityLabel={exercise.name_pt}
        accessibilityHint={subtitle}
        accessibilityState={selectable ? { checked: selected } : undefined}
        className="min-h-[64px] flex-1 flex-row items-center gap-3 py-2 pl-4 active:bg-neutral-100 dark:active:bg-neutral-900"
      >
        <ExerciseThumb
          thumbnailPath={exercise.thumbnail_path}
          muscleColor={exercise.muscle_group?.color_hex}
          equipmentSlug={exercise.equipment?.slug}
          label={`${exercise.muscle_group?.name_pt ?? ''}, ${exercise.equipment?.name_pt ?? 'sem equipamento'}`}
        />

        <View className="flex-1 gap-0.5">
          <Text
            numberOfLines={1}
            className="text-[15px] font-medium text-neutral-900 dark:text-neutral-50"
          >
            {exercise.name_pt}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} className="text-[13px] text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </Pressable>

      {selectable ? (
        <View className="w-11 items-center">
          <View
            className={`h-6 w-6 items-center justify-center rounded-sm border ${
              selected
                ? 'border-brand-400 bg-brand-400'
                : 'border-neutral-300 dark:border-neutral-700'
            }`}
          >
            {selected ? <Check size={16} color={colors.textInverse} /> : null}
          </View>
        </View>
      ) : onToggleFavorite ? (
        <Pressable
          onPress={onToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite
              ? `Remover ${exercise.name_pt} dos favoritos`
              : `Adicionar ${exercise.name_pt} aos favoritos`
          }
          accessibilityState={{ selected: isFavorite }}
          className="h-11 w-11 items-center justify-center"
        >
          <Star
            size={20}
            color={isFavorite ? palette.accent.pr : colors.textSecondary}
            fill={isFavorite ? palette.accent.pr : 'transparent'}
          />
        </Pressable>
      ) : (
        <View className="w-4" />
      )}
    </View>
  );
}
