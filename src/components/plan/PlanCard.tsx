import { CalendarDays, Layers } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { PlanListItem } from '@/features/plans/api';
import { goalLabel, levelLabel } from '@/i18n/labels';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  plan: PlanListItem;
  onPress: () => void;
  isActive?: boolean;
};

export function PlanCard({ plan, onPress, isActive = false }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={plan.name}
      accessibilityHint={`${plan.day_count} ${plan.day_count === 1 ? 'ficha' : 'fichas'}`}
      accessibilityState={{ selected: isActive }}
      className={`gap-3 rounded-lg border p-4 ${
        isActive
          ? 'border-brand-500 bg-white dark:bg-neutral-900'
          : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
      }`}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {plan.name}
          </Text>
          {plan.description ? (
            <Text numberOfLines={2} className="text-[13px] text-neutral-500 dark:text-neutral-400">
              {plan.description}
            </Text>
          ) : null}
        </View>

        {isActive ? (
          <View className="rounded-full bg-brand-500 px-2.5 py-1">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-neutral-950">
              Ativa
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
        <View className="flex-row items-center gap-1.5">
          <Layers size={14} color={colors.textSecondary} />
          <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
            {plan.day_count} {plan.day_count === 1 ? 'ficha' : 'fichas'}
          </Text>
        </View>

        {plan.days_per_week ? (
          <View className="flex-row items-center gap-1.5">
            <CalendarDays size={14} color={colors.textSecondary} />
            <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
              {plan.days_per_week}x por semana
            </Text>
          </View>
        ) : null}

        {plan.level ? (
          <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
            {levelLabel[plan.level]}
          </Text>
        ) : null}

        {plan.goal ? (
          <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
            {goalLabel[plan.goal]}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
