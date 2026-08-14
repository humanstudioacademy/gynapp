import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';
import { Platform } from 'react-native';

const TAG = 'gymapp-session';

/**
 * Mantém a tela ligada durante o treino, respeitando `user_settings.keep_screen_on`.
 *
 * Não usa `useKeepAwake()` de propósito: aquele hook estoura
 * "The wake lock has not activated yet" quando o desativar roda antes de o
 * ativar resolver — o que acontece ao sair rápido do player, e sempre na web,
 * onde a Wake Lock API exige gesto do usuário. Aqui as duas pontas são
 * tratadas: falhar em manter a tela acesa não pode derrubar o treino.
 */
export function useKeepScreenOn(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;

    let active = false;

    void activateKeepAwakeAsync(TAG)
      .then(() => {
        active = true;
      })
      .catch(() => {
        // Sem wake lock o treino segue normalmente; a tela só apaga sozinha.
      });

    return () => {
      if (!active) return;
      try {
        deactivateKeepAwake(TAG);
      } catch {
        // idem: nada a fazer, e não vale quebrar a saída da tela.
      }
    };
  }, [enabled]);
}
