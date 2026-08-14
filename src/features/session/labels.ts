import type { Database } from '@/lib/supabase/database.types';

type RecordType = Database['public']['Enums']['record_type'];

/** Como cada tipo de recorde é anunciado ao usuário (docs/07, seção 6). */
export const RECORD_LABEL: Record<RecordType, string> = {
  max_weight: 'Carga máxima',
  max_reps: 'Mais repetições',
  max_volume_set: 'Maior volume numa série',
  max_volume_session: 'Maior volume num treino',
  estimated_1rm: '1RM estimado',
  best_duration: 'Maior tempo',
  best_distance: 'Maior distância',
};

/** Unidade de cada recorde — sem isso "77,5" não diz nada. */
export const RECORD_UNIT: Record<RecordType, 'weight' | 'reps' | 'seconds' | 'meters'> = {
  max_weight: 'weight',
  max_reps: 'reps',
  max_volume_set: 'weight',
  max_volume_session: 'weight',
  estimated_1rm: 'weight',
  best_duration: 'seconds',
  best_distance: 'meters',
};

export const FEELING_EMOJI = ['😫', '😕', '😐', '🙂', '😄'] as const;
