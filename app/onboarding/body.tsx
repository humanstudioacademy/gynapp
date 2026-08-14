import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Input } from '@/components/ui/Input';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import type { UnitSystem } from '@/features/onboarding/api';
import { useSaveBodyStep } from '@/features/onboarding/hooks';
import { OnboardingStep } from '@/features/onboarding/OnboardingStep';
import { useProfile, useSettings } from '@/features/profile/hooks';
import {
  displayLength,
  inputLengthToCm,
  inputWeightToKg,
  lengthUnit,
  weightUnit,
} from '@/utils/units';

/** Aceita "72,5" e "72.5" — teclado numérico do iOS entrega vírgula em PT-BR. */
function parseDecimal(value: string): number | null {
  const normalized = value.replace(',', '.').trim();
  if (normalized === '') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function OnboardingBodyScreen() {
  const { data: profile } = useProfile();
  const { data: settings } = useSettings();
  const saveStep = useSaveBodyStep();
  const toast = useToast();

  const [unitSystem, setUnitSystem] = useState<UnitSystem>(settings?.unit_system ?? 'metric');
  const [height, setHeight] = useState(() => {
    const value = displayLength(profile?.height_cm ?? null, settings?.unit_system ?? 'metric');
    return value == null ? '' : String(value);
  });
  const [weight, setWeight] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function persist(skip: boolean) {
    const heightValue = skip ? null : parseDecimal(height);
    const weightValue = skip ? null : parseDecimal(weight);

    if (!skip) {
      const heightCm = heightValue == null ? null : inputLengthToCm(heightValue, unitSystem);
      const weightKg = weightValue == null ? null : inputWeightToKg(weightValue, unitSystem);

      if (heightCm != null && (heightCm < 50 || heightCm > 260)) {
        setError('Altura fora do esperado. Confira o valor.');
        return;
      }
      if (weightKg != null && (weightKg < 20 || weightKg > 500)) {
        setError('Peso fora do esperado. Confira o valor.');
        return;
      }
      setError(null);

      try {
        await saveStep.mutateAsync({ heightCm, weightKg, unitSystem });
      } catch (caught) {
        toast.show(authErrorMessage(caught), 'error');
        return;
      }
    }

    router.push('/onboarding/goal');
  }

  return (
    <OnboardingStep
      step={2}
      title="Seus números de hoje"
      subtitle="É o ponto de partida para acompanhar a evolução. Dá para mudar depois."
      onNext={() => void persist(false)}
      onSkip={() => void persist(true)}
      loading={saveStep.isPending}
    >
      <View className="gap-5">
        <View className="gap-2">
          <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
            Unidades
          </Text>
          <SegmentedControl
            label="Sistema de unidades"
            value={unitSystem}
            onChange={setUnitSystem}
            options={[
              { value: 'metric', label: 'kg · cm' },
              { value: 'imperial', label: 'lb · in' },
            ]}
          />
        </View>

        <Input
          label={`Altura (${lengthUnit(unitSystem)})`}
          value={height}
          onChangeText={setHeight}
          placeholder={unitSystem === 'metric' ? '175' : '69'}
          keyboardType="decimal-pad"
        />

        <Input
          label={`Peso atual (${weightUnit(unitSystem)})`}
          value={weight}
          onChangeText={setWeight}
          placeholder={unitSystem === 'metric' ? '72,5' : '160'}
          keyboardType="decimal-pad"
          hint="Vira sua primeira medição — o gráfico de peso começa aqui."
        />

        {error ? (
          <Text accessibilityRole="alert" className="text-[15px] text-danger">
            {error}
          </Text>
        ) : null}
      </View>
    </OnboardingStep>
  );
}
