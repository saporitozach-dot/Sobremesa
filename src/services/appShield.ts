import {
  Alert,
  AppState,
  AppStateStatus,
  BackHandler,
  Linking,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';

export type ShieldCapabilities = {
  /** True only with iOS Family Controls / Android Device Admin in a native build. */
  canBlockOtherApps: boolean;
  canDetectBackground: boolean;
  canNotifyOnLeave: boolean;
};

export function getShieldCapabilities(): ShieldCapabilities {
  return {
    canBlockOtherApps: false,
    canDetectBackground: true,
    canNotifyOnLeave: true,
  };
}

type ShieldCallbacks = {
  onLeaveApp?: () => void;
  onReturnToApp?: () => void;
};

/**
 * Best-effort session shield available in Expo Go.
 * Detects backgrounding, nudges the user back, and blocks Android back navigation.
 * Full app blocking requires a development build + OS APIs (see README).
 */
export function activateSessionShield(callbacks: ShieldCallbacks = {}): () => void {
  let leftDuringSession = false;

  const onAppStateChange = (next: AppStateStatus) => {
    if (next === 'background' || next === 'inactive') {
      leftDuringSession = true;
      callbacks.onLeaveApp?.();
      void Notifications.scheduleNotificationAsync({
        content: {
          title: 'Sobremesa session active',
          body: 'Set your phone down — your phone-free session is still running.',
        },
        trigger: null,
      }).catch(() => {});
      return;
    }

    if (next === 'active' && leftDuringSession) {
      leftDuringSession = false;
      callbacks.onReturnToApp?.();
      Alert.alert(
        'Session still running',
        'You left Sobremesa during your phone-free session. Set the phone face-down and stay present at the table.',
      );
    }
  };

  const appStateSub = AppState.addEventListener('change', onAppStateChange);

  const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
    Alert.alert(
      'Session in progress',
      'Keep Sobremesa open or set your phone face-down until your goal is done.',
    );
    return true;
  });

  return () => {
    appStateSub.remove();
    backSub.remove();
  };
}

export function openSystemDistractionSettings(): void {
  Linking.openSettings().catch(() => {
    Alert.alert(
      'Focus / Do Not Disturb',
      Platform.OS === 'ios'
        ? 'Open Settings → Focus and turn on Do Not Disturb or a Dining focus while your session runs.'
        : 'Open Settings and enable Do Not Disturb or app timers for stronger protection.',
    );
  });
}

export function showAppBlockingInfo(): void {
  Alert.alert(
    'About phone locking',
    Platform.OS === 'ios'
      ? 'Sobremesa cannot block Instagram, Messages, or other apps from inside Expo Go. A standalone build can integrate Apple Screen Time (Family Controls) after Apple approves the entitlement. For now, use Focus / Do Not Disturb and keep Sobremesa on the lock screen.'
      : 'Sobremesa cannot block other apps from inside Expo Go. A standalone Android build can use Device Admin or Digital Wellbeing APIs. For now, use Do Not Disturb and keep Sobremesa on the lock screen.',
  );
}
