/**
 * Cálculos do domínio. Regras em docs/06 (RN-01, RN-02, RN-11).
 * Estas funções são a prioridade nº 1 de teste unitário — erro aqui
 * corrompe o histórico do usuário em silêncio.
 */

export type SetLike = {
  weightKg: number | null;
  reps: number | null;
  isCompleted: boolean;
  setType: string;
};

/**
 * 1RM estimado — fórmula de Epley: peso × (1 + reps/30).
 * Só estima de 1 a 15 repetições; acima disso a fórmula perde precisão.
 */
export function estimate1RM(weightKg: number | null, reps: number | null): number | null {
  if (weightKg == null || reps == null) return null;
  if (reps < 1 || reps > 15 || weightKg <= 0) return null;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 100) / 100;
}

/** RN-01: volume = Σ(carga × reps) de séries concluídas, excluindo aquecimento. */
export function sessionVolume(sets: SetLike[]): number {
  return sets.reduce((total, s) => {
    if (!s.isCompleted || s.setType === 'warmup') return total;
    if (s.weightKg == null || s.reps == null) return total;
    return total + s.weightKg * s.reps;
  }, 0);
}

export function completedSetCount(sets: SetLike[]): number {
  return sets.filter((s) => s.isCompleted && s.setType !== 'warmup').length;
}

export function totalReps(sets: SetLike[]): number {
  return sets.reduce(
    (t, s) => (s.isCompleted && s.setType !== 'warmup' ? t + (s.reps ?? 0) : t),
    0,
  );
}

/** RN-11: semanas consecutivas (antes da atual) em que treinos ≥ meta. */
export function weeklyStreak(
  sessionsPerWeek: { weekStart: string; count: number }[],
  weeklyGoal: number,
  currentWeekStart: string,
): number {
  const past = sessionsPerWeek
    .filter((w) => w.weekStart < currentWeekStart)
    .sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1));

  let streak = 0;
  let expected = new Date(currentWeekStart);

  for (const week of past) {
    expected.setDate(expected.getDate() - 7);
    const expectedStr = expected.toISOString().slice(0, 10);
    if (week.weekStart !== expectedStr || week.count < weeklyGoal) break;
    streak += 1;
  }
  return streak;
}

export type PrescribedExercise = {
  targetSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetDurationSeconds: number | null;
  targetRestSeconds: number;
  supersetGroup: number | null;
};

/** Segundos por repetição numa cadência normal (concêntrica + excêntrica). */
const SECONDS_PER_REP = 3;
/** Piso e teto para não distorcer a conta em séries muito curtas ou longas. */
const MIN_SET_SECONDS = 20;
const MAX_SET_SECONDS = 120;

/**
 * Duração estimada da ficha, em minutos (US-4.3):
 * `Σ(séries × (tempo de execução + descanso))`.
 *
 * Exercícios em bi-set/tri-set descansam uma vez por rodada, não a cada
 * exercício — por isso o descanso do grupo só conta no último da sequência.
 */
export function estimateDayMinutes(exercises: PrescribedExercise[]): number {
  if (exercises.length === 0) return 0;

  const total = exercises.reduce((seconds, exercise, index) => {
    const reps = exercise.targetRepsMax ?? exercise.targetRepsMin ?? 10;
    const execution =
      exercise.targetDurationSeconds ??
      Math.min(MAX_SET_SECONDS, Math.max(MIN_SET_SECONDS, reps * SECONDS_PER_REP));

    // Dentro de um bi-set só o último exercício do grupo tem descanso.
    const next = exercises[index + 1];
    const inSameGroup =
      exercise.supersetGroup != null && next != null && next.supersetGroup === exercise.supersetGroup;
    const rest = inSameGroup ? 0 : exercise.targetRestSeconds;

    return seconds + exercise.targetSets * (execution + rest);
  }, 0);

  return Math.round(total / 60);
}

/** Progresso de uma meta em % (0–100), tolerando metas decrescentes (perder peso). */
export function goalProgress(start: number, current: number, target: number): number {
  if (start === target) return current === target ? 100 : 0;
  const pct = ((current - start) / (target - start)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}
