import { router } from 'expo-router';
import { TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/Toast';
import { authErrorMessage, updatePassword } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';
import { deleteAccount } from '@/features/profile/deleteAccount';
import { supabase } from '@/lib/supabase/client';
import { useTheme } from '@/theme/ThemeProvider';

const CONFIRM_WORD = 'EXCLUIR';

export default function AccountSettingsScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const toast = useToast();

  const [newEmail, setNewEmail] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onChangeEmail() {
    const email = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.show('E-mail inválido.', 'error');
      return;
    }

    setEmailBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      setNewEmail('');
      toast.show('Confirme a troca no link que enviamos para o novo e-mail.', 'success');
    } catch (error) {
      toast.show(authErrorMessage(error), 'error');
    } finally {
      setEmailBusy(false);
    }
  }

  async function onChangePassword() {
    if (password.length < 8 || !/[A-Za-zÀ-ÿ]/.test(password) || !/[0-9]/.test(password)) {
      setPasswordError('Use pelo menos 8 caracteres, com letra e número.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('As senhas não conferem.');
      return;
    }
    setPasswordError(null);

    setPasswordBusy(true);
    try {
      await updatePassword(password);
      setPassword('');
      setConfirmPassword('');
      toast.show('Senha alterada.', 'success');
    } catch (error) {
      toast.show(authErrorMessage(error), 'error');
    } finally {
      setPasswordBusy(false);
    }
  }

  async function runDelete() {
    setDeleting(true);
    try {
      await deleteAccount();
      setConfirmVisible(false);
      // O signOut dentro de deleteAccount derruba a sessão; o guard leva ao welcome.
      router.replace('/welcome');
    } catch (error) {
      toast.show(authErrorMessage(error), 'error');
      setDeleting(false);
    }
  }

  return (
    <Screen>
      <Header title="Conta" />

      <View className="gap-6 py-2">
        <Card className="gap-4">
          <View className="gap-1">
            <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              E-mail
            </Text>
            <Text className="text-[13px] text-neutral-500 dark:text-neutral-400">
              Atual: {session?.user.email ?? '—'}
            </Text>
          </View>
          <Input
            label="Novo e-mail"
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="novo@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />
          <Button
            title="Trocar e-mail"
            variant="secondary"
            fullWidth
            loading={emailBusy}
            disabled={newEmail.trim().length === 0}
            onPress={() => void onChangeEmail()}
          />
        </Card>

        <Card className="gap-4">
          <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
            Trocar senha
          </Text>
          <Input
            label="Nova senha"
            value={password}
            onChangeText={setPassword}
            error={passwordError ?? undefined}
            hint="Pelo menos 8 caracteres, com letra e número."
            secure
            autoCapitalize="none"
            textContentType="newPassword"
          />
          <Input
            label="Confirmar nova senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secure
            autoCapitalize="none"
            textContentType="newPassword"
          />
          <Button
            title="Salvar senha"
            variant="secondary"
            fullWidth
            loading={passwordBusy}
            disabled={password.length === 0}
            onPress={() => void onChangePassword()}
          />
        </Card>

        <Card className="gap-4">
          <View className="flex-row items-center gap-2">
            <TriangleAlert size={20} color={colors.danger} />
            <Text className="text-base font-semibold text-danger">Excluir conta</Text>
          </View>
          <Text className="text-[15px] leading-6 text-neutral-500 dark:text-neutral-400">
            Apaga sua conta e todo o histórico: treinos, séries, recordes, medidas e fotos. Essa
            ação é definitiva.
          </Text>
          <Input
            label={`Digite ${CONFIRM_WORD} para liberar o botão`}
            value={confirmText}
            onChangeText={setConfirmText}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder={CONFIRM_WORD}
          />
          <Button
            title="Excluir minha conta"
            variant="danger"
            fullWidth
            loading={deleting}
            disabled={confirmText.trim().toUpperCase() !== CONFIRM_WORD}
            onPress={() => setConfirmVisible(true)}
            testID="delete-account"
          />
        </Card>
      </View>

      <ConfirmDialog
        visible={confirmVisible}
        title="Excluir sua conta?"
        message="Todos os seus treinos, medidas, fotos e recordes serão apagados para sempre. Não dá para desfazer."
        confirmLabel="Excluir tudo"
        destructive
        loading={deleting}
        onConfirm={() => void runDelete()}
        onCancel={() => setConfirmVisible(false)}
      />
    </Screen>
  );
}
