import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { ErrorState } from '@/components/ui/ErrorState';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import { usePlanDetail, useUpdatePlan } from '@/features/plans/hooks';
import { PlanForm } from '@/features/plans/PlanForm';

export default function EditPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = usePlanDetail(id);
  const updatePlan = useUpdatePlan(id ?? '');
  const toast = useToast();

  if (plan.isPending) {
    return (
      <Screen scroll={false}>
        <Header title="Editar rotina" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (plan.isError || !plan.data) {
    return (
      <Screen scroll={false}>
        <Header title="Editar rotina" />
        <View className="flex-1 justify-center">
          <ErrorState onRetry={() => void plan.refetch()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Editar rotina" />
      <PlanForm
        initial={{
          name: plan.data.name,
          description: plan.data.description,
          goal: plan.data.goal,
          level: plan.data.level,
          daysPerWeek: plan.data.days_per_week,
        }}
        submitLabel="Salvar alterações"
        saving={updatePlan.isPending}
        onSubmit={(input) =>
          updatePlan.mutate(input, {
            onSuccess: () => {
              toast.show('Rotina atualizada.', 'success');
              router.back();
            },
            onError: (error) => toast.show(authErrorMessage(error), 'error'),
          })
        }
      />
    </Screen>
  );
}
