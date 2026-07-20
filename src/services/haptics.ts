import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const canHaptic = Platform.OS === 'ios' || Platform.OS === 'android';

/** Soft tap — primary buttons, list rows, header controls. */
export function hapticLight() {
  if (!canHaptic) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

/** Discrete tick — advancing onboarding chapters, segmented controls. */
export function hapticSelection() {
  if (!canHaptic) return;
  void Haptics.selectionAsync().catch(() => undefined);
}

/** Slightly firmer — completing a chapter or confirming an important action. */
export function hapticMedium() {
  if (!canHaptic) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
}

/** Success pulse — session complete, onboarding finished, voucher unlocked. */
export function hapticSuccess() {
  if (!canHaptic) return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}
