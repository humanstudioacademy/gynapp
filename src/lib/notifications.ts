import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

const REST_CHANNEL = 'rest-timer';

/**
 * `expo-notifications` **não pode ser importado no topo do módulo**.
 *
 * Ao carregar, o pacote registra um listener de push token
 * (`DevicePushTokenAutoRegistration`). No Expo Go do Android isso lança desde o
 * SDK 53, e o erro sobe na cadeia de import — derrubando o player inteiro antes
 * de qualquer notificação ser agendada.
 *
 * Por isso o import é dinâmico e só acontece onde notificação é suportada. No
 * Expo Go do Android o timer continua funcionando: o aviso vem por vibração e
 * haptic dentro do app, só não toca com o app fechado. Isso volta ao normal no
 * development build.
 */
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const notificationsSupported =
  Platform.OS !== 'web' && !(Platform.OS === 'android' && isExpoGo);

type NotificationsModule = typeof import('expo-notifications');

let modulePromise: Promise<NotificationsModule | null> | null = null;
let handlerSet = false;
let channelReady = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (!notificationsSupported) return null;

  modulePromise ??= import('expo-notifications')
    .then((mod) => mod)
    .catch(() => null);

  const Notifications = await modulePromise;
  if (!Notifications) return null;

  if (!handlerSet) {
    handlerSet = true;
    // Aparece mesmo com o app aberto — o usuário pode estar na tela do player.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  if (Platform.OS === 'android' && !channelReady) {
    channelReady = true;
    // No Android o som e a vibração são definidos no canal, não na notificação.
    await Notifications.setNotificationChannelAsync(REST_CHANNEL, {
      name: 'Timer de descanso',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }

  return Notifications;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) return false;

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
  if (seconds <= 0) return null;

  const Notifications = await getNotifications();
  if (!Notifications) return null;

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
  if (!id) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(id);
}
