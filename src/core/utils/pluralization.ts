/**
 * Pluralization Utilities
 *
 * Single Responsibility: Provides pluralization helpers for i18n
 * Open/Closed: Easy to extend with new pluralization rules
 *
 * Features:
 * - Pluralization helpers
 * - Language-specific plural rules
 * - Count-based pluralization
 */

import i18n from '../../i18n';

/**
 * Pluralization options
 */
export interface PluralizationOptions {
  /**
   * Count for pluralization
   */
  count?: number;

  /**
   * Custom plural key suffix (e.g., 'one', 'few', 'many', 'other')
   */
  pluralKey?: string;

  /**
   * Default value if translation not found
   */
  defaultValue?: string;
}

/**
 * Get plural form key based on language and count
 *
 * @param count - Count value
 * @param language - Language code (default: current language)
 * @returns Plural form key ('zero', 'one', 'two', 'few', 'many', 'other')
 *
 * @example
 * ```ts
 * getPluralForm(1, 'en'); // 'one'
 * getPluralForm(5, 'en'); // 'other'
 * getPluralForm(2, 'ru'); // 'few'
 * ```
 */
export function getPluralForm(count: number, language?: string): string {
  const lang = language || i18n.language || 'en';

  // i18next uses Intl.PluralRules internally
  try {
    const pluralRules = new Intl.PluralRules(lang);
    return pluralRules.select(count);
  } catch (error) {
    // Fallback to simple rules
    console.warn('Plural rules error:', error);

    // Simple English/Turkish rules
    if (lang.startsWith('tr')) {
      return count === 1 ? 'one' : 'other';
    }

    // English rules
    if (count === 0) {
      return 'zero';
    }
    if (count === 1) {
      return 'one';
    }
    return 'other';
  }
}

/**
 * Get pluralized translation key
 *
 * @param baseKey - Base translation key (without plural suffix)
 * @param count - Count value
 * @param language - Language code (default: current language)
 * @returns Full translation key with plural suffix
 *
 * @example
 * ```ts
 * getPluralKey('items', 1); // 'items_one'
 * getPluralKey('items', 5); // 'items_other'
 * ```
 */
export function getPluralKey(baseKey: string, count: number, language?: string): string {
  const pluralForm = getPluralForm(count, language);
  return `${baseKey}_${pluralForm}`;
}

/**
 * Translate with pluralization
 *
 * @param key - Translation key (base key, plural suffix will be added)
 * @param count - Count value
 * @param options - Additional translation options
 * @returns Translated string
 *
 * @example
 * ```ts
 * pluralize('items', 1); // "1 item" (en) or "1 öğe" (tr)
 * pluralize('items', 5); // "5 items" (en) or "5 öğe" (tr)
 * ```
 */
export function pluralize(
  key: string,
  count: number,
  options?: Omit<PluralizationOptions, 'count'>
): string {
  const pluralForm = getPluralForm(count);
  const pluralKey = `${key}_${pluralForm}`;

  return i18n.t(pluralKey, {
    count,
    defaultValue: options?.defaultValue || key,
    ...options,
  });
}

/**
 * Format count with pluralized text
 *
 * @param key - Translation key
 * @param count - Count value
 * @param options - Translation options
 * @returns Formatted string with count and pluralized text
 *
 * @example
 * ```ts
 * formatCount('items', 1); // "1 item" (en) or "1 öğe" (tr)
 * formatCount('items', 5); // "5 items" (en) or "5 öğe" (tr)
 * ```
 */
export function formatCount(
  key: string,
  count: number,
  options?: Omit<PluralizationOptions, 'count'>
): string {
  return pluralize(key, count, options);
}

/**
 * Check if a language has complex plural rules
 * (more than just 'one' and 'other')
 *
 * @param language - Language code
 * @returns true if language has complex plural rules
 */
export function hasComplexPluralRules(language: string): boolean {
  const languagesWithComplexPlurals = [
    'ru', // Russian
    'pl', // Polish
    'cs', // Czech
    'sk', // Slovak
    'uk', // Ukrainian
    'sr', // Serbian
    'hr', // Croatian
    'ar', // Arabic
  ];

  return languagesWithComplexPlurals.some((lang) => language.startsWith(lang));
}

/**
 * Get all plural forms for a language
 *
 * @param language - Language code
 * @returns Array of plural form keys
 */
export function getPluralForms(language?: string): string[] {
  const lang = language || i18n.language || 'en';

  try {
    const pluralRules = new Intl.PluralRules(lang);
    // Test with different numbers to find all forms
    const forms = new Set<string>();
    for (let i = 0; i <= 100; i++) {
      forms.add(pluralRules.select(i));
    }
    return Array.from(forms);
  } catch (error) {
    // Fallback
    return ['one', 'other'];
  }
}
