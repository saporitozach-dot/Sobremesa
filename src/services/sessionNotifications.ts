import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { formatMinutes } from '../utils/format';

export const SESSION_NOTIFICATION_ID = 'sobremesa-active-session';

export async function ensureSessionNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('session', {
      name: 'Active session',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

export async function showSessionNotification(
  restaurantName: string,
  goalMinutes: number,
): Promise<void> {
  await ensureSessionNotificationChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: SESSION_NOTIFICATION_ID,
    content: {
      title: 'Sobremesa session',
      body: `${restaurantName} · 0:00 of ${formatMinutes(goalMinutes * 60)}`,
      sticky: Platform.OS === 'android',
      priority: Notifications.AndroidNotificationPriority.HIGH,
      ...(Platform.OS === 'android' ? { channelId: 'session' } : {}),
      data: { type: 'active-session' },
    },
    trigger: null,
  });
}

export async function updateSessionNotification(
  restaurantName: string,
  elapsedSeconds: number,
  goalSeconds: number,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: SESSION_NOTIFICATION_ID,
    content: {
      title: 'Sobremesa session',
      body: `${restaurantName} · ${formatMinutes(elapsedSeconds)} of ${formatMinutes(goalSeconds)}`,
      sticky: Platform.OS === 'android',
      priority: Notifications.AndroidNotificationPriority.HIGH,
      ...(Platform.OS === 'android' ? { channelId: 'session' } : {}),
      data: { type: 'active-session' },
    },
    trigger: null,
  });
}

export async function dismissSessionNotification(): Promise<void> {
  await Notifications.dismissNotificationAsync(SESSION_NOTIFICATION_ID).catch(() => undefined);
  await Notifications.cancelScheduledNotificationAsync(SESSION_NOTIFICATION_ID).catch(() => undefined);
}
