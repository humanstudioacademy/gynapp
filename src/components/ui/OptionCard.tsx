import { Check } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
};

/** Card selecionável — usado nos passos de objetivo e nível do onboarding. */
export function OptionCard({ title, description, selected, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{ selected }}
      className={`min-h-[56px] flex-row items-center gap-3 rounded-lg border p-4 ${
        selected
          ? 'border-brand-400 bg-brand-50 dark:bg-neutral-900'
          : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
      }`}
    >
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          {title}
        </Text>
        {description ? (
          <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">{description}</Text>
        ) : null}
      </View>
      {/* Não depende só de cor: o selecionado ganha o check (docs/07, seção 5). */}
      {selected ? <Check size={20} color={colors.primary} /> : null}
    </Pressable>
  );
}
