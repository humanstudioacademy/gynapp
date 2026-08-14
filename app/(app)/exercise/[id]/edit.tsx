import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import { ExerciseForm } from '@/features/exercises/ExerciseForm';
import {
  useDeleteExercise,
  useExerciseDetail,
  useExerciseUsage,
  useUpdateExercise,
} from '@/features/exercises/hooks';

export default function EditExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useExerciseDetail(id);
  const usage = useExerciseUsage(id);
  const updateExercise = useUpdateExercise(id ?? '');
  const deleteExercise = useDeleteExercise();
  const toast = useToast();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const exercise = detail.data;

  if (detail.isPending) {
    return (
      <Screen scroll={false}>
        <Header title="Editar exercício" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (detail.isError || !exercise) {
    return (
      <Screen scroll={false}>
        <Header title="Editar exercício" />
        <View className="flex-1 justify-center">
          <ErrorState onRetry={() => void detail.refetch()} />
        </View>
      </Screen>
    );
  }

  // A policy `exercises_update_own` já barra no servidor; aqui é só para não
  // mostrar um formulário que vai falhar.
  if (exercise.created_by === null) {
    return (
      <Screen scroll={false}>
        <Header title="Editar exercício" />
        <View className="flex-1 justify-center">
          <ErrorState message="Exercícios do catálogo não podem ser editados. Crie um exercício personalizado se quiser uma variação." />
        </View>
      </Screen>
    );
  }

  const usageCount = usage.data ?? 0;

  return (
    <Screen>
      <Header title="Editar exercício" />
      <ExerciseForm
        initial={{
          namePt: exercise.name_pt,
          primaryMuscleGroupId: exercise.muscle_group?.id,
          equipmentId: exercise.equipment?.id ?? null,
          trackingType: exercise.tracking_type,
          difficulty: exercise.difficulty,
          isUnilateral: exercise.is_unilateral,
          mechanic: exercise.mechanic,
          instructions: exercise.instructions ?? [],
        }}
        submitLabel="Salvar alterações"
        saving={updateExercise.isPending}
        onSubmit={(input) => {
          updateExercise.mutate(input, {
            onSuccess: () => {
              toast.show('Exercício atualizado.', 'success');
              router.back();
            },
            onError: (error) => toast.show(authErrorMessage(error), 'error'),
          });
        }}
        onDelete={() => setConfirmVisible(true)}
      />

      <ConfirmDialog
        visible={confirmVisible}
        title="Excluir este exercício?"
        message={
          usageCount > 0
            ? `Ele aparece em ${usageCount} ${usageCount === 1 ? 'treino já registrado' : 'treinos já registrados'}. Excluir apaga também esses registros do seu histórico.`
            : 'Ele ainda não foi usado em nenhum treino. Essa ação não pode ser desfeita.'
        }
        confirmLabel="Excluir"
        destructive
        loading={deleteExercise.isPending}
        onConfirm={() => {
          deleteExercise.mutate(exercise.id, {
            onSuccess: () => {
              setConfirmVisible(false);
              toast.show('Exercício excluído.', 'success');
              router.replace('/exercise/library');
            },
            onError: (error) => toast.show(authErrorMessage(error), 'error'),
          });
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </Screen>
  );
}
