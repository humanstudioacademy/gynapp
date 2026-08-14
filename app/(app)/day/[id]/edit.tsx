import { router, useLocalSearchParams } from 'expo-router';
import { Link2, Link2Off, Plus, SlidersHorizontal, Trash2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { ExerciseThumb } from '@/components/exercise/ExerciseThumb';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { ReorderControls } from '@/components/ui/ReorderControls';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import { useExercisePicker } from '@/features/exercises/pickerStore';
import { prescriptionSummary } from '@/features/plans/format';
import type { PrescribedExerciseRow } from '@/features/plans/api';
import {
  useAddExercises,
  useDayDetail,
  useRemovePrescription,
  useReorderPrescriptions,
  useSetSupersetGroup,
  useUpdateDay,
  useUpdatePrescription,
} from '@/features/plans/hooks';
import { useSettings } from '@/features/profile/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { estimateDayMinutes } from '@/utils/calculations';
import { displayWeight, inputWeightToKg, weightUnit } from '@/utils/units';

function toNumber(value: string): number | null {
  const normalized = value.replace(',', '.').trim();
  if (normalized === '') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function EditDayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dayId = id ?? '';
  const day = useDayDetail(dayId);
  const { data: settings } = useSettings();
  const { colors } = useTheme();
  const toast = useToast();

  const planId = day.data?.plan_id ?? '';
  const updateDay = useUpdateDay(planId);
  const addExercises = useAddExercises(dayId);
  const removePrescription = useRemovePrescription(dayId);
  const reorder = useReorderPrescriptions(dayId);
  const updatePrescription = useUpdatePrescription(dayId);
  const setSuperset = useSetSupersetGroup(dayId);

  const [nameSheet, setNameSheet] = useState(false);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<PrescribedExerciseRow | null>(null);
  const [toRemove, setToRemove] = useState<PrescribedExerciseRow | null>(null);

  const unitSystem = settings?.unit_system ?? 'metric';
  const data = day.data;

  // O seletor de exercícios devolve a escolha pela store (modal não retorna valor).
  const { selection, version } = useExercisePicker();
  const seenVersion = useRef(version);

  useEffect(() => {
    if (version === seenVersion.current) return;
    seenVersion.current = version;
    if (selection.length === 0) return;

    addExercises.mutate(selection, {
      onSuccess: () =>
        toast.show(
          `${selection.length} ${selection.length === 1 ? 'exercício adicionado' : 'exercícios adicionados'}.`,
          'success',
        ),
      onError: (error) => toast.show(authErrorMessage(error), 'error'),
    });
  }, [version, selection, addExercises, toast]);

  function fail(error: unknown) {
    toast.show(authErrorMessage(error), 'error');
  }

  function move(index: number, direction: -1 | 1) {
    if (!data) return;
    const ids = data.exercises.map((item) => item.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;

    const next = [...ids];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved!);
    reorder.mutate(next, { onError: fail });
  }

  /** Junta o exercício com o seguinte num bi-set, ou desfaz o grupo. */
  function toggleSuperset(index: number) {
    if (!data) return;
    const current = data.exercises[index];
    const next = data.exercises[index + 1];
    if (!current) return;

    if (current.superset_group != null) {
      const ids = data.exercises
        .filter((item) => item.superset_group === current.superset_group)
        .map((item) => item.id);
      setSuperset.mutate({ ids, group: null }, { onError: fail });
      return;
    }

    if (!next) return;
    const used = data.exercises
      .map((item) => item.superset_group)
      .filter((group): group is number => group != null);
    const group = used.length > 0 ? Math.max(...used) + 1 : 1;

    setSuperset.mutate({ ids: [current.id, next.id], group }, { onError: fail });
  }

  if (day.isPending) {
    return (
      <Screen scroll={false}>
        <Header title="Editar ficha" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (day.isError || !data) {
    return (
      <Screen scroll={false}>
        <Header title="Editar ficha" />
        <View className="flex-1 justify-center">
          <ErrorState onRetry={() => void day.refetch()} />
        </View>
      </Screen>
    );
  }

  const minutes = estimateDayMinutes(
    data.exercises.map((item) => ({
      targetSets: item.target_sets,
      targetRepsMin: item.target_reps_min,
      targetRepsMax: item.target_reps_max,
      targetDurationSeconds: item.target_duration_seconds,
      targetRestSeconds: item.target_rest_seconds,
      supersetGroup: item.superset_group,
    })),
  );

  return (
    <Screen>
      <Header title="Editar ficha" />

      <View className="gap-5 pb-4">
        <Pressable
          onPress={() => {
            setName(data.name);
            setNameSheet(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Renomear ficha, atualmente ${data.name}`}
          className="gap-1"
        >
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Nome da ficha
          </Text>
          <Text className="text-[22px] font-bold text-neutral-900 dark:text-neutral-50">
            {data.name}
          </Text>
        </Pressable>

        {data.exercises.length > 0 ? (
          <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
            Duração estimada: ~{minutes} min · calculada a partir das séries e do descanso.
          </Text>
        ) : null}

        {data.exercises.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Nenhum exercício ainda"
            description="Escolha os exercícios pelo catálogo — dá para selecionar vários de uma vez."
            actionLabel="Adicionar exercícios"
            onAction={() => router.push('/exercise-picker')}
          />
        ) : (
          <View className="gap-2">
            {data.exercises.map((item, index) => {
              const inGroup = item.superset_group != null;
              const previous = data.exercises[index - 1];
              const startsGroup = inGroup && previous?.superset_group !== item.superset_group;

              return (
                <View key={item.id}>
                  {startsGroup ? (
                    <Text className="mb-1 mt-2 text-[11px] font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-400">
                      Bi-set — sem descanso entre eles
                    </Text>
                  ) : null}

                  <View
                    className={`flex-row items-center rounded-lg border bg-white dark:bg-neutral-900 ${
                      inGroup ? 'border-brand-500' : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <Pressable
                      onPress={() => setEditing(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar metas de ${item.exercise?.name_pt ?? 'exercício'}`}
                      accessibilityHint={prescriptionSummary(item, unitSystem)}
                      className="min-h-[64px] flex-1 flex-row items-center gap-3 p-3"
                    >
                      <ExerciseThumb
                        thumbnailPath={item.exercise?.thumbnail_path}
                        muscleColor={item.exercise?.muscle_group?.color_hex}
                        equipmentSlug={item.exercise?.equipment?.slug}
                        size={44}
                      />
                      <View className="flex-1 gap-0.5">
                        <Text className="text-[15px] font-medium text-neutral-900 dark:text-neutral-50">
                          {item.exercise?.name_pt ?? 'Exercício removido'}
                        </Text>
                        <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
                          {prescriptionSummary(item, unitSystem)}
                        </Text>
                      </View>
                      <SlidersHorizontal size={16} color={colors.textSecondary} />
                    </Pressable>

                    <ReorderControls
                      label={item.exercise?.name_pt ?? 'exercício'}
                      canMoveUp={index > 0}
                      canMoveDown={index < data.exercises.length - 1}
                      onMoveUp={() => move(index, -1)}
                      onMoveDown={() => move(index, 1)}
                    />

                    <View className="pr-1">
                      <Pressable
                        onPress={() => toggleSuperset(index)}
                        disabled={!inGroup && index === data.exercises.length - 1}
                        hitSlop={4}
                        accessibilityRole="button"
                        accessibilityLabel={
                          inGroup ? 'Desfazer bi-set' : 'Agrupar com o exercício seguinte em bi-set'
                        }
                        className={`h-8 w-9 items-center justify-center ${
                          !inGroup && index === data.exercises.length - 1 ? 'opacity-25' : ''
                        }`}
                      >
                        {inGroup ? (
                          <Link2Off size={16} color={colors.textSecondary} />
                        ) : (
                          <Link2 size={16} color={colors.textSecondary} />
                        )}
                      </Pressable>
                      <Pressable
                        onPress={() => setToRemove(item)}
                        hitSlop={4}
                        accessibilityRole="button"
                        accessibilityLabel={`Remover ${item.exercise?.name_pt ?? 'exercício'}`}
                        className="h-8 w-9 items-center justify-center"
                      >
                        <Trash2 size={16} color={colors.danger} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Button
          title="Adicionar exercícios"
          variant="secondary"
          size="lg"
          fullWidth
          loading={addExercises.isPending}
          onPress={() => router.push('/exercise-picker')}
        />

        <Card>
          <Text className="text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
            Toque num exercício para ajustar séries, repetições, carga e descanso. O ícone de
            corrente junta com o exercício seguinte em bi-set — eles passam a contar um descanso só.
          </Text>
        </Card>
      </View>

      <Sheet visible={nameSheet} onClose={() => setNameSheet(false)} title="Renomear ficha">
        <View className="gap-4">
          <Input label="Nome" value={name} onChangeText={setName} autoCapitalize="sentences" />
          <Button
            title="Salvar"
            size="lg"
            fullWidth
            loading={updateDay.isPending}
            onPress={() => {
              const trimmed = name.trim();
              if (trimmed.length < 1) return;
              updateDay.mutate(
                { dayId, name: trimmed },
                { onSuccess: () => setNameSheet(false), onError: fail },
              );
            }}
          />
        </View>
      </Sheet>

      {editing ? (
        <PrescriptionSheet
          key={editing.id}
          item={editing}
          unitSystem={unitSystem}
          saving={updatePrescription.isPending}
          onClose={() => setEditing(null)}
          onSave={(input) =>
            updatePrescription.mutate(
              { id: editing.id, input },
              {
                onSuccess: () => {
                  setEditing(null);
                  // A duração estimada da ficha muda junto com as metas.
                  updateDay.mutate({ dayId, estimatedMinutes: minutes });
                },
                onError: fail,
              },
            )
          }
        />
      ) : null}

      <ConfirmDialog
        visible={toRemove !== null}
        title="Remover da ficha?"
        message={`${toRemove?.exercise?.name_pt ?? 'O exercício'} sai desta ficha. O exercício continua no catálogo e o histórico não muda.`}
        confirmLabel="Remover"
        destructive
        loading={removePrescription.isPending}
        onConfirm={() => {
          if (!toRemove) return;
          removePrescription.mutate(toRemove.id, {
            onSuccess: () => setToRemove(null),
            onError: fail,
          });
        }}
        onCancel={() => setToRemove(null)}
      />
    </Screen>
  );
}

function PrescriptionSheet({
  item,
  unitSystem,
  saving,
  onClose,
  onSave,
}: {
  item: PrescribedExerciseRow;
  unitSystem: 'metric' | 'imperial';
  saving: boolean;
  onClose: () => void;
  onSave: (input: {
    targetSets: number;
    targetRepsMin: number | null;
    targetRepsMax: number | null;
    targetWeightKg: number | null;
    targetDurationSeconds: number | null;
    targetRestSeconds: number;
    targetRpe: number | null;
    notes: string | null;
  }) => void;
}) {
  const isDuration = item.exercise?.tracking_type === 'duration';

  const [sets, setSets] = useState(String(item.target_sets));
  const [repsMin, setRepsMin] = useState(item.target_reps_min?.toString() ?? '');
  const [repsMax, setRepsMax] = useState(item.target_reps_max?.toString() ?? '');
  const [duration, setDuration] = useState(item.target_duration_seconds?.toString() ?? '');
  const [weight, setWeight] = useState(() => {
    const value = displayWeight(item.target_weight_kg, unitSystem);
    return value == null ? '' : String(value);
  });
  const [rest, setRest] = useState(String(item.target_rest_seconds));
  const [rpe, setRpe] = useState(item.target_rpe?.toString() ?? '');
  const [notes, setNotes] = useState(item.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  function save() {
    const setsValue = toNumber(sets);
    if (setsValue == null || setsValue < 1 || setsValue > 20) {
      setError('Séries precisa ser um número de 1 a 20.');
      return;
    }

    const min = toNumber(repsMin);
    const max = toNumber(repsMax);
    if (min != null && max != null && min > max) {
      setError('A repetição mínima não pode ser maior que a máxima.');
      return;
    }

    const rpeValue = toNumber(rpe);
    if (rpeValue != null && (rpeValue < 1 || rpeValue > 10)) {
      setError('RPE vai de 1 a 10.');
      return;
    }

    const restValue = toNumber(rest) ?? 90;
    if (restValue < 0 || restValue > 900) {
      setError('Descanso precisa estar entre 0 e 900 segundos.');
      return;
    }

    setError(null);
    const weightValue = toNumber(weight);

    onSave({
      targetSets: Math.round(setsValue),
      targetRepsMin: min == null ? null : Math.round(min),
      targetRepsMax: max == null ? null : Math.round(max),
      targetWeightKg: weightValue == null ? null : inputWeightToKg(weightValue, unitSystem),
      targetDurationSeconds: isDuration ? (toNumber(duration) ?? null) : null,
      targetRestSeconds: Math.round(restValue),
      targetRpe: rpeValue,
      notes: notes.trim() === '' ? null : notes.trim(),
    });
  }

  return (
    <Sheet visible onClose={onClose} title={item.exercise?.name_pt ?? 'Metas'}>
      <View className="gap-4">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label="Séries" value={sets} onChangeText={setSets} keyboardType="number-pad" />
          </View>
          <View className="flex-1">
            <Input
              label="Descanso (s)"
              value={rest}
              onChangeText={setRest}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {isDuration ? (
          <Input
            label="Duração por série (s)"
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
          />
        ) : (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Reps mín."
                value={repsMin}
                onChangeText={setRepsMin}
                keyboardType="number-pad"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Reps máx."
                value={repsMax}
                onChangeText={setRepsMax}
                keyboardType="number-pad"
              />
            </View>
          </View>
        )}

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label={`Carga alvo (${weightUnit(unitSystem)})`}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-1">
            <Input
              label="RPE (opcional)"
              value={rpe}
              onChangeText={setRpe}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Input
          label="Observação (opcional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Ex.: última série até a falha"
          autoCapitalize="sentences"
        />

        {error ? (
          <Text accessibilityRole="alert" className="text-[13px] text-danger">
            {error}
          </Text>
        ) : null}

        <Button title="Salvar metas" size="lg" fullWidth loading={saving} onPress={save} />
      </View>
    </Sheet>
  );
}
