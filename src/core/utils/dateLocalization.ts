/**
 * Date/Time Localization Utilities
 *
 * Single Responsibility: Provides date/time formatting based on locale
 * Open/Closed: Easy to extend with new locales
 *
 * Features:
 * - Locale-aware date formatting
 * - Locale-aware time formatting
 * - Locale-aware date-time formatting
 * - Relative time formatting (e.g., "2 hours ago")
 */

import i18n from '../../i18n';

/**
 * Date format options
 */
export interface DateFormatOptions {
  /**
   * Format style
   * - 'short': 12/31/2023
   * - 'medium': Dec 31, 2023
   * - 'long': December 31, 2023
   * - 'full': Monday, December 31, 2023
   */
  dateStyle?: 'short' | 'medium' | 'long' | 'full';

  /**
   * Time format style
   * - 'short': 3:45 PM
   * - 'medium': 3:45:30 PM
   * - 'long': 3:45:30 PM GMT+3
   * - 'full': 3:45:30 PM Eastern European Time
   */
  timeStyle?: 'short' | 'medium' | 'long' | 'full';

  /**
   * Custom format pattern (e.g., 'dd/MM/yyyy')
   */
  pattern?: string;

  /**
   * Show time
   */
  includeTime?: boolean;

  /**
   * Show seconds
   */
  includeSeconds?: boolean;

  /**
   * Use 24-hour format
   */
  hour24?: boolean;
}

/**
 * Get locale from current i18n language
 */
function getLocale(): string {
  const language = i18n.language || 'tr';

  // Map language codes to locales
  const localeMap: Record<string, string> = {
    tr: 'tr-TR',
    en: 'en-US',
    ar: 'ar-SA', // Arabic
    he: 'he-IL', // Hebrew
    fa: 'fa-IR', // Persian
  };

  return localeMap[language] || language;
}

/**
 * Format date according to locale
 *
 * @param date - Date to format
 * @param options - Format options
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate(new Date(), { dateStyle: 'medium' });
 * // "Dec 31, 2023" (en) or "31 Ara 2023" (tr)
 * ```
 */
export function formatDate(date: Date | string | number, options: DateFormatOptions = {}): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const locale = getLocale();

  const {
    dateStyle = 'medium',
    timeStyle,
    includeTime = false,
    includeSeconds: _includeSeconds = false,
    hour24 = false,
  } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {
    dateStyle,
    ...(includeTime && {
      timeStyle: timeStyle || (_includeSeconds ? 'medium' : 'short'),
      hour12: !hour24,
    }),
  };

  try {
    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  } catch (error) {
    // Fallback to default format
    console.warn('Date formatting error:', error);
    return dateObj.toLocaleDateString(locale);
  }
}

/**
 * Format time according to locale
 *
 * @param date - Date to format
 * @param options - Format options
 * @returns Formatted time string
 *
 * @example
 * ```ts
 * formatTime(new Date(), { hour24: true });
 * // "15:30" (en) or "15:30" (tr)
 * ```
 */
export function formatTime(date: Date | string | number, options: DateFormatOptions = {}): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const locale = getLocale();

  const { timeStyle = 'short', includeSeconds: _includeSeconds = false, hour24 = false } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeStyle,
    hour12: !hour24,
  };

  try {
    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  } catch (error) {
    console.warn('Time formatting error:', error);
    return dateObj.toLocaleTimeString(locale);
  }
}

/**
 * Format date and time according to locale
 *
 * @param date - Date to format
 * @param options - Format options
 * @returns Formatted date-time string
 *
 * @example
 * ```ts
 * formatDateTime(new Date());
 * // "Dec 31, 2023, 3:45 PM" (en) or "31 Ara 2023, 15:45" (tr)
 * ```
 */
