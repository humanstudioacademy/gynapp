import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Input } from '@/components/ui/Input';
import { OptionCard } from '@/components/ui/OptionCard';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import type { GenderType } from '@/features/onboarding/api';
import { useSaveProfileStep } from '@/features/onboarding/hooks';
import { OnboardingStep } from '@/features/onboarding/OnboardingStep';
import { useProfile } from '@/features/profile/hooks';
import { GENDER_OPTIONS, genderLabel } from '@/i18n/labels';
import { brDateToIso, isoToBrDate, maskBrDate } from '@/utils/date';

export default function OnboardingProfileScreen() {
  const { data: profile } = useProfile();
  const saveStep = useSaveProfileStep();
  const toast = useToast();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [birthDate, setBirthDate] = useState(isoToBrDate(profile?.birth_date));
  const [gender, setGender] = useState<GenderType>(profile?.gender ?? 'undisclosed');
  const [nameError, setNameError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  async function onNext() {
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      setNameError('Informe seu nome.');
      return;
    }
    setNameError(null);

    let isoBirth: string | null = null;
    if (birthDate.length > 0) {
      isoBirth = brDateToIso(birthDate);
      if (!isoBirth) {
        setDateError('Data inválida. Use DD/MM/AAAA.');
        return;
      }
      if (isoBirth >= new Date().toISOString().slice(0, 10)) {
        setDateError('A data precisa ser no passado.');
        return;
      }
    }
    setDateError(null);

    try {
      await saveStep.mutateAsync({ fullName: trimmed, birthDate: isoBirth, gender });
      router.push('/onboarding/body');
    } catch (error) {
      toast.show(authErrorMessage(error), 'error');
    }
  }

  return (
    <OnboardingStep
      step={1}
      title="Vamos nos conhecer"
      subtitle="Isso deixa o app com a sua cara e ajuda a calibrar as sugestões de treino."
      onNext={() => void onNext()}
      loading={saveStep.isPending}
    >
      <View className="gap-5">
        <Input
          label="Como quer ser chamado"
          value={fullName}
          onChangeText={setFullName}
          error={nameError ?? undefined}
          placeholder="Seu nome"
          autoCapitalize="words"
          textContentType="name"
        />

        <Input
          label="Data de nascimento (opcional)"
          value={birthDate}
          onChangeText={(text) => setBirthDate(maskBrDate(text))}
          error={dateError ?? undefined}
          hint="Usamos só para calcular faixas de referência."
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
          maxLength={10}
        />

        <View className="gap-2">
          <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
            Sexo
          </Text>
          <View className="gap-2">
            {GENDER_OPTIONS.map((option) => (
              <OptionCard
                key={option}
                title={genderLabel[option]}
                selected={gender === option}
                onPress={() => setGender(option)}
              />
            ))}
          </View>
        </View>
      </View>
    </OnboardingStep>
  );
}
