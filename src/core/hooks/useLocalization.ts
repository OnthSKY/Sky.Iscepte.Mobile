import { useCallback, useEffect } from 'react';
import i18n from '../../i18n';
import { initializeRTL, isRTL, getLayoutDirection } from '../utils/rtlSupport';
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatDateRange,
} from '../utils/dateLocalization';
import { pluralize, formatCount } from '../utils/pluralization';

/**
 * useLocalization hook return type
 */
export interface UseLocalizationReturn {
  /**
   * Translate function
   */
  t: (key: string, options?: Record<string, unknown>) => string;

  /**
   * Change language
   */
  changeLanguage: (lang: 'tr' | 'en' | string) => Promise<void>;

  /**
   * Current language
   */
  language: string;

  /**
   * Is RTL language
   */
  isRTL: boolean;

  /**
   * Layout direction
   */
  layoutDirection: 'rtl' | 'ltr';

  /**
   * Date formatting functions
   */
  date: {
    format: typeof formatDate;
    formatTime: typeof formatTime;
    formatDateTime: typeof formatDateTime;
    formatRelative: typeof formatRelativeTime;
    formatRange: typeof formatDateRange;
  };

  /**
   * Pluralization functions
   */
  plural: {
    pluralize: typeof pluralize;
    formatCount: typeof formatCount;
  };
}

/**
 * useLocalization hook
 * Provides i18n functionality with RTL, date/time, and pluralization support
 *
 * @returns Localization utilities
 *
 * @example
 * ```tsx
 * const { t, changeLanguage, isRTL, date, plural } = useLocalization();
 *
 * // Translation
 * const text = t('common:hello');
 *
 * // Date formatting
 * const formatted = date.format(new Date(), { dateStyle: 'medium' });
 *
 * // Pluralization
 * const countText = plural.formatCount('items', 5);
 * ```
 */
export const useLocalization = (): UseLocalizationReturn => {
  const language = i18n.language || 'tr';
  const rtl = isRTL(language);
  const layoutDir = getLayoutDirection(language);

  // Initialize RTL on mount and language change
  useEffect(() => {
    initializeRTL(language);
  }, [language]);

  const t = useCallback((key: string, options?: Record<string, unknown>) => {
    return i18n.t(key, options);
  }, []);

  const changeLanguage = useCallback(async (lang: string) => {
    await i18n.changeLanguage(lang);
    initializeRTL(lang);
  }, []);

  return {
    t,
    changeLanguage,
    language,
    isRTL: rtl,
    layoutDirection: layoutDir,
    date: {
      format: formatDate,
      formatTime,
      formatDateTime,
      formatRelative: formatRelativeTime,
      formatRange: formatDateRange,
    },
    plural: {
      pluralize,
      formatCount,
    },
  };
};

export default useLocalization;
