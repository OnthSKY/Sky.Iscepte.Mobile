/**
 * RTL (Right-to-Left) Support Utilities
 *
 * Single Responsibility: Provides RTL support for i18n
 * Open/Closed: Easy to extend with new RTL languages
 *
 * Features:
 * - RTL language detection
 * - RTL layout direction
 * - RTL-aware styling
 */

import { I18nManager } from 'react-native';
import i18n from '../../i18n';

/**
 * RTL languages
 */
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', 'yi'] as const;

export type RTLLanguage = (typeof RTL_LANGUAGES)[number];

/**
 * Check if a language is RTL
 *
 * @param language - Language code
 * @returns true if language is RTL
 *
 * @example
 * ```ts
 * isRTL('ar'); // true
 * isRTL('en'); // false
 * ```
 */
export function isRTL(language?: string): boolean {
  const lang = language || i18n.language || 'en';
  return RTL_LANGUAGES.some((rtlLang) => lang.startsWith(rtlLang));
}

/**
 * Get layout direction for current language
 *
 * @param language - Language code (default: current language)
 * @returns 'rtl' or 'ltr'
 *
 * @example
 * ```ts
 * getLayoutDirection('ar'); // 'rtl'
 * getLayoutDirection('en'); // 'ltr'
 * ```
 */
export function getLayoutDirection(language?: string): 'rtl' | 'ltr' {
  return isRTL(language) ? 'rtl' : 'ltr';
}

/**
 * Enable/disable RTL layout
 *
 * @param enabled - Enable RTL
 * @param forceRTL - Force RTL even if language is not RTL (for testing)
 */
export function setRTL(enabled: boolean, forceRTL: boolean = false): void {
  if (forceRTL || enabled) {
    I18nManager.forceRTL(enabled);
    I18nManager.allowRTL(enabled);
    // Reload app to apply RTL changes (in production, app restart is needed)
    if (__DEV__) {
      // In development, we can try to reload
      // Note: This might not work in all cases
    }
  }
}

/**
 * Initialize RTL support based on current language
 *
 * @param language - Language code (default: current language)
 */
export function initializeRTL(language?: string): void {
  const lang = language || i18n.language || 'en';
  const rtl = isRTL(lang);

  setRTL(rtl);
}

/**
 * Get RTL-aware style
 * Flips horizontal properties for RTL languages
 *
 * @param style - Style object
 * @param language - Language code (default: current language)
 * @returns RTL-aware style object
 *
 * @example
 * ```ts
 * const style = getRTLStyle({ marginLeft: 10, marginRight: 20 }, 'ar');
 * // { marginRight: 10, marginLeft: 20 } for RTL
 * ```
 */
export function getRTLStyle<T extends Record<string, unknown>>(style: T, language?: string): T {
  if (!isRTL(language)) {
    return style;
  }

  const rtlStyle = { ...style };

  // Flip horizontal properties
  const horizontalProps = [
    'marginLeft',
    'marginRight',
    'paddingLeft',
    'paddingRight',
    'left',
    'right',
    'borderLeftWidth',
    'borderRightWidth',
    'borderLeftColor',
    'borderRightColor',
  ];

  const flipped: Record<string, unknown> = {};

  for (const prop of horizontalProps) {
    if (prop in rtlStyle) {
      const oppositeProp = prop.replace(/Left|Right/, (match) =>
        match === 'Left' ? 'Right' : 'Left'
      );
      flipped[oppositeProp] = rtlStyle[prop];
      delete rtlStyle[prop];
    }
  }

  return { ...rtlStyle, ...flipped } as T;
}

/**
 * Get RTL-aware text align
 *
 * @param align - Text align ('left' | 'right' | 'center' | 'justify')
 * @param language - Language code (default: current language)
 * @returns RTL-aware text align
 *
 * @example
 * ```ts
 * getRTLTextAlign('left', 'ar'); // 'right'
 * getRTLTextAlign('left', 'en'); // 'left'
 * ```
 */
export function getRTLTextAlign(
  align: 'left' | 'right' | 'center' | 'justify',
  language?: string
): 'left' | 'right' | 'center' | 'justify' {
  if (!isRTL(language) || align === 'center' || align === 'justify') {
    return align;
  }

  return align === 'left' ? 'right' : 'left';
}

/**
 * Get RTL-aware flex direction
 *
 * @param direction - Flex direction ('row' | 'row-reverse' | 'column' | 'column-reverse')
 * @param language - Language code (default: current language)
 * @returns RTL-aware flex direction
 *
 * @example
 * ```ts
 * getRTLFlexDirection('row', 'ar'); // 'row-reverse'
 * getRTLFlexDirection('row', 'en'); // 'row'
 * ```
 */
export function getRTLFlexDirection(
  direction: 'row' | 'row-reverse' | 'column' | 'column-reverse',
  language?: string
): 'row' | 'row-reverse' | 'column' | 'column-reverse' {
  if (!isRTL(language) || direction === 'column' || direction === 'column-reverse') {
    return direction;
  }

  return direction === 'row' ? 'row-reverse' : 'row';
}
