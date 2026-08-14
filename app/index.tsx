import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { useCatalogCounts, useMuscleGroups } from '@/features/catalog/hooks';
import { supabase } from '@/lib/supabase/client';
import { palette } from '@/theme/tokens';

/**
 * Tela de verificação da Fase 0.
 * Exercita toda a pilha: env → cliente Supabase → SecureStore → Auth → RLS →
 * TanStack Query → NativeWind → tokens de tema.
 * Será substituída pelo splash/redirecionador real na Fase 1.
 */
export default function Phase0Screen() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <Screen scroll={false}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="gap-4 py-6">
        <View className="gap-1">
          <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">GymApp</Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Fase 0 — verificação da fundação
          </Text>
        </View>

        <EnvironmentCard />
        {session ? <AuthenticatedPanel session={session} /> : <SignInPanel />}
      </View>
    </Screen>
  );
}

function EnvironmentCard() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const env = process.env.EXPO_PUBLIC_APP_ENV ?? '';
  const projectRef = url.replace('https://', '').split('.')[0] ?? '—';

  return (
    <Card>
      <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Ambiente
      </Text>
      <Row label="Projeto Supabase" value={projectRef} />
      <Row label="EXPO_PUBLIC_APP_ENV" value={env || '(vazio)'} />
      <Row label="Chave anônima" value={process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'carregada' : 'ausente'} />
    </Card>
  );
}

function SignInPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function signIn() {
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) setMessage(error.message);
    setBusy(false);
  }

  async function signUp() {
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    setMessage(error ? error.message : 'Conta criada. Confirme o e-mail e entre.');
    setBusy(false);
  }

  return (
    <Card>
      <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Autenticação
      </Text>
      <Text className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
        O catálogo é protegido por RLS — só usuário autenticado consegue ler. Entre para validar a
        pilha completa.
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="e-mail"
        placeholderTextColor={palette.neutral[500]}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        accessibilityLabel="E-mail"
        className="mb-2 h-12 rounded-md border border-neutral-300 px-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="senha"
        placeholderTextColor={palette.neutral[500]}
        secureTextEntry
        accessibilityLabel="Senha"
        className="mb-4 h-12 rounded-md border border-neutral-300 px-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
      />

      <View className="gap-2">
        <Button title="Entrar" onPress={() => void signIn()} loading={busy} fullWidth size="lg" />
        <Button title="Criar conta" onPress={() => void signUp()} variant="secondary" fullWidth />
      </View>

      {message ? (
        <Text className="mt-3 text-sm text-warning">{message}</Text>
      ) : null}
    </Card>
  );
}

function AuthenticatedPanel({ session }: { session: Session }) {
  const counts = useCatalogCounts();
  const groups = useMuscleGroups();

  return (
    <View className="gap-4">
      <Card>
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Sessão
        </Text>
        <Row label="Usuário" value={session.user.email ?? session.user.id} />
        <Row label="Token" value="salvo no SecureStore" />
        <View className="mt-3">
          <Button
            title="Sair"
            variant="secondary"
            onPress={() => void supabase.auth.signOut()}
            fullWidth
          />
        </View>
      </Card>

      <Card>
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Banco de dados
        </Text>
        {counts.isPending ? (
          <ActivityIndicator />
        ) : counts.isError ? (
          <Text className="text-sm text-danger">{(counts.error as Error).message}</Text>
        ) : (
          <View className="flex-row justify-between">
            <Stat value={counts.data.exercises} label="exercícios" />
            <Stat value={counts.data.templates} label="templates" />
            <Stat value={counts.data.muscleGroups} label="grupos" />
          </View>
        )}
      </Card>

      <Card>
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Grupos musculares (do seed)
        </Text>
        {groups.isPending ? (
          <ActivityIndicator />
        ) : groups.isError ? (
          <Text className="text-sm text-danger">{(groups.error as Error).message}</Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {groups.data.map((g) => (
              <View
                key={g.id}
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: `${g.color_hex}22` }}
              >
                <Text className="text-sm font-medium" style={{ color: g.color_hex }}>
                  {g.name_pt}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">{label}</Text>
      <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{value}</Text>
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-2xl font-bold text-brand-600 dark:text-brand-500">{value}</Text>
      <Text className="text-xs text-neutral-500 dark:text-neutral-400">{label}</Text>
    </View>
  );
}
