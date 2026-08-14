import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { formatTimer } from '@/utils/format';

type Props = {
  remaining: number;
  total: number;
  onAdjust: (delta: number) => void;
  onSkip: () => void;
};

/** Barra fixa no rodapé durante o descanso (docs/05, wireframe do player). */
export function RestTimerBar({ remaining, total, onAdjust, onSkip }: Props) {
  const progress = total > 0 ? Math.min(1, Math.max(0, remaining / total)) : 0;
  const done = remaining === 0;

  return (
    <View className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <View className="h-1 w-full bg-neutral-200 dark:bg-neutral-800">
        <View
          style={{ width: `${progress * 100}%` }}
          className={done ? 'h-full bg-success' : 'h-full bg-brand-500'}
        />
      </View>

      <View className="flex-row items-center gap-2 px-4 py-3">
        <View className="flex-1">
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {done ? 'Pode ir' : 'Descanso'}
          </Text>
          <Text
            // tabular-nums evita o layout tremer a cada segundo (docs/07, 2.2)
            style={{ fontVariant: ['tabular-nums'] }}
            className={`text-[26px] font-bold ${done ? 'text-success-ink dark:text-success' : 'text-neutral-900 dark:text-neutral-50'}`}
          >
            {formatTimer(remaining)}
          </Text>
        </View>

        <Button title="−15s" variant="secondary" size="sm" haptic={false} onPress={() => onAdjust(-15)} />
        <Button title="+15s" variant="secondary" size="sm" haptic={false} onPress={() => onAdjust(15)} />
        <Button title={done ? 'Fechar' : 'Pular'} size="sm" onPress={onSkip} />
      </View>
    </View>
  );
}
