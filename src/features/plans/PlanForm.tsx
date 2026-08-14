import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OptionCard } from '@/components/ui/OptionCard';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { GOAL_OPTIONS, goalLabel, LEVEL_OPTIONS, levelLabel } from '@/i18n/labels';
import type { Database } from '@/lib/supabase/database.types';

import type { PlanInput } from './api';

type Enums = Database['public']['Enums'];

const FREQUENCY_OPTIONS = [2, 3, 4, 5, 6] as const;

type Props = {
  initial?: Partial<PlanInput>;
  submitLabel: string;
  saving: boolean;
  onSubmit: (input: PlanInput) => void;
};

export function PlanForm({ initial, submitLabel, saving, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [goal, setGoal] = useState<Enums['fitness_goal'] | null>(initial?.goal ?? null);
  const [level, setLevel] = useState<Enums['experience_level'] | null>(initial?.level ?? null);
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(initial?.daysPerWeek ?? null);
  const [nameError, setNameError] = useState<string | null>(null);

  function submit() {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameError('Dê um nome à rotina.');
      return;
    }
    setNameError(null);

    onSubmit({
      name: trimmed,
      description: description.trim() === '' ? null : description.trim(),
      goal,
      level,
      daysPerWeek,
    });
  }

  return (
    <View className="gap-6 pb-4">
      <Input
        label="Nome da rotina"
        value={name}
        onChangeText={setName}
        error={nameError ?? undefined}
        placeholder="Ex.: Treino ABC — Hipertrofia"
        autoCapitalize="sentences"
      />

      <Input
        label="Descrição (opcional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Para que serve, quanto tempo pretende seguir…"
        autoCapitalize="sentences"
      />

      <View className="gap-2">
        <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
          Treinos por semana
        </Text>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Treinos por semana"
          className="flex-row gap-2"
        >
          {FREQUENCY_OPTIONS.map((option) => {
            const selected = daysPerWeek === option;
            return (
              <Pressable
                key={option}
                onPress={() => setDaysPerWeek(selected ? null : option)}
                accessibilityRole="radio"
                accessibilityLabel={`${option} treinos por semana`}
                accessibilityState={{ selected }}
                className={`h-14 flex-1 items-center justify-center rounded-md border ${
                  selected
                    ? 'border-brand-500 bg-brand-500'
                    : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
                }`}
              >
                <Text
                  className={`text-lg font-semibold ${
                    selected ? 'text-neutral-950' : 'text-neutral-900 dark:text-neutral-50'
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
          Nível
        </Text>
        <SegmentedControl
          label="Nível"
          value={level ?? 'none'}
          onChange={(value) =>
            setLevel(value === 'none' ? null : (value as Enums['experience_level']))
          }
          options={[
            { value: 'none', label: 'Qualquer' },
            ...LEVEL_OPTIONS.map((item) => ({ value: item, label: levelLabel[item] })),
          ]}
        />
      </View>

      <View className="gap-2">
        <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
          Objetivo (opcional)
        </Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Objetivo" className="gap-2">
          {GOAL_OPTIONS.map((option) => (
            <OptionCard
              key={option}
              title={goalLabel[option]}
              selected={goal === option}
              onPress={() => setGoal(goal === option ? null : option)}
            />
          ))}
        </View>
      </View>

      <Button title={submitLabel} size="lg" fullWidth loading={saving} onPress={submit} />
    </View>
  );
}
