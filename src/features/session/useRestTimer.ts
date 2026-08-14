import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Vibration } from 'react-native';

import { cancelNotification, scheduleRestEndNotification } from '@/lib/notifications';

export type RestTimer = {
  /** Segundos restantes; null quando não há descanso rodando. */
  remaining: number | null;
  total: number;
  isRunning: boolean;
  start: (seconds: number, exerciseName?: string) => void;
  adjust: (delta: number) => void;
  skip: () => void;
};

/**
 * Timer de descanso baseado em **timestamp de término**, não em contador.
 * Um contador decrementado a cada tick para de andar quando o JS é suspenso em
 * segundo plano; comparar com `Date.now()` devolve o valor certo ao voltar.
 * O aviso sonoro fica agendado no SO, então toca mesmo com o app fechado.
 */
export function useRestTimer(options: {
  soundEnabled: boolean;
  vibrateEnabled: boolean;
}): RestTimer {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);

  const notificationId = useRef<string | null>(null);
  const exerciseName = useRef<string | undefined>(undefined);
  const firedFor = useRef<number | null>(null);

  const { soundEnabled, vibrateEnabled } = options;

  const clear = useCallback(() => {
    void cancelNotification(notificationId.current);
    notificationId.current = null;
    setEndsAt(null);
    setRemaining(null);
    setTotal(0);
  }, []);

  const start = useCallback(
    (seconds: number, name?: string) => {
      if (seconds <= 0) return;
      void cancelNotification(notificationId.current);

      exerciseName.current = name;
      firedFor.current = null;
      const target = Date.now() + seconds * 1000;
      setEndsAt(target);
      setTotal(seconds);
      setRemaining(seconds);

      void scheduleRestEndNotification(seconds, name).then((id) => {
        notificationId.current = id;
      });
    },
    [],
  );

  const adjust = useCallback(
    (delta: number) => {
      setEndsAt((current) => {
        if (current == null) return current;
        const next = Math.max(Date.now(), current + delta * 1000);
        const secondsLeft = Math.round((next - Date.now()) / 1000);

        // Reagenda: o aviso do SO precisa acompanhar o novo horário.
        void cancelNotification(notificationId.current).then(() =>
          scheduleRestEndNotification(secondsLeft, exerciseName.current).then((id) => {
            notificationId.current = id;
          }),
        );

        return next;
      });
      setTotal((current) => Math.max(0, current + delta));
    },
    [],
  );

  useEffect(() => {
    if (endsAt == null) return;

    const tick = () => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemaining(left);

      if (left === 0 && firedFor.current !== endsAt) {
        firedFor.current = endsAt;
        if (Platform.OS !== 'web') {
          if (vibrateEnabled) Vibration.vibrate([0, 250, 250, 250]);
          if (soundEnabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    };

    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [endsAt, soundEnabled, vibrateEnabled]);

  useEffect(() => () => void cancelNotification(notificationId.current), []);

  return {
    remaining,
    total,
    isRunning: endsAt != null && (remaining ?? 0) > 0,
    start,
    adjust,
    skip: clear,
  };
}
