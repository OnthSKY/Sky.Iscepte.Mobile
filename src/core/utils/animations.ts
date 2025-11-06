/**
 * Animation Utilities
 *
 * Single Responsibility: Provides animation helpers and utilities
 *
 * Features:
 * - Fade animations
 * - Slide animations
 * - Scale animations
 * - Spring animations
 */

import { Animated, Easing, LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: (value: number) => number;
  useNativeDriver?: boolean;
}

/**
 * Default animation config
 */
const defaultConfig: Required<AnimationConfig> = {
  duration: 300,
  delay: 0,
  easing: Easing.out(Easing.ease),
  useNativeDriver: true,
};

/**
 * Create fade in animation
 *
 * @param value - Animated value
 * @param config - Animation config
 * @returns Animation
 */
export function fadeIn(
  value: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation {
  const finalConfig = { ...defaultConfig, ...config };

  return Animated.timing(value, {
    toValue: 1,
    duration: finalConfig.duration,
    delay: finalConfig.delay,
    easing: finalConfig.easing,
    useNativeDriver: finalConfig.useNativeDriver,
  });
}

/**
 * Create fade out animation
 *
 * @param value - Animated value
 * @param config - Animation config
 * @returns Animation
 */
export function fadeOut(
  value: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation {
  const finalConfig = { ...defaultConfig, ...config };

  return Animated.timing(value, {
    toValue: 0,
    duration: finalConfig.duration,
    delay: finalConfig.delay,
    easing: finalConfig.easing,
    useNativeDriver: finalConfig.useNativeDriver,
  });
}

/**
 * Create slide in animation (from bottom)
 *
 * @param value - Animated value
 * @param distance - Slide distance (default: 50)
 * @param config - Animation config
 * @returns Animation
 */
export function slideInUp(
  value: Animated.Value,
  _distance: number = 50,
  config: AnimationConfig = {}
): Animated.CompositeAnimation {
  const finalConfig = { ...defaultConfig, ...config };

  return Animated.timing(value, {
    toValue: 0,
    duration: finalConfig.duration,
    delay: finalConfig.delay,
    easing: finalConfig.easing,
    useNativeDriver: finalConfig.useNativeDriver,
  });
}

/**
 * Create slide out animation (to bottom)
 *
 * @param value - Animated value
 * @param distance - Slide distance (default: 50)
 * @param config - Animation config
 * @returns Animation
 */
export function slideOutDown(
  value: Animated.Value,
  distance: number = 50,
  config: AnimationConfig = {}
): Animated.CompositeAnimation {
  const finalConfig = { ...defaultConfig, ...config };

  return Animated.timing(value, {
    toValue: distance,
    duration: finalConfig.duration,
    delay: finalConfig.delay,
    easing: finalConfig.easing,
    useNativeDriver: finalConfig.useNativeDriver,
  });
}

/**
 * Create scale animation
 *
 * @param value - Animated value
 * @param from - From scale (default: 0)
 * @param to - To scale (default: 1)
 * @param config - Animation config
 * @returns Animation
 */
export function scale(
  value: Animated.Value,
  from: number = 0,
  to: number = 1,
  config: AnimationConfig = {}
): Animated.CompositeAnimation {
  const finalConfig = { ...defaultConfig, ...config };

  value.setValue(from);

  return Animated.timing(value, {
    toValue: to,
    duration: finalConfig.duration,
    delay: finalConfig.delay,
    easing: finalConfig.easing,
    useNativeDriver: finalConfig.useNativeDriver,
  });
}

/**
 * Create spring animation
 *
 * @param value - Animated value
 * @param toValue - Target value
 * @param config - Spring config
 * @returns Animation
 */
export function spring(
  value: Animated.Value,
  toValue: number,
  config: {
    tension?: number;
    friction?: number;
    useNativeDriver?: boolean;
  } = {}
): Animated.CompositeAnimation {
  return Animated.spring(value, {
    toValue,
    useNativeDriver: config.useNativeDriver ?? true,
    tension: config.tension ?? 50,
    friction: config.friction ?? 7,
  });
}

/**
 * Create bounce animation
 *
 * @param value - Animated value
 * @param config - Animation config
 * @returns Animation
 */
export function bounce(
  value: Animated.Value,
  config: AnimationConfig = {}
): Animated.CompositeAnimation {
  const finalConfig = { ...defaultConfig, ...config };

  return Animated.sequence([
    Animated.timing(value, {
      toValue: 1.2,
      duration: finalConfig.duration / 2,
      easing: Easing.out(Easing.ease),
      useNativeDriver: finalConfig.useNativeDriver,
    }),
    Animated.timing(value, {
      toValue: 1,
      duration: finalConfig.duration / 2,
      easing: Easing.in(Easing.ease),
      useNativeDriver: finalConfig.useNativeDriver,
    }),
  ]);
}

/**
 * Create shake animation
 *
 * @param value - Animated value
 * @param distance - Shake distance (default: 10)
 * @param config - Animation config
 * @returns Animation
 */
export function shake(
  value: Animated.Value,
  distance: number = 10,
  config: AnimationConfig = {}
): Animated.CompositeAnimation {
  const finalConfig = { ...defaultConfig, ...config };

  return Animated.sequence([
    Animated.timing(value, {
      toValue: distance,
      duration: finalConfig.duration / 4,
      useNativeDriver: finalConfig.useNativeDriver,
    }),
    Animated.timing(value, {
      toValue: -distance,
      duration: finalConfig.duration / 4,
      useNativeDriver: finalConfig.useNativeDriver,
    }),
    Animated.timing(value, {
      toValue: distance,
      duration: finalConfig.duration / 4,
      useNativeDriver: finalConfig.useNativeDriver,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: finalConfig.duration / 4,
      useNativeDriver: finalConfig.useNativeDriver,
    }),
  ]);
}

/**
 * Layout animation preset
 */
export const LayoutAnimationPresets = {
  easeInEaseOut: LayoutAnimation.Presets.easeInEaseOut,
  linear: LayoutAnimation.Presets.linear,
  spring: LayoutAnimation.Presets.spring,
};

/**
 * Trigger layout animation
 *
 * @param preset - Layout animation preset
 */
export function triggerLayoutAnimation(
  preset: keyof typeof LayoutAnimationPresets = 'easeInEaseOut'
): void {
  LayoutAnimation.configureNext(LayoutAnimationPresets[preset]);
}
