import { router } from 'expo-router';
import { LayoutTemplate } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { PlanCard } from '@/components/plan/PlanCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import type { PlanListItem } from '@/features/plans/api';
import { useCopyPlan, usePlanDetail, useTemplates } from '@/features/plans/hooks';
import { GOAL_OPTIONS, goalLabel, LEVEL_OPTIONS, levelLabel } from '@/i18n/labels';
import type { Database } from '@/lib/supabase/database.types';

type Enums = Database['public']['Enums'];

export default function TemplatesScreen() {
  const templates = useTemplates();
  const copyPlan = useCopyPlan();
  const toast = useToast();

  const [level, setLevel] = useState<Enums['experience_level'] | null>(null);
  const [goal, setGoal] = useState<Enums['fitness_goal'] | null>(null);
  const [preview, setPreview] = useState<PlanListItem | null>(null);

  const list = (templates.data ?? []).filter(
    (plan) => (level === null || plan.level === level) && (goal === null || plan.goal === goal),
  );

  return (
    <Screen>
      <Header title="Rotinas prontas" />

      <View className="gap-5 pb-4">
        <Text className="text-[15px] leading-6 text-neutral-500 dark:text-neutral-400">
          Programas montados por objetivo e nível. Ao usar uma, ela vira uma cópia sua — dá para
          editar tudo depois sem afetar o original.
        </Text>

        <View className="gap-2">
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Nível
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Chip label="Todos" selected={level === null} onPress={() => setLevel(null)} />
            {LEVEL_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={levelLabel[option]}
                selected={level === option}
                onPress={() => setLevel(level === option ? null : option)}
              />
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Objetivo
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Chip label="Todos" selected={goal === null} onPress={() => setGoal(null)} />
            {GOAL_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={goalLabel[option]}
                selected={goal === option}
                onPress={() => setGoal(goal === option ? null : option)}
              />
            ))}
          </View>
        </View>

        {templates.isPending ? (
          <View className="py-12">
            <ActivityIndicator />
          </View>
        ) : templates.isError ? (
          <ErrorState onRetry={() => void templates.refetch()} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={LayoutTemplate}
            title="Nenhuma rotina com esses filtros"
            description="Limpe os filtros para ver todas as rotinas prontas."
          />
        ) : (
          <View className="gap-3">
            {list.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onPress={() => setPreview(plan)} />
            ))}
          </View>
        )}
      </View>

      {preview ? (
        <TemplatePreview
          template={preview}
          copying={copyPlan.isPending}
          onClose={() => setPreview(null)}
          onUse={() =>
            copyPlan.mutate(
              { planId: preview.id },
              {
                onSuccess: (newPlanId) => {
                  setPreview(null);
                  toast.show('Rotina copiada para a sua conta.', 'success');
                  router.replace(`/plan/${newPlanId}`);
                },
                onError: (error) => toast.show(authErrorMessage(error), 'error'),
              },
            )
          }
        />
      ) : null}
    </Screen>
  );
}

function TemplatePreview({
  template,
  copying,
  onClose,
  onUse,
}: {
  template: PlanListItem;
  copying: boolean;
  onClose: () => void;
  onUse: () => void;
}) {
  const detail = usePlanDetail(template.id);

  return (
    <Sheet visible onClose={onClose} title={template.name}>
      <View className="gap-4">
        {template.description ? (
          <Text className="text-[15px] leading-6 text-neutral-500 dark:text-neutral-400">
            {template.description}
          </Text>
        ) : null}

        <View className="gap-2">
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Fichas desta rotina
          </Text>

          {detail.isPending ? (
            <ActivityIndicator />
          ) : detail.isError ? (
            <ErrorState onRetry={() => void detail.refetch()} />
          ) : (
            (detail.data?.days ?? []).map((day) => (
              <View
                key={day.id}
                className="flex-row items-center gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-800"
              >
                {day.label ? (
                  <View className="h-8 w-8 items-center justify-center rounded-md bg-brand-500">
                    <Text className="text-[13px] font-bold text-neutral-950">{day.label}</Text>
                  </View>
                ) : null}
                <View className="flex-1">
                  <Text className="text-[15px] font-medium text-neutral-900 dark:text-neutral-50">
                    {day.name}
                  </Text>
                  <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
                    {day.exercise_count} {day.exercise_count === 1 ? 'exercício' : 'exercícios'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Button
          title="Usar esta rotina"
          size="lg"
          fullWidth
          loading={copying}
          onPress={onUse}
        />
      </View>
    </Sheet>
  );
}
