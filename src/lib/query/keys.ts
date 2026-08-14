/**
 * Query keys centralizadas — evita invalidação errada.
 * Regra: nenhum componente monta array de key à mão.
 */
export const qk = {
  profile: () => ['profile'] as const,
  settings: () => ['settings'] as const,

  catalog: {
    muscleGroups: () => ['catalog', 'muscle-groups'] as const,
    equipment: () => ['catalog', 'equipment'] as const,
  },

  exercises: {
    all: () => ['exercises'] as const,
    list: (filters: Record<string, unknown>) => ['exercises', 'list', filters] as const,
    detail: (id: string) => ['exercises', 'detail', id] as const,
    history: (id: string) => ['exercises', 'history', id] as const,
    favorites: () => ['exercises', 'favorites'] as const,
  },

  plans: {
    all: () => ['plans'] as const,
    list: () => ['plans', 'list'] as const,
    templates: () => ['plans', 'templates'] as const,
    detail: (id: string) => ['plans', 'detail', id] as const,
    days: (planId: string) => ['plans', 'days', planId] as const,
  },

  days: {
    detail: (id: string) => ['days', 'detail', id] as const,
    exercises: (dayId: string) => ['days', 'exercises', dayId] as const,
  },

  sessions: {
    all: () => ['sessions'] as const,
    list: () => ['sessions', 'list'] as const,
    detail: (id: string) => ['sessions', 'detail', id] as const,
    active: () => ['sessions', 'active'] as const,
  },

  progress: {
    dashboard: () => ['progress', 'dashboard'] as const,
    weeklyVolume: () => ['progress', 'weekly-volume'] as const,
    muscleVolume: () => ['progress', 'muscle-volume'] as const,
    records: () => ['progress', 'records'] as const,
    lastPerformance: () => ['progress', 'last-performance'] as const,
  },

  body: {
    measurements: () => ['body', 'measurements'] as const,
    photos: () => ['body', 'photos'] as const,
  },

  goals: () => ['goals'] as const,
} as const;
