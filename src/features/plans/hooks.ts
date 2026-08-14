import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import { qk } from '@/lib/query/keys';

import {
  addExercisesToDay,
  copyPlan,
  createDay,
  createPlan,
  deleteDay,
  deletePlan,
  duplicateDay,
  fetchDayDetail,
  fetchPlanDetail,
  fetchPlans,
  fetchTemplates,
  removePrescription,
  reorderDays,
  reorderPrescriptions,
  setActivePlan,
  setPlanArchived,
  setSupersetGroup,
  updateDay,
  updatePlan,
  updatePrescription,
  type PlanInput,
  type PrescriptionInput,
} from './api';

export function usePlans(archived = false) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: [...qk.plans.list(), { archived }],
    queryFn: () => fetchPlans(archived),
    enabled: userId !== null,
  });
}

export function useTemplates() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: qk.plans.templates(),
    queryFn: fetchTemplates,
    enabled: userId !== null,
    staleTime: 1000 * 60 * 60, // templates do sistema mudam raramente
  });
}

export function usePlanDetail(planId: string | undefined) {
  return useQuery({
    queryKey: qk.plans.detail(planId ?? ''),
    queryFn: () => fetchPlanDetail(planId!),
    enabled: Boolean(planId),
  });
}

export function useDayDetail(dayId: string | undefined) {
  return useQuery({
    queryKey: qk.days.detail(dayId ?? ''),
    queryFn: () => fetchDayDetail(dayId!),
    enabled: Boolean(dayId),
  });
}

/** Invalida tudo que depende de rotinas — usado depois de qualquer escrita. */
function usePlanInvalidator() {
  const queryClient = useQueryClient();

  return (planId?: string, dayId?: string) => {
    void queryClient.invalidateQueries({ queryKey: qk.plans.all() });
    if (planId) void queryClient.invalidateQueries({ queryKey: qk.plans.detail(planId) });
    if (dayId) void queryClient.invalidateQueries({ queryKey: qk.days.detail(dayId) });
  };
}

export function useCreatePlan() {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: (input: PlanInput) => createPlan(input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdatePlan(planId: string) {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: (input: PlanInput) => updatePlan(planId, input),
    onSuccess: () => invalidate(planId),
  });
}

export function useArchivePlan() {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: ({ planId, archived }: { planId: string; archived: boolean }) =>
      setPlanArchived(planId, archived),
    onSuccess: (_data, { planId }) => invalidate(planId),
  });
}

export function useDeletePlan() {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: (planId: string) => deletePlan(planId),
    onSuccess: () => invalidate(),
  });
}

/** Serve tanto para duplicar rotina própria quanto para copiar template. */
export function useCopyPlan() {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: ({ planId, newName }: { planId: string; newName?: string }) =>
      copyPlan(planId, newName),
    onSuccess: () => invalidate(),
  });
}

export function useSetActivePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string | null) => setActivePlan(planId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.profile() });
    },
  });
}

export function useCreateDay(planId: string) {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: (input: { name: string; label: string | null; orderIndex: number }) =>
      createDay(planId, input),
    onSuccess: () => invalidate(planId),
  });
}

export function useUpdateDay(planId: string) {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: ({
      dayId,
      ...input
    }: {
      dayId: string;
      name?: string;
      label?: string | null;
      notes?: string | null;
      estimatedMinutes?: number | null;
    }) => updateDay(dayId, input),
    onSuccess: (_data, { dayId }) => invalidate(planId, dayId),
  });
}

export function useDeleteDay(planId: string) {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: (dayId: string) => deleteDay(dayId),
    onSuccess: () => invalidate(planId),
  });
}

export function useDuplicateDay(planId: string) {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: (dayId: string) => duplicateDay(dayId),
    onSuccess: () => invalidate(planId),
  });
}

export function useReorderDays(planId: string) {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: (ids: string[]) => reorderDays(ids),
    onSuccess: () => invalidate(planId),
  });
}

export function useAddExercises(dayId: string) {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: (exerciseIds: string[]) => addExercisesToDay(dayId, exerciseIds),
    onSuccess: () => invalidate(undefined, dayId),
  });
}

export function useUpdatePrescription(dayId: string) {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PrescriptionInput }) =>
      updatePrescription(id, input),
    onSuccess: () => invalidate(undefined, dayId),
  });
}

export function useRemovePrescription(dayId: string) {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: (id: string) => removePrescription(id),
    onSuccess: () => invalidate(undefined, dayId),
  });
}

export function useReorderPrescriptions(dayId: string) {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: (ids: string[]) => reorderPrescriptions(ids),
    onSuccess: () => invalidate(undefined, dayId),
  });
}

export function useSetSupersetGroup(dayId: string) {
  const invalidate = usePlanInvalidator();

  return useMutation({
    mutationFn: ({ ids, group }: { ids: string[]; group: number | null }) =>
      setSupersetGroup(ids, group),
    onSuccess: () => invalidate(undefined, dayId),
  });
}
