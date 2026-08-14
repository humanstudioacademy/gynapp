import type { PrescribedExerciseRow } from '@/features/plans/api';
import { formatRepRange, formatWeight } from '@/utils/format';
import { displayWeight, weightUnit, type UnitSystem } from '@/utils/units';

/** Letra do grupo de bi-set: 1 → A, 2 → B. */
export function supersetLabel(group: number): string {
  return String.fromCharCode(64 + group);
}

/** Resumo da prescrição numa linha: "3 séries · 8–12 reps · 60 kg · 90s de descanso". */
export function prescriptionSummary(
  item: PrescribedExerciseRow,
  unitSystem: UnitSystem,
): string {
  const parts: string[] = [`${item.target_sets} ${item.target_sets === 1 ? 'série' : 'séries'}`];

  if (item.target_duration_seconds != null) {
    parts.push(`${item.target_duration_seconds}s`);
  } else {
    const reps = formatRepRange(item.target_reps_min, item.target_reps_max);
    if (reps !== '—') parts.push(`${reps} reps`);
  }

  if (item.target_weight_kg != null) {
    parts.push(
      formatWeight(displayWeight(item.target_weight_kg, unitSystem), weightUnit(unitSystem)),
    );
  }

  parts.push(`${item.target_rest_seconds}s de descanso`);
  if (item.target_rpe != null) parts.push(`RPE ${item.target_rpe}`);

  return parts.join(' · ');
}
