import type { LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { Button } from './Button';

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Estado vazio: ícone + título + descrição + ação (docs/05, seção 4). */
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: Props) {
  const { colors } = useTheme();

  return (
    <View className="items-center gap-3 px-6 py-12">
      <Icon size={48} color={colors.textSecondary} strokeWidth={1.5} />
      <Text className="text-center text-lg font-semibold text-neutral-900 dark:text-neutral-50">
        {title}
      </Text>
      {description ? (
        <Text className="text-center text-[15px] text-neutral-500 dark:text-neutral-400">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-2">
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
