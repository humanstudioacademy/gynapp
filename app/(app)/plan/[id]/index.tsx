import { router, useLocalSearchParams } from 'expo-router';
import {
  Archive,
  ArchiveRestore,
  ChevronRight,
  Copy,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { ReorderControls } from '@/components/ui/ReorderControls';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import type { PlanDay } from '@/features/plans/api';
import {
  useArchivePlan,
  useCopyPlan,
  useCreateDay,
  useDeleteDay,
  useDeletePlan,
  useDuplicateDay,
  usePlanDetail,
  useReorderDays,
  useSetActivePlan,
} from '@/features/plans/hooks';
import { useProfile } from '@/features/profile/hooks';
import { goalLabel, levelLabel } from '@/i18n/labels';
import { useTheme } from '@/theme/ThemeProvider';

/** Rótulo sugerido para a próxima ficha: A, B, C… */
function nextLabel(count: number): string {
  return String.fromCharCode(65 + (count % 26));
}

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const planId = id ?? '';
  const plan = usePlanDetail(planId);
  const { data: profile } = useProfile();
  const { colors } = useTheme();
  const toast = useToast();

  const createDay = useCreateDay(planId);
  const deleteDay = useDeleteDay(planId);
  const duplicateDay = useDuplicateDay(planId);
  const reorderDays = useReorderDays(planId);
  const archivePlan = useArchivePlan();
  const deletePlan = useDeletePlan();
  const copyPlan = useCopyPlan();
  const setActivePlan = useSetActivePlan();

  const [newDaySheet, setNewDaySheet] = useState(false);
  const [dayName, setDayName] = useState('');
  const [dayToDelete, setDayToDelete] = useState<PlanDay | null>(null);
  const [confirmDeletePlan, setConfirmDeletePlan] = useState(false);

  const data = plan.data;
  const isActive = profile?.active_plan_id === planId;
  const isArchived = data?.archived_at != null;

  function fail(error: unknown) {
    toast.show(authErrorMessage(error), 'error');
  }

  function addDay() {
    const label = nextLabel(data?.days.length ?? 0);
    const name = dayName.trim() === '' ? `Treino ${label}` : dayName.trim();

    createDay.mutate(
      { name, label, orderIndex: data?.days.length ?? 0 },
      {
        onSuccess: (dayId) => {
          setNewDaySheet(false);
          setDayName('');
          router.push(`/day/${dayId}`);
        },
        onError: fail,
      },
    );
  }

  function move(index: number, direction: -1 | 1) {
    if (!data) return;
    const ids = data.days.map((day) => day.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;

    const reordered = [...ids];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved!);
    reorderDays.mutate(reordered, { onError: fail });
  }

  if (plan.isPending) {
    return (
      <Screen scroll={false}>
        <Header />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (plan.isError || !data) {
    return (
      <Screen scroll={false}>
        <Header />
        <View className="flex-1 justify-center">
          <ErrorState onRetry={() => void plan.refetch()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        right={
          <Pressable
            onPress={() => router.push(`/plan/${planId}/edit`)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Editar rotina"
            className="h-11 w-11 items-center justify-center"
          >
            <Pencil size={20} color={colors.text} />
          </Pressable>
        }
      />

      <View className="gap-6 pb-4">
        <View className="gap-2">
          <Text className="text-[28px] font-bold leading-9 text-neutral-900 dark:text-neutral-50">
            {data.name}
          </Text>
          {data.description ? (
            <Text className="text-[15px] leading-6 text-neutral-500 dark:text-neutral-400">
              {data.description}
            </Text>
          ) : null}

          <View className="mt-1 flex-row flex-wrap gap-x-4 gap-y-1">
            <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
              {data.days.length} {data.days.length === 1 ? 'ficha' : 'fichas'}
            </Text>
            {data.days_per_week ? (
              <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
                {data.days_per_week}x por semana
              </Text>
            ) : null}
            {data.level ? (
              <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
                {levelLabel[data.level]}
              </Text>
            ) : null}
            {data.goal ? (
              <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
                {goalLabel[data.goal]}
              </Text>
            ) : null}
          </View>

          {isArchived ? (
            <View className="mt-1 self-start rounded-full bg-neutral-200 px-3 py-1 dark:bg-neutral-800">
              <Text className="text-[11px] font-bold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                Arquivada
              </Text>
            </View>
          ) : null}
        </View>

        {!isArchived ? (
          <Button
            title={isActive ? 'Esta é a sua rotina ativa' : 'Definir como rotina ativa'}
            variant={isActive ? 'secondary' : 'primary'}
            size="lg"
            fullWidth
            disabled={isActive}
            loading={setActivePlan.isPending}
            onPress={() =>
              setActivePlan.mutate(planId, {
                onSuccess: () => toast.show('Rotina ativa definida.', 'success'),
                onError: fail,
              })
            }
          />
        ) : null}

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Fichas
            </Text>
            <Pressable
              onPress={() => setNewDaySheet(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Adicionar ficha"
              className="h-11 w-11 items-center justify-center"
            >
              <Plus size={20} color={colors.text} />
            </Pressable>
          </View>

          {data.days.length === 0 ? (
            <Card className="gap-3">
              <Text className="text-[15px] leading-6 text-neutral-500 dark:text-neutral-400">
                Uma rotina é feita de fichas — Treino A, Treino B, e por aí vai. Crie a primeira
                para começar a montar os exercícios.
              </Text>
              <Button title="Adicionar ficha" onPress={() => setNewDaySheet(true)} />
            </Card>
          ) : (
            data.days.map((day, index) => (
              <View
                key={day.id}
                className="flex-row items-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              >
                <Pressable
                  onPress={() => router.push(`/day/${day.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={day.name}
                  accessibilityHint={`${day.exercise_count} exercícios`}
                  className="min-h-[64px] flex-1 flex-row items-center gap-3 p-4"
                >
                  {day.label ? (
                    <View className="h-9 w-9 items-center justify-center rounded-md bg-brand-500">
                      <Text className="text-[15px] font-bold text-neutral-950">{day.label}</Text>
                    </View>
                  ) : null}
                  <View className="flex-1 gap-0.5">
                    <Text className="text-base font-medium text-neutral-900 dark:text-neutral-50">
                      {day.name}
                    </Text>
                    <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
                      {day.exercise_count === 0
                        ? 'Nenhum exercício ainda'
                        : `${day.exercise_count} ${day.exercise_count === 1 ? 'exercício' : 'exercícios'}`}
                      {day.estimated_minutes ? ` · ~${day.estimated_minutes} min` : ''}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </Pressable>

                <ReorderControls
                  label={day.name}
                  canMoveUp={index > 0}
                  canMoveDown={index < data.days.length - 1}
                  onMoveUp={() => move(index, -1)}
                  onMoveDown={() => move(index, 1)}
                />

                <View className="pr-1">
                  <Pressable
                    onPress={() =>
                      duplicateDay.mutate(day.id, {
                        onSuccess: () => toast.show('Ficha duplicada.', 'success'),
                        onError: fail,
                      })
                    }
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel={`Duplicar ${day.name}`}
                    className="h-8 w-9 items-center justify-center"
                  >
                    <Copy size={16} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable
                    onPress={() => setDayToDelete(day)}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel={`Excluir ${day.name}`}
                    className="h-8 w-9 items-center justify-center"
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        <Card className="gap-0 p-0">
          <PlanAction
            icon={Copy}
            label="Duplicar rotina"
            onPress={() =>
              copyPlan.mutate(
                { planId, newName: `${data.name} (cópia)` },
                {
                  onSuccess: (newId) => {
                    toast.show('Rotina duplicada.', 'success');
                    router.replace(`/plan/${newId}`);
                  },
                  onError: fail,
                },
              )
            }
          />
          <Divider />
          <PlanAction
            icon={isArchived ? ArchiveRestore : Archive}
            label={isArchived ? 'Desarquivar rotina' : 'Arquivar rotina'}
            onPress={() =>
              archivePlan.mutate(
                { planId, archived: !isArchived },
                {
                  onSuccess: () =>
                    toast.show(isArchived ? 'Rotina restaurada.' : 'Rotina arquivada.', 'success'),
                  onError: fail,
                },
              )
            }
          />
          <Divider />
          <PlanAction
            icon={Trash2}
            label="Excluir rotina"
            destructive
            onPress={() => setConfirmDeletePlan(true)}
          />
        </Card>

        <Text className="text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
          Arquivar esconde a rotina da lista sem apagar nada. Excluir remove a rotina e as fichas —
          os treinos que você já registrou continuam no histórico.
        </Text>
      </View>

      <Sheet visible={newDaySheet} onClose={() => setNewDaySheet(false)} title="Nova ficha">
        <View className="gap-4">
          <Input
            label="Nome da ficha"
            value={dayName}
            onChangeText={setDayName}
            placeholder={`Treino ${nextLabel(data.days.length)} — ex.: Peito e Tríceps`}
            autoCapitalize="sentences"
          />
          <Button
            title="Criar e adicionar exercícios"
            size="lg"
            fullWidth
            loading={createDay.isPending}
            onPress={addDay}
          />
        </View>
      </Sheet>

      <ConfirmDialog
        visible={dayToDelete !== null}
        title={`Excluir ${dayToDelete?.name ?? 'a ficha'}?`}
        message="Os exercícios prescritos nela somem. Os treinos que você já registrou com essa ficha continuam no histórico."
        confirmLabel="Excluir ficha"
        destructive
        loading={deleteDay.isPending}
        onConfirm={() => {
          if (!dayToDelete) return;
          deleteDay.mutate(dayToDelete.id, {
            onSuccess: () => {
              setDayToDelete(null);
              toast.show('Ficha excluída.', 'success');
            },
            onError: fail,
          });
        }}
        onCancel={() => setDayToDelete(null)}
      />

      <ConfirmDialog
        visible={confirmDeletePlan}
        title="Excluir esta rotina?"
        message="A rotina e todas as fichas somem. Seu histórico de treinos é preservado. Se quiser só tirar da lista, arquive em vez de excluir."
        confirmLabel="Excluir rotina"
        destructive
        loading={deletePlan.isPending}
        onConfirm={() =>
          deletePlan.mutate(planId, {
            onSuccess: () => {
              setConfirmDeletePlan(false);
              toast.show('Rotina excluída.', 'success');
              router.replace('/workouts');
            },
            onError: fail,
          })
        }
        onCancel={() => setConfirmDeletePlan(false)}
      />
    </Screen>
  );
}

function PlanAction({
  icon: Icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: typeof Star;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-[56px] flex-row items-center gap-3 px-4 py-3 active:bg-neutral-100 dark:active:bg-neutral-800"
    >
      <Icon size={20} color={destructive ? colors.danger : colors.textSecondary} />
      <Text
        className={`text-base ${destructive ? 'text-danger' : 'text-neutral-900 dark:text-neutral-50'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Divider() {
  return <View className="mx-4 h-px bg-neutral-200 dark:bg-neutral-800" />;
}
