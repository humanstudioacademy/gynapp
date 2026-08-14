import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { OptionCard } from '@/components/ui/OptionCard';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import { useEquipment, useMuscleGroups } from '@/features/catalog/hooks';
import { LEVEL_OPTIONS, levelLabel } from '@/i18n/labels';
import type { Database } from '@/lib/supabase/database.types';
import { useTheme } from '@/theme/ThemeProvider';

import type { CustomExerciseInput } from './api';

type Enums = Database['public']['Enums'];

const TRACKING_OPTIONS: { value: Enums['tracking_type']; label: string; hint: string }[] = [
  { value: 'weight_reps', label: 'Carga × reps', hint: 'O padrão da musculação' },
  { value: 'reps_only', label: 'Só repetições', hint: 'Peso corporal, como flexão' },
  { value: 'duration', label: 'Tempo', hint: 'Prancha, isometria' },
  { value: 'weight_duration', label: 'Carga e tempo', hint: 'Prancha com anilha' },
  { value: 'distance_duration', label: 'Distância e tempo', hint: 'Esteira, remo' },
];

type Props = {
  initial?: Partial<CustomExerciseInput>;
  submitLabel: string;
  saving: boolean;
  onSubmit: (input: CustomExerciseInput) => void;
  onDelete?: () => void;
  deleteLabel?: string;
};

export function ExerciseForm({
  initial,
  submitLabel,
  saving,
  onSubmit,
  onDelete,
  deleteLabel,
}: Props) {
  const muscleGroups = useMuscleGroups();
  const equipment = useEquipment();
  const { colors } = useTheme();

  const [namePt, setNamePt] = useState(initial?.namePt ?? '');
  const [muscleGroupId, setMuscleGroupId] = useState<string | null>(
    initial?.primaryMuscleGroupId ?? null,
  );
  const [equipmentId, setEquipmentId] = useState<string | null>(initial?.equipmentId ?? null);
  const [trackingType, setTrackingType] = useState<Enums['tracking_type']>(
    initial?.trackingType ?? 'weight_reps',
  );
  const [difficulty, setDifficulty] = useState<Enums['experience_level']>(
    initial?.difficulty ?? 'beginner',
  );
  const [mechanic, setMechanic] = useState<Enums['exercise_mechanic'] | null>(
    initial?.mechanic ?? null,
  );
  const [isUnilateral, setIsUnilateral] = useState(initial?.isUnilateral ?? false);
  const [instructions, setInstructions] = useState<string[]>(initial?.instructions ?? []);
  const [newStep, setNewStep] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [groupError, setGroupError] = useState<string | null>(null);

  function addStep() {
    const trimmed = newStep.trim();
    if (trimmed.length === 0) return;
    setInstructions((current) => [...current, trimmed]);
    setNewStep('');
  }

  function submit() {
    const trimmedName = namePt.trim();
    if (trimmedName.length < 2) {
      setNameError('Dê um nome ao exercício.');
      return;
    }
    setNameError(null);

    if (!muscleGroupId) {
      setGroupError('Escolha o grupo muscular principal.');
      return;
    }
    setGroupError(null);

    onSubmit({
      namePt: trimmedName,
      primaryMuscleGroupId: muscleGroupId,
      equipmentId,
      trackingType,
      difficulty,
      isUnilateral,
      mechanic,
      instructions,
    });
  }

  return (
    <View className="gap-6 pb-4">
      <Input
        label="Nome do exercício"
        value={namePt}
        onChangeText={setNamePt}
        error={nameError ?? undefined}
        placeholder="Ex.: Supino inclinado com halteres"
        autoCapitalize="sentences"
      />

      <View className="gap-2">
        <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
          Grupo muscular principal
        </Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Grupo muscular" className="gap-2">
          {(muscleGroups.data ?? []).map((group) => (
            <OptionCard
              key={group.id}
              title={group.name_pt}
              selected={muscleGroupId === group.id}
              onPress={() => setMuscleGroupId(group.id)}
            />
          ))}
        </View>
        {groupError ? (
          <Text accessibilityRole="alert" className="text-[13px] text-danger">
            {groupError}
          </Text>
        ) : null}
      </View>

      <View className="gap-2">
        <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
          Equipamento
        </Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Equipamento" className="gap-2">
          <OptionCard
            title="Nenhum"
            selected={equipmentId === null}
            onPress={() => setEquipmentId(null)}
          />
          {(equipment.data ?? []).map((item) => (
            <OptionCard
              key={item.id}
              title={item.name_pt}
              selected={equipmentId === item.id}
              onPress={() => setEquipmentId(item.id)}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
          Como registrar
        </Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Como registrar" className="gap-2">
          {TRACKING_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              title={option.label}
              description={option.hint}
              selected={trackingType === option.value}
              onPress={() => setTrackingType(option.value)}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
          Dificuldade
        </Text>
        <SegmentedControl
          label="Dificuldade"
          value={difficulty}
          onChange={setDifficulty}
          options={LEVEL_OPTIONS.map((level) => ({ value: level, label: levelLabel[level] }))}
        />
      </View>

      <View className="gap-2">
        <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
          Mecânica
        </Text>
        <SegmentedControl
          label="Mecânica"
          value={mechanic ?? 'none'}
          onChange={(value) => setMechanic(value === 'none' ? null : (value as Enums['exercise_mechanic']))}
          options={[
            { value: 'none', label: 'Não sei' },
            { value: 'compound', label: 'Composto' },
            { value: 'isolation', label: 'Isolado' },
          ]}
        />
      </View>

      <Card>
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-base text-neutral-900 dark:text-neutral-50">Unilateral</Text>
            <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
              Um lado de cada vez, como remada serrote.
            </Text>
          </View>
          <Switch label="Unilateral" value={isUnilateral} onValueChange={setIsUnilateral} />
        </View>
      </Card>

      <View className="gap-2">
        <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
          Como executar (opcional)
        </Text>

        {instructions.map((step, index) => (
          <View
            key={step}
            className="flex-row items-center gap-3 rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-400">
              <Text className="text-[13px] font-bold text-neutral-950">{index + 1}</Text>
            </View>
            <Text className="flex-1 text-[15px] text-neutral-900 dark:text-neutral-50">{step}</Text>
            <Pressable
              onPress={() => setInstructions((current) => current.filter((s) => s !== step))}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Remover o passo ${index + 1}`}
              className="h-11 w-11 items-center justify-center"
            >
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        ))}

        <Input
          value={newStep}
          onChangeText={setNewStep}
          placeholder="Descreva um passo e toque em adicionar"
          onSubmitEditing={addStep}
          returnKeyType="done"
        />
        <Button
          title="Adicionar passo"
          variant="secondary"
          onPress={addStep}
          disabled={newStep.trim().length === 0}
        />
      </View>

      <Button title={submitLabel} size="lg" fullWidth loading={saving} onPress={submit} />

      {onDelete ? (
        <Button
          title={deleteLabel ?? 'Excluir exercício'}
          variant="danger"
          size="lg"
          fullWidth
          onPress={onDelete}
        />
      ) : null}
    </View>
  );
}