export function formatDateTime(
  date: Date | string | number,
  options: DateFormatOptions = {}
): string {
  return formatDate(date, { ...options, includeTime: true });
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 *
 * @param date - Date to format
 * @returns Formatted relative time string
 *
 * @example
 * ```ts
 * formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000));
 * // "2 hours ago" (en) or "2 saat önce" (tr)
 * ```
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const locale = getLocale();
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (Math.abs(diffDays) >= 1) {
      return rtf.format(diffDays, 'day');
    } else if (Math.abs(diffHours) >= 1) {
      return rtf.format(diffHours, 'hour');
    } else if (Math.abs(diffMinutes) >= 1) {
      return rtf.format(diffMinutes, 'minute');
    } else {
      return rtf.format(diffSeconds, 'second');
    }
  } catch (error) {
    // Fallback to manual formatting
    console.warn('Relative time formatting error:', error);

    const isPast = diffMs < 0;
    const absDiff = Math.abs(diffMs);

    if (absDiff >= 24 * 60 * 60 * 1000) {
      const days = Math.floor(absDiff / (24 * 60 * 60 * 1000));
      return i18n.t('common:time.days_ago', {
        count: days,
        defaultValue: `${days} days ${isPast ? 'ago' : 'from now'}`,
      });
    } else if (absDiff >= 60 * 60 * 1000) {
      const hours = Math.floor(absDiff / (60 * 60 * 1000));
      return i18n.t('common:time.hours_ago', {
        count: hours,
        defaultValue: `${hours} hours ${isPast ? 'ago' : 'from now'}`,
      });
    } else if (absDiff >= 60 * 1000) {
      const minutes = Math.floor(absDiff / (60 * 1000));
      return i18n.t('common:time.minutes_ago', {
        count: minutes,
        defaultValue: `${minutes} minutes ${isPast ? 'ago' : 'from now'}`,
      });
    } else {
      return i18n.t('common:time.just_now', { defaultValue: 'just now' });
    }
  }
}

/**
 * Format date range
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @param options - Format options
 * @returns Formatted date range string
 *
 * @example
 * ```ts
 * formatDateRange(new Date('2023-01-01'), new Date('2023-01-31'));
 * // "Jan 1 - 31, 2023" (en) or "1 - 31 Oca 2023" (tr)
 * ```
 */
export function formatDateRange(
  startDate: Date | string | number,
  endDate: Date | string | number,
  options: DateFormatOptions = {}
): string {
  const start =
    typeof startDate === 'string' || typeof startDate === 'number'
      ? new Date(startDate)
      : startDate;
  const end =
    typeof endDate === 'string' || typeof endDate === 'number' ? new Date(endDate) : endDate;
  const locale = getLocale();

  const { dateStyle = 'medium' } = options;

  try {
    const startFormatted = new Intl.DateTimeFormat(locale, {
      dateStyle,
      day: 'numeric',
      month: 'short',
    }).format(start);
    const endFormatted = new Intl.DateTimeFormat(locale, {
      dateStyle,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(end);

    // If same month and year, combine
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      const startDay = start.getDate();
      const endDay = end.getDate();
      const monthYear = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(
        start
      );
      return `${startDay} - ${endDay} ${monthYear}`;
    }

    return `${startFormatted} - ${endFormatted}`;
  } catch (error) {
    console.warn('Date range formatting error:', error);
    return `${start.toLocaleDateString(locale)} - ${end.toLocaleDateString(locale)}`;
  }
}

/**
 * Get date format pattern for current locale
 *
 * @returns Date format pattern (e.g., 'dd/MM/yyyy' for tr, 'MM/dd/yyyy' for en)
 */
export function getDateFormatPattern(): string {
  const locale = getLocale();

  // Common patterns by locale
  const patterns: Record<string, string> = {
    'tr-TR': 'dd.MM.yyyy',
    'en-US': 'MM/dd/yyyy',
    'en-GB': 'dd/MM/yyyy',
    'ar-SA': 'yyyy/MM/dd',
    'he-IL': 'dd/MM/yyyy',
    'fa-IR': 'yyyy/MM/dd',
  };

  return patterns[locale] || 'yyyy-MM-dd';
}

/**
 * Get time format pattern for current locale
 *
 * @param hour24 - Use 24-hour format
 * @returns Time format pattern
 */
export function getTimeFormatPattern(hour24: boolean = false): string {
  return hour24 ? 'HH:mm' : 'hh:mm a';
}
