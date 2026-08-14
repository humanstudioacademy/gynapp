import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Bell, Info, Palette, Ruler, ShieldCheck, UserCog } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { ListRow } from '@/components/ui/ListRow';
import { OptionCard } from '@/components/ui/OptionCard';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import { useSettings, useUpdateSettings } from '@/features/profile/hooks';
import { themeLabel, unitSystemLabel } from '@/i18n/labels';
import type { Database } from '@/lib/supabase/database.types';
import { useTheme } from '@/theme/ThemeProvider';

type Enums = Database['public']['Enums'];

const THEME_OPTIONS: Enums['theme_preference'][] = ['system', 'light', 'dark'];
const UNIT_OPTIONS: Enums['unit_system'][] = ['metric', 'imperial'];

export default function SettingsScreen() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { setPreference } = useTheme();
  const toast = useToast();

  const [themeSheet, setThemeSheet] = useState(false);
  const [unitSheet, setUnitSheet] = useState(false);

  async function changeTheme(theme: Enums['theme_preference']) {
    setThemeSheet(false);
    setPreference(theme); // aplica na hora; o banco confirma logo em seguida
    try {
      await updateSettings.mutateAsync({ theme });
    } catch (error) {
      toast.show(authErrorMessage(error), 'error');
    }
  }

  async function changeUnits(unit: Enums['unit_system']) {
    setUnitSheet(false);
    try {
      await updateSettings.mutateAsync({ unit_system: unit });
      toast.show('Unidades atualizadas.', 'success');
    } catch (error) {
      toast.show(authErrorMessage(error), 'error');
    }
  }

  return (
    <Screen padded={false}>
      <View className="px-4">
        <Header title="Configurações" />
      </View>

      <View className="gap-6 px-4 py-2">
        <Card className="gap-0 p-0">
          <ListRow
            icon={UserCog}
            title="Conta"
            subtitle="E-mail, senha e exclusão"
            onPress={() => router.push('/settings/account')}
          />
          <Divider />
          <ListRow
            icon={Bell}
            title="Notificações"
            subtitle="Lembretes e timer de descanso"
            onPress={() => router.push('/settings/notifications')}
          />
        </Card>

        <Card className="gap-0 p-0">
          <ListRow
            icon={Palette}
            title="Aparência"
            value={settings ? themeLabel[settings.theme] : undefined}
            onPress={() => setThemeSheet(true)}
          />
          <Divider />
          <ListRow
            icon={Ruler}
            title="Unidades"
            value={settings ? unitSystemLabel[settings.unit_system] : undefined}
            onPress={() => setUnitSheet(true)}
          />
        </Card>

        <Card className="gap-0 p-0">
          <ListRow
            icon={ShieldCheck}
            title="Privacidade"
            subtitle="Política, termos e exportar dados"
            onPress={() => router.push('/settings/privacy')}
          />
          <Divider />
          <ListRow
            icon={Info}
            title="Sobre"
            value={`Versão ${Constants.expoConfig?.version ?? '1.0.0'}`}
          />
        </Card>
      </View>

      <Sheet visible={themeSheet} onClose={() => setThemeSheet(false)} title="Aparência">
        <View accessibilityRole="radiogroup" accessibilityLabel="Aparência" className="gap-2">
          {THEME_OPTIONS.map((option) => (
            <OptionCard
              key={option}
              title={themeLabel[option]}
              selected={settings?.theme === option}
              onPress={() => void changeTheme(option)}
            />
          ))}
        </View>
      </Sheet>

      <Sheet visible={unitSheet} onClose={() => setUnitSheet(false)} title="Unidades">
        <View accessibilityRole="radiogroup" accessibilityLabel="Unidades" className="gap-2">
          {UNIT_OPTIONS.map((option) => (
            <OptionCard
              key={option}
              title={unitSystemLabel[option]}
              selected={settings?.unit_system === option}
              onPress={() => void changeUnits(option)}
            />
          ))}
        </View>
        <Text className="mt-3 text-[13px] text-neutral-500 dark:text-neutral-400">
          Os dados ficam sempre em kg e cm no servidor — a troca muda só como você vê.
        </Text>
      </Sheet>
    </Screen>
  );
}

function Divider() {
  return <View className="mx-4 h-px bg-neutral-200 dark:bg-neutral-800" />;
}
