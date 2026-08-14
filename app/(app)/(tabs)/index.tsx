import { router } from 'expo-router';
import { CalendarCheck } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { avatarUrl } from '@/features/profile/api';
import { useProfile } from '@/features/profile/hooks';
import { useTheme } from '@/theme/ThemeProvider';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Dashboard completo é entregável da Fase 5 (`get_dashboard_summary`). */
export default function HomeScreen() {
  const { data: profile } = useProfile();
  const { colors } = useTheme();
  const firstName = profile?.full_name?.trim().split(/\s+/)[0] ?? '';

  return (
    <Screen>
      <View className="gap-6 py-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-[22px] font-bold text-neutral-900 dark:text-neutral-50">
              {greeting()}
              {firstName ? `, ${firstName}` : ''} 👋
            </Text>
            <Text className="text-[15px] text-neutral-500 dark:text-neutral-400">
              Pronto para treinar?
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Abrir meu perfil"
            hitSlop={8}
            className="active:opacity-70"
          >
            <Avatar uri={avatarUrl(profile?.avatar_path)} name={profile?.full_name} size="sm" />
          </Pressable>
        </View>

        <Card className="gap-3">
          <View className="flex-row items-center gap-3">
            <CalendarCheck size={22} color={colors.primary} />
            <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Sua meta desta semana
            </Text>
          </View>
          <Text className="text-[15px] leading-6 text-neutral-500 dark:text-neutral-400">
            {profile?.weekly_session_goal ?? 3} treinos por semana. Assim que você montar sua
            primeira rotina, ela aparece aqui com o botão de iniciar.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
