/**
 * Accessibility Utilities
 *
 * Single Responsibility: Provides accessibility helpers and utilities
 * Open/Closed: Easy to extend with new accessibility features
 *
 * Features:
 * - Accessibility label helpers
 * - Color contrast checking
 * - Keyboard navigation support
 * - Focus management
 */

import { Platform } from 'react-native';
import i18n from '../../i18n';

/**
 * Accessibility properties
 */
export interface AccessibilityProps {
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessibilityHint?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    expanded?: boolean;
    busy?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
}

/**
 * Create accessibility props for a component
 *
 * @param label - Accessibility label
 * @param hint - Accessibility hint (optional)
 * @param role - Accessibility role (optional)
 * @param state - Accessibility state (optional)
 * @returns Accessibility props object
 *
 * @example
 * ```ts
 * const a11yProps = createAccessibilityProps('Save button', 'Saves the form');
 * <TouchableOpacity {...a11yProps}>Save</TouchableOpacity>
 * ```
 */
export function createAccessibilityProps(
  label: string,
  hint?: string,
  role?: string,
  state?: AccessibilityProps['accessibilityState']
): AccessibilityProps {
  const props: AccessibilityProps = {
    accessibilityLabel: label,
  };

  if (hint) {
    props.accessibilityHint = hint;
  }

  if (role) {
    props.accessibilityRole = role;
  }

  if (state) {
    props.accessibilityState = state;
  }

  return props;
}

/**
 * Get translated accessibility label
 *
 * @param key - Translation key
 * @param params - Translation parameters
 * @returns Translated accessibility label
 *
 * @example
 * ```ts
 * const label = getTranslatedAccessibilityLabel('common:save');
 * ```
 */
export function getTranslatedAccessibilityLabel(
  key: string,
  params?: Record<string, unknown>
): string {
  return i18n.t(key, { defaultValue: key, ...params });
}

/**
 * Create accessibility props with translation
 *
 * @param labelKey - Translation key for label
 * @param hintKey - Translation key for hint (optional)
 * @param role - Accessibility role (optional)
 * @param params - Translation parameters
 * @returns Accessibility props object
 *
 * @example
 * ```ts
 * const a11yProps = createTranslatedAccessibilityProps('common:save', 'common:save_hint');
 * ```
 */
export function createTranslatedAccessibilityProps(
  labelKey: string,
  hintKey?: string,
  role?: string,
  params?: Record<string, unknown>
): AccessibilityProps {
  return createAccessibilityProps(
    getTranslatedAccessibilityLabel(labelKey, params),
    hintKey ? getTranslatedAccessibilityLabel(hintKey, params) : undefined,
    role
  );
}

/**
 * WCAG contrast ratio levels
 */
export const ContrastLevel = {
  AA: 4.5, // Normal text
  AALarge: 3, // Large text (18pt+ or 14pt+ bold)
  AAA: 7, // Enhanced contrast
  AAALarge: 4.5, // Large text enhanced (same as AA for normal text)
} as const;

export type ContrastLevelType = (typeof ContrastLevel)[keyof typeof ContrastLevel];

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 *
 * @param color1 - First color (hex)
 * @param color2 - Second color (hex)
 * @returns Contrast ratio (1-21)
 *
 * @example
 * ```ts
 * const ratio = getContrastRatio('#000000', '#FFFFFF');
 * // 21 (maximum contrast)
 * ```
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    return 1; // Invalid colors, return minimum contrast
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 *
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param level - WCAG level (default: AA)
 * @param isLargeText - Is large text (default: false)
 * @returns true if contrast meets standards
 *
 * @example
 * ```ts
 * const meetsAA = meetsContrastRatio('#000000', '#FFFFFF', ContrastLevel.AA);
 * // true
 * ```
 */
export function meetsContrastRatio(
  foreground: string,
  background: string,
  level: ContrastLevelType = ContrastLevel.AA,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText
    ? level === ContrastLevel.AA
      ? ContrastLevel.AALarge
      : ContrastLevel.AAALarge
    : level;

  return ratio >= requiredRatio;
}

/**
 * Get accessible color suggestions
 * Suggests colors that meet contrast requirements
 *
 * @param foreground - Current foreground color
 * @param background - Background color
 * @param level - WCAG level
 * @param isLargeText - Is large text
 * @returns Suggested foreground color or null if current is acceptable
 */
export function getAccessibleColor(
  foreground: string,
  background: string,
  level: ContrastLevelType = ContrastLevel.AA,
  isLargeText: boolean = false
): string | null {
  if (meetsContrastRatio(foreground, background, level, isLargeText)) {
    return null; // Current color is accessible
  }

  // Try to find a darker or lighter version
  const rgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!rgb || !bgRgb) {
    return null;
  }

  // Calculate target luminance
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const requiredRatio = isLargeText
    ? level === ContrastLevel.AA
      ? ContrastLevel.AALarge
      : ContrastLevel.AAALarge
    : level;

  // Target luminance for foreground
  const targetLum = bgLum > 0.5 ? bgLum / requiredRatio - 0.05 : bgLum * requiredRatio + 0.05;

  // Adjust color towards target
  const factor = targetLum / getLuminance(rgb.r, rgb.g, rgb.b);
  const newR = Math.max(0, Math.min(255, Math.round(rgb.r * factor)));
  const newG = Math.max(0, Math.min(255, Math.round(rgb.g * factor)));
  const newB = Math.max(0, Math.min(255, Math.round(rgb.b * factor)));

  return `#${[newR, newG, newB].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Keyboard navigation support (Web only)
 */
export interface KeyboardNavigationProps {
  onKeyPress?: (event: { key: string }) => void;
  tabIndex?: number;
}

/**
 * Create keyboard navigation props for web
 *
 * @param onPress - Press handler
 * @param tabIndex - Tab index (optional)
 * @returns Keyboard navigation props
 */
export function createKeyboardNavigationProps(
  onPress: () => void,
  tabIndex?: number
): KeyboardNavigationProps {
  if (Platform.OS !== 'web') {
    return {};
  }

  return {
    onKeyPress: (event: { key: string }) => {
      if (event.key === 'Enter' || event.key === ' ') {
        onPress();
      }
    },
    tabIndex: tabIndex ?? 0,
  };
}

/**
 * Common accessibility roles
 */
export const AccessibilityRoles = {
  button: 'button',
  link: 'link',
  text: 'text',
  header: 'header',
  image: 'image',
  imagebutton: 'imagebutton',
  keyboardkey: 'keyboardkey',
  none: 'none',
  summary: 'summary',
  adjust: 'adjust',
  alert: 'alert',
  checkbox: 'checkbox',
  combobox: 'combobox',
  menu: 'menu',
  menubar: 'menubar',
  menuitem: 'menuitem',
  progressbar: 'progressbar',
  radio: 'radio',
  radiogroup: 'radiogroup',
  scrollbar: 'scrollbar',
  searchbox: 'searchbox',
  spinbutton: 'spinbutton',
  switch: 'switch',
  tab: 'tab',
  tabbar: 'tabbar',
  tablist: 'tablist',
  timer: 'timer',
  toolbar: 'toolbar',
} as const;
