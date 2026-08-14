import type { Database } from '@/lib/supabase/database.types';

import ptBR from './locales/pt-BR.json';

type Enums = Database['public']['Enums'];

/**
 * Rótulos dos enums do banco. Vêm do arquivo de tradução — nenhum texto
 * de domínio nasce dentro de componente.
 */
export const genderLabel: Record<Enums['gender_type'], string> = ptBR.gender;
export const goalLabel: Record<Enums['fitness_goal'], string> = ptBR.goal;
export const goalDescription: Record<Enums['fitness_goal'], string> = ptBR.goalDescription;
export const levelLabel: Record<Enums['experience_level'], string> = ptBR.level;
export const levelDescription: Record<Enums['experience_level'], string> = ptBR.levelDescription;
export const themeLabel: Record<Enums['theme_preference'], string> = ptBR.theme;
export const unitSystemLabel: Record<Enums['unit_system'], string> = ptBR.unitSystem;

/** Índice = dia da semana no padrão do Postgres/JS (0 = domingo). */
export const weekdayLabels: string[] = [
  ptBR.weekday['0'],
  ptBR.weekday['1'],
  ptBR.weekday['2'],
  ptBR.weekday['3'],
  ptBR.weekday['4'],
  ptBR.weekday['5'],
  ptBR.weekday['6'],
];

export const GENDER_OPTIONS = Object.keys(genderLabel) as Enums['gender_type'][];
export const GOAL_OPTIONS = Object.keys(goalLabel) as Enums['fitness_goal'][];
export const LEVEL_OPTIONS = Object.keys(levelLabel) as Enums['experience_level'][];
