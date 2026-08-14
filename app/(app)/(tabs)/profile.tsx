import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, LogOut, Settings } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { OptionCard } from '@/components/ui/OptionCard';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';
import { avatarUrl, type Profile } from '@/features/profile/api';
import { useProfile, useSettings, useUpdateProfile, useUploadAvatar } from '@/features/profile/hooks';
import {
  GENDER_OPTIONS,
  genderLabel,
  GOAL_OPTIONS,
  goalLabel,
  LEVEL_OPTIONS,
  levelLabel,
} from '@/i18n/labels';
import type { Database } from '@/lib/supabase/database.types';
import { useTheme } from '@/theme/ThemeProvider';
import { brDateToIso, isoToBrDate, maskBrDate } from '@/utils/date';
import { displayLength, inputLengthToCm, lengthUnit, type UnitSystem } from '@/utils/units';

type Enums = Database['public']['Enums'];

export default function ProfileScreen() {
  const profile = useProfile();
  const { data: settings } = useSettings();
  const { signOut } = useAuth();
  const { colors } = useTheme();
  const [signOutVisible, setSignOutVisible] = useState(false);

  return (
    <Screen>
      <View className="gap-6 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-[28px] font-bold text-neutral-900 dark:text-neutral-50">Perfil</Text>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Configurações"
            className="h-11 w-11 items-center justify-center"
          >
            <Settings size={22} color={colors.text} />
          </Pressable>
        </View>

        {profile.isPending ? (
          <View className="py-12">
            <ActivityIndicator />
          </View>
        ) : profile.isError || !profile.data ? (
          <ErrorState onRetry={() => void profile.refetch()} />
        ) : (
          // Remonta ao invés de sincronizar estado do servidor dentro de efeito.
          <ProfileForm
            key={profile.data.updated_at}
            profile={profile.data}
            unitSystem={settings?.unit_system ?? 'metric'}
          />
        )}

        <Card>
          <Pressable
            onPress={() => setSignOutVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            className="min-h-[44px] flex-row items-center gap-3"
          >
            <LogOut size={20} color={colors.danger} />
            <Text className="text-base text-danger">Sair da conta</Text>
          </Pressable>
        </Card>
      </View>

      <ConfirmDialog
        visible={signOutVisible}
        title="Sair da conta?"
        message="Seus dados continuam salvos na nuvem. É só entrar de novo quando quiser."
        confirmLabel="Sair"
        destructive
        onConfirm={() => {
          setSignOutVisible(false);
          void signOut();
        }}
        onCancel={() => setSignOutVisible(false)}
      />
    </Screen>
  );
}

function ProfileForm({ profile, unitSystem }: { profile: Profile; unitSystem: UnitSystem }) {
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const { colors } = useTheme();
  const toast = useToast();

  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [birthDate, setBirthDate] = useState(isoToBrDate(profile.birth_date));
  const [height, setHeight] = useState(() => {
    const displayed = displayLength(profile.height_cm, unitSystem);
    return displayed == null ? '' : String(displayed);
  });
  const [gender, setGender] = useState<Enums['gender_type']>(profile.gender);
  const [goal, setGoal] = useState<Enums['fitness_goal']>(profile.primary_goal);
  const [level, setLevel] = useState<Enums['experience_level']>(profile.experience_level);
  const [dateError, setDateError] = useState<string | null>(null);

  async function onPickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.show('Precisamos da permissão de fotos para trocar seu avatar.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    const asset = result.assets?.[0];
    if (result.canceled || !asset) return;

    try {
      await uploadAvatar.mutateAsync(asset.uri);
      toast.show('Foto atualizada.', 'success');
    } catch (error) {
      toast.show(authErrorMessage(error), 'error');
    }
  }

  async function onSave() {
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      toast.show('Informe seu nome.', 'error');
      return;
    }

    let isoBirth: string | null = null;
    if (birthDate.length > 0) {
      isoBirth = brDateToIso(birthDate);
      if (!isoBirth) {
        setDateError('Data inválida. Use DD/MM/AAAA.');
        return;
      }
    }
    setDateError(null);

    const raw = height.replace(',', '.').trim();
    const parsed = raw === '' ? null : Number(raw);
    if (parsed != null && !Number.isFinite(parsed)) {
      toast.show('Altura inválida.', 'error');
      return;
    }
    const heightCm = parsed == null ? null : inputLengthToCm(parsed, unitSystem);
    if (heightCm != null && (heightCm < 50 || heightCm > 260)) {
      toast.show('Altura fora do esperado. Confira o valor.', 'error');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        full_name: trimmed,
        birth_date: isoBirth,
        gender,
        height_cm: heightCm,
        primary_goal: goal,
        experience_level: level,
      });
      toast.show('Perfil salvo.', 'success');
    } catch (error) {
      toast.show(authErrorMessage(error), 'error');
    }
  }

  return (
    <View className="gap-6">
      <View className="items-center">
        <Pressable
          onPress={() => void onPickAvatar()}
          accessibilityRole="button"
          accessibilityLabel="Trocar foto de perfil"
          className="active:opacity-80"
        >
          <Avatar uri={avatarUrl(profile.avatar_path)} name={profile.full_name} size="lg" />
          <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-50 bg-brand-500 dark:border-neutral-950">
            {uploadAvatar.isPending ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Camera size={16} color={colors.textInverse} />
            )}
          </View>
        </Pressable>
      </View>

      <View className="gap-5">
        <Input
          label="Nome"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          textContentType="name"
        />
        <Input
          label="Data de nascimento"
          value={birthDate}
          onChangeText={(text) => setBirthDate(maskBrDate(text))}
          error={dateError ?? undefined}
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
          maxLength={10}
        />
        <Input
          label={`Altura (${lengthUnit(unitSystem)})`}
          value={height}
          onChangeText={setHeight}
          keyboardType="decimal-pad"
        />
      </View>

      <Section title="Sexo">
        {GENDER_OPTIONS.map((option) => (
          <OptionCard
            key={option}
            title={genderLabel[option]}
            selected={gender === option}
            onPress={() => setGender(option)}
          />
        ))}
      </Section>

      <Section title="Objetivo principal">
        {GOAL_OPTIONS.map((option) => (
          <OptionCard
            key={option}
            title={goalLabel[option]}
            selected={goal === option}
            onPress={() => setGoal(option)}
          />
        ))}
      </Section>

      <Section title="Nível de experiência">
        {LEVEL_OPTIONS.map((option) => (
          <OptionCard
            key={option}
            title={levelLabel[option]}
            selected={level === option}
            onPress={() => setLevel(option)}
          />
        ))}
      </Section>

      <Button
        title="Salvar alterações"
        size="lg"
        fullWidth
        loading={updateProfile.isPending}
        onPress={() => void onSave()}
        testID="profile-save"
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400">{title}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={title} className="gap-2">
        {children}
      </View>
    </View>
  );
}
