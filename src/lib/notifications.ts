import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REST_CHANNEL = 'rest-timer';

/** Notificação aparece mesmo com o app aberto — o usuário pode estar na tela do player. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let permissionChecked = false;

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  if (!permissionChecked) {
    permissionChecked = true;
    // Canal com som e vibração — no Android a importância é definida aqui, não na notificação.
    await Notifications.setNotificationChannelAsync(REST_CHANNEL, {
      name: 'Timer de descanso',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/**
 * Agenda o aviso de fim de descanso. Fica agendado no sistema operacional, então
 * dispara mesmo com o app em segundo plano ou a tela bloqueada (docs/05).
 */
export async function scheduleRestEndNotification(
  seconds: number,
  exerciseName?: string,
): Promise<string | null> {
  if (Platform.OS === 'web' || seconds <= 0) return null;

  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Descanso terminou',
      body: exerciseName ? `Hora da próxima série de ${exerciseName}.` : 'Hora da próxima série.',
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: REST_CHANNEL } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
}

export async function cancelNotification(id: string | null): Promise<void> {
  if (!id || Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(id);
}
