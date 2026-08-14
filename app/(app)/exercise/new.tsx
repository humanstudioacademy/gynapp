import { router } from 'expo-router';

import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import { ExerciseForm } from '@/features/exercises/ExerciseForm';
import { useCreateExercise } from '@/features/exercises/hooks';

export default function NewExerciseScreen() {
  const createExercise = useCreateExercise();
  const toast = useToast();

  return (
    <Screen>
      <Header title="Novo exercício" />
      <ExerciseForm
        submitLabel="Criar exercício"
        saving={createExercise.isPending}
        onSubmit={(input) => {
          createExercise.mutate(input, {
            onSuccess: (id) => {
              toast.show('Exercício criado.', 'success');
              router.replace(`/exercise/${id}`);
            },
            onError: (error) => toast.show(authErrorMessage(error), 'error'),
          });
        }}
      />
    </Screen>
  );
}
