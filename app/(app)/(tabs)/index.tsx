import { router } from 'expo-router';
import { CalendarCheck, Play } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage } from '@/features/auth/api';
import { usePlanDetail } from '@/features/plans/hooks';
import { avatarUrl } from '@/features/profile/api';
import { useProfile } from '@/features/profile/hooks';
import { useActiveSession, useStartSession } from '@/features/session/hooks';
import { useSessionClock } from '@/features/session/useSessionClock';
import { palette } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { formatTimer } from '@/utils/format';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function HomeScreen() {
  const { data: profile } = useProfile();
  const activeSession = useActiveSession();
  const activePlan = usePlanDetail(profile?.active_plan_id ?? undefined);
  const startSession = useStartSession();
  const { colors } = useTheme();
  const toast = useToast();

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] ?? '';
  const session = activeSession.data;
  const nextDay = activePlan.data?.days[0] ?? null;

  // Date.now() no corpo do render é função impura — o relógio vive no hook.
  const elapsed = useSessionClock({
    startedAt: session?.started_at ?? null,
    pausedSeconds: session?.paused_seconds ?? 0,
    pausedAt: null,
  });
  const doneSets = session?.exercises.flatMap((item) => item.sets).filter((s) => s.is_completed).length ?? 0;

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

        {/* Sessão em andamento tem prioridade visual sobre iniciar (docs/05). */}
        {session ? (
          <Pressable
            onPress={() => router.push('/session/active')}
            accessibilityRole="button"
            accessibilityLabel="Continuar treino em andamento"
            className="gap-2 rounded-lg bg-brand-500 p-4"
          >
            <View className="flex-row items-center gap-2">
              <Play size={18} color={palette.neutral[950]} />
              <Text className="text-[11px] font-bold uppercase tracking-wide text-neutral-950">
                Continuar treino
              </Text>
            </View>
            <Text className="text-[18px] font-bold text-neutral-950">{session.name}</Text>
            <Text className="text-[13px] text-neutral-950/70">
              {formatTimer(elapsed)} · {doneSets} {doneSets === 1 ? 'série' : 'séries'} marcadas
            </Text>
          </Pressable>
        ) : nextDay ? (
          <Card className="gap-3">
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Próximo treino
            </Text>
            <Text className="text-[18px] font-bold text-neutral-900 dark:text-neutral-50">
              {nextDay.name}
            </Text>
            <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
              {nextDay.exercise_count} exercícios
              {nextDay.estimated_minutes ? ` · ~${nextDay.estimated_minutes} min` : ''}
            </Text>
            <Button
              title="Iniciar treino"
              size="lg"
              fullWidth
              loading={startSession.isPending}
              onPress={() =>
                startSession.mutate(nextDay.id, {
                  onSuccess: () => router.push('/session/active'),
                  onError: (error) => toast.show(authErrorMessage(error), 'error'),
                })
              }
              testID="home-start"
            />
          </Card>
        ) : (
          <Card className="gap-3">
            <View className="flex-row items-center gap-3">
              <CalendarCheck size={22} color={colors.primary} />
              <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Sua meta desta semana
              </Text>
            </View>
            <Text className="text-[15px] leading-6 text-neutral-500 dark:text-neutral-400">
              {profile?.weekly_session_goal ?? 3} treinos por semana. Defina uma rotina como ativa
              para o próximo treino aparecer aqui com o botão de iniciar.
            </Text>
            <Button
              title="Ver minhas rotinas"
              variant="secondary"
              fullWidth
              onPress={() => router.push('/workouts')}
            />
          </Card>
        )}

        <Text className="text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
          Gráficos de volume, ofensiva e recordes entram na Fase 5.
        </Text>
      </View>
    </Screen>
  );
}
