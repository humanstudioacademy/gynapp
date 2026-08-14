import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  /** Valor à direita (ex.: "Escuro", "kg"). Ignorado quando `right` é passado. */
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
};

/** Linha de menu — altura mínima de 56pt (docs/07, seção 4). */
export function ListRow({
  icon: Icon,
  title,
  subtitle,
  value,
  right,
  onPress,
  destructive = false,
}: Props) {
  const { colors } = useTheme();
  const tint = destructive ? colors.danger : colors.textSecondary;

  const content = (
    <View className="min-h-[56px] flex-row items-center gap-3 px-4 py-3">
      {Icon ? <Icon size={20} color={tint} /> : null}
      <View className="flex-1 gap-0.5">
        <Text
          className={`text-base ${
            destructive ? 'text-danger' : 'text-neutral-900 dark:text-neutral-50'
          }`}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">{subtitle}</Text>
        ) : null}
      </View>
      {right ?? (
        <View className="flex-row items-center gap-1">
          {value ? (
            <Text className="text-[15px] text-neutral-500 dark:text-neutral-400">{value}</Text>
          ) : null}
          {onPress ? <ChevronRight size={18} color={colors.textSecondary} /> : null}
        </View>
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      className="active:bg-neutral-100 dark:active:bg-neutral-800"
    >
      {content}
    </Pressable>
  );
}
