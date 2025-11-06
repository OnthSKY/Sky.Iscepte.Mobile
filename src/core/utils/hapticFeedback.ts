/**
 * Haptic Feedback Utilities
 *
 * Single Responsibility: Provides haptic feedback for user interactions
 *
 * Features:
 * - Impact feedback (light, medium, heavy)
 * - Notification feedback (success, warning, error)
 * - Selection feedback
 */

import { Platform } from 'react-native';

// Dynamic import for expo-haptics (optional dependency)
let Haptics: typeof import('expo-haptics') | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Haptics = require('expo-haptics');
} catch {
  // expo-haptics not installed
}

/**
 * Haptic feedback types
 */
export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

/**
 * Trigger haptic feedback
 *
 * @param type - Haptic feedback type
 *
 * @example
 * ```ts
 * triggerHaptic('light'); // Light impact
 * triggerHaptic('success'); // Success notification
 * ```
 */
export function triggerHaptic(type: HapticType = 'medium'): void {
  if (!Haptics || Platform.OS !== 'ios') {
    // Haptic feedback is primarily supported on iOS
    // Android has limited support
    // expo-haptics may not be installed
    return;
  }

  try {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
        Haptics.selectionAsync();
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch (error) {
    // Silently fail if haptics are not available
    console.warn('Haptic feedback not available:', error);
  }
}

/**
 * Trigger haptic feedback for button press
 */
export function triggerButtonHaptic(): void {
  triggerHaptic('light');
}

/**
 * Trigger haptic feedback for success action
 */
export function triggerSuccessHaptic(): void {
  triggerHaptic('success');
}

/**
 * Trigger haptic feedback for error
 */
export function triggerErrorHaptic(): void {
  triggerHaptic('error');
}

/**
 * Trigger haptic feedback for selection
 */
export function triggerSelectionHaptic(): void {
  triggerHaptic('selection');
}
