import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { memo, useEffect, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';

import type { SessionSet } from '@/features/session/api';
import type { Database } from '@/lib/supabase/database.types';
import { useTheme } from '@/theme/ThemeProvider';
import { displayWeight, inputWeightToKg, type UnitSystem } from '@/utils/units';

type TrackingType = Database['public']['Enums']['tracking_type'];

const SET_TYPE_LABEL: Record<Database['public']['Enums']['set_type'], string> = {
  warmup: 'A',
  normal: '',
  drop: 'D',
  failure: 'F',
  backoff: 'B',
  amrap: 'AM',
};

type Props = {
  set: SessionSet;
  index: number;
  trackingType: TrackingType;
  unitSystem: UnitSystem;
  /** "75×10" da última vez que o exercício foi feito. */
  previous?: string | null;
  onChange: (patch: {
    weight_kg?: number | null;
    reps?: number | null;
    duration_seconds?: number | null;
  }) => void;
  onToggleComplete: (completed: boolean) => void;
  onRemove: () => void;
};

function parse(value: string): number | null {
  const normalized = value.replace(',', '.').trim();
  if (normalized === '') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Linha de série do player. Precisa aguentar mão suada e pressa: campos largos,
 * um toque para concluir e feedback tátil imediato.
 *
 * As larguras são fixas de propósito. Com `flex-1` nos campos o checkbox saía da
 * tela em aparelho estreito — e sem o checkbox o app inteiro perde a função.
 * Remover série é toque longo na linha, não um X permanente roubando espaço.
 */
export const SetRow = memo(function SetRow({
  set,
  index,
  trackingType,
  unitSystem,
  previous,
  onChange,
  onToggleComplete,
  onRemove,
}: Props) {
  const { colors } = useTheme();

  const showWeight = trackingType === 'weight_reps' || trackingType === 'weight_duration';
  const showReps = trackingType === 'weight_reps' || trackingType === 'reps_only';
  const showDuration = trackingType === 'duration' || trackingType === 'weight_duration';

  const [weight, setWeight] = useState(() => {
    const value = displayWeight(set.weight_kg, unitSystem);
    return value == null ? '' : String(value);
  });
  const [reps, setReps] = useState(set.reps?.toString() ?? '');
  const [duration, setDuration] = useState(set.duration_seconds?.toString() ?? '');

  // O servidor é a verdade: se a linha mudar por fora (retomada, sync), realinha.
  useEffect(() => {
    const value = displayWeight(set.weight_kg, unitSystem);
    setWeight(value == null ? '' : String(value));
  }, [set.weight_kg, unitSystem]);

  useEffect(() => setReps(set.reps?.toString() ?? ''), [set.reps]);
  useEffect(() => setDuration(set.duration_seconds?.toString() ?? ''), [set.duration_seconds]);

  const badge = SET_TYPE_LABEL[set.set_type];
  const fieldClass =
    'h-11 w-[62px] rounded-md border border-neutral-200 bg-white text-center text-[15px] font-semibold text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50';

  function complete() {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onToggleComplete(!set.is_completed);
  }

  return (
    <Pressable
      onLongPress={onRemove}
      delayLongPress={500}
      accessibilityRole="none"
      accessibilityActions={[{ name: 'magicTap', label: 'Remover série' }]}
      onAccessibilityAction={onRemove}
      className={`flex-row items-center gap-2 rounded-md px-1 py-1.5 ${
        set.is_completed ? 'bg-brand-50 dark:bg-neutral-800' : ''
      }`}
    >
      <Text className="w-6 text-center text-[13px] font-semibold text-neutral-500 dark:text-neutral-400">
        {badge || index + 1}
      </Text>

      <Text
        numberOfLines={1}
        className="w-14 text-[11px] text-neutral-400 dark:text-neutral-500"
      >
        {previous ?? '—'}
      </Text>

      <View className="flex-1 flex-row justify-center gap-2">
        {showWeight ? (
          <TextInput
            value={weight}
            onChangeText={setWeight}
            onBlur={() => {
              const parsed = parse(weight);
              onChange({ weight_kg: parsed == null ? null : inputWeightToKg(parsed, unitSystem) });
            }}
            keyboardType="decimal-pad"
            selectTextOnFocus
            accessibilityLabel={`Carga da série ${index + 1}`}
            className={fieldClass}
          />
        ) : null}

        {showReps ? (
          <TextInput
            value={reps}
            onChangeText={setReps}
            onBlur={() => onChange({ reps: parse(reps) })}
            keyboardType="number-pad"
            selectTextOnFocus
            accessibilityLabel={`Repetições da série ${index + 1}`}
            className={fieldClass}
          />
        ) : null}

        {showDuration ? (
          <TextInput
            value={duration}
            onChangeText={setDuration}
            onBlur={() => onChange({ duration_seconds: parse(duration) })}
            keyboardType="number-pad"
            selectTextOnFocus
            accessibilityLabel={`Duração da série ${index + 1} em segundos`}
            className={fieldClass}
          />
        ) : null}
      </View>

      <Pressable
        onPress={complete}
        accessibilityRole="checkbox"
        accessibilityLabel={`Concluir série ${index + 1}`}
        accessibilityState={{ checked: set.is_completed }}
        className={`h-11 w-11 items-center justify-center rounded-md border ${
          set.is_completed
            ? 'border-brand-500 bg-brand-500'
            : 'border-neutral-300 dark:border-neutral-700'
        }`}
      >
        {set.is_completed ? <Check size={20} color={colors.textInverse} /> : null}
      </Pressable>
    </Pressable>
  );
});
