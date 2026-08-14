import { router } from 'expo-router';

import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import { useCreatePlan } from '@/features/plans/hooks';
import { PlanForm } from '@/features/plans/PlanForm';

export default function NewPlanScreen() {
  const createPlan = useCreatePlan();
  const toast = useToast();

  return (
    <Screen>
      <Header title="Nova rotina" />
      <PlanForm
        submitLabel="Criar rotina"
        saving={createPlan.isPending}
        onSubmit={(input) =>
          createPlan.mutate(input, {
            // US-4.1: depois de criar, vai direto para adicionar as fichas.
            onSuccess: (planId) => router.replace(`/plan/${planId}`),
            onError: (error) => toast.show(authErrorMessage(error), 'error'),
          })
        }
      />
    </Screen>
  );
}
