import { router } from 'expo-router';
import { BookOpen, LayoutTemplate, Plus } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlanCard } from '@/components/plan/PlanCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListRow } from '@/components/ui/ListRow';
import { usePlans } from '@/features/plans/hooks';
import { useProfile } from '@/features/profile/hooks';
import { useTheme } from '@/theme/ThemeProvider';

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const plans = usePlans();
  const { data: profile } = useProfile();

  const activePlanId = profile?.active_plan_id ?? null;
  const list = plans.data ?? [];

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <View className="flex-row items-center justify-between px-4 py-4">
        <Text className="text-[28px] font-bold text-neutral-900 dark:text-neutral-50">Treinos</Text>
        <Pressable
          onPress={() => router.push('/plan/new')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Criar rotina"
          className="h-11 w-11 items-center justify-center"
        >
          <Plus size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, gap: 16 }}
      >
        <Card className="gap-0 p-0">
          <ListRow
            icon={LayoutTemplate}
            title="Rotinas prontas"
            subtitle="5 programas montados por objetivo e nível"
            onPress={() => router.push('/plan/templates')}
          />
          <View className="mx-4 h-px bg-neutral-200 dark:bg-neutral-800" />
          <ListRow
            icon={BookOpen}
            title="Biblioteca de exercícios"
            subtitle="138 exercícios com instruções de execução"
            onPress={() => router.push('/exercise/library')}
          />
        </Card>

        {plans.isPending ? (
          <View className="py-12">
            <ActivityIndicator />
          </View>
        ) : plans.isError ? (
          <ErrorState onRetry={() => void plans.refetch()} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={LayoutTemplate}
            title="Você ainda não tem rotinas"
            description="Monte a sua do zero ou comece com uma das 5 prontas — dá para editar tudo depois."
            actionLabel="Criar minha primeira"
            onAction={() => router.push('/plan/new')}
          />
        ) : (
          <View className="gap-3">
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Minhas rotinas
            </Text>
            {list.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isActive={plan.id === activePlanId}
                onPress={() => router.push(`/plan/${plan.id}`)}
              />
            ))}
            <Button
              title="Criar outra rotina"
              variant="secondary"
              fullWidth
              onPress={() => router.push('/plan/new')}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
