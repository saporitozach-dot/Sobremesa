import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const canHaptic = Platform.OS === 'ios' || Platform.OS === 'android';

function run(action: () => Promise<void>, label: string) {
  if (!canHaptic) return;
  void action().catch((error) => {
    if (__DEV__) {
      console.warn(`[haptics] ${label} failed`, error);
    }
  });
}

/** Soft tap — primary buttons, list rows, header controls. */
export function hapticLight() {
  // Light is nearly imperceptible on many devices; Soft reads as a quiet click.
  run(
    () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
    'soft',
  );
}

/** Discrete tick — advancing onboarding chapters, segmented controls. */
export function hapticSelection() {
  run(() => Haptics.selectionAsync(), 'selection');
}

/** Slightly firmer — completing a chapter or confirming an important action. */
export function hapticMedium() {
  run(
    () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    'medium',
  );
}

/** Success pulse — session complete, onboarding finished, voucher unlocked. */
export function hapticSuccess() {
  run(
    () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    'success',
  );
}
