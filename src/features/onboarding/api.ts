import { randomUUID } from 'expo-crypto';

import {
  updateProfile,
  updateSettings,
  type Profile,
  type UserSettings,
} from '@/features/profile/api';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import { todayIso } from '@/utils/date';

type Enums = Database['public']['Enums'];

export type GenderType = Enums['gender_type'];
export type FitnessGoal = Enums['fitness_goal'];
export type ExperienceLevel = Enums['experience_level'];
export type UnitSystem = Enums['unit_system'];

export async function saveProfileStep(input: {
  fullName: string;
  birthDate: string | null;
  gender: GenderType;
}): Promise<Profile> {
  return updateProfile({
    full_name: input.fullName,
    birth_date: input.birthDate,
    gender: input.gender,
  });
}

/**
 * Altura fica no perfil; peso vira a primeira medição corporal.
 * `client_id` é o que garante idempotência se a chamada for repetida offline.
 */
export async function saveBodyStep(input: {
  heightCm: number | null;
  weightKg: number | null;
  unitSystem: UnitSystem;
}): Promise<{ profile: Profile; settings: UserSettings }> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Sessão expirada.');

  const profile = await updateProfile({ height_cm: input.heightCm });
  const settings = await updateSettings({ unit_system: input.unitSystem });

  if (input.weightKg != null) {
    const { error } = await supabase.from('body_measurements').upsert(
      {
        client_id: randomUUID(),
        user_id: userId,
        measured_on: todayIso(),
        weight_kg: input.weightKg,
      },
      { onConflict: 'user_id,measured_on' },
    );
    if (error) throw error;
  }

  return { profile, settings };
}

export async function saveGoalStep(input: {
  primaryGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
}): Promise<Profile> {
  return updateProfile({
    primary_goal: input.primaryGoal,
    experience_level: input.experienceLevel,
  });
}

/** Último passo: grava frequência, lembretes e fecha o onboarding. */
export async function completeOnboarding(input: {
  weeklySessionGoal: number;
  remindersEnabled: boolean;
  reminderTime: string;
  reminderWeekdays: number[];
}): Promise<{ profile: Profile; settings: UserSettings }> {
  const settings = await updateSettings({
    workout_reminders_enabled: input.remindersEnabled,
    reminder_time: input.reminderTime,
    reminder_weekdays: input.reminderWeekdays,
  });

  const profile = await updateProfile({
    weekly_session_goal: input.weeklySessionGoal,
    onboarding_completed: true,
  });

  return { profile, settings };
}
