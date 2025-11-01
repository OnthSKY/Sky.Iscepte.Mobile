import i18n from '../../i18n';

/**
 * Validator Utilities
 * 
 * Single Responsibility: Provides reusable validation functions
 * Open/Closed: Easy to extend with new validators without modifying existing code
 */

/**
 * Required field validator
 */
export const required = (value: unknown): string | undefined =>
  value === null || value === undefined || value === '' ? i18n.t('common:errors.required') : undefined;

/**
 * Minimum length validator
 */
export const minLength = (min: number) => (value: string): string | undefined =>
  value && value.length < min ? i18n.t('common:errors.min_length', { min }) : undefined;

/**
 * Maximum length validator
 */
export const maxLength = (max: number) => (value: string): string | undefined =>
  value && value.length > max ? i18n.t('common:errors.max_length', { max, defaultValue: `Must be at most ${max} characters` }) : undefined;

/**
 * Email format validator
 */
export const isEmail = (value: string): string | undefined =>
  /.+@.+\..+/.test(value) ? undefined : i18n.t('common:errors.email');

/**
 * Number validator
 */
export const isNumber = (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const num = typeof value === 'number' ? value : Number(value);
  return isNaN(num) ? i18n.t('common:errors.not_a_number', { defaultValue: 'Must be a number' }) : undefined;
};

/**
 * Positive number validator
 */
export const isPositive = (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const num = typeof value === 'number' ? value : Number(value);
  if (isNaN(num)) return i18n.t('common:errors.not_a_number', { defaultValue: 'Must be a number' });
  return num <= 0 ? i18n.t('common:errors.must_be_positive', { defaultValue: 'Must be greater than 0' }) : undefined;
};

/**
 * Range validator (min <= value <= max)
 */
export const range = (min: number, max: number) => (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const num = typeof value === 'number' ? value : Number(value);
  if (isNaN(num)) return i18n.t('common:errors.not_a_number', { defaultValue: 'Must be a number' });
  if (num < min || num > max) {
    return i18n.t('common:errors.range', { min, max, defaultValue: `Must be between ${min} and ${max}` });
  }
  return undefined;
};

/**
 * Phone number validator (simple format check)
 */
export const isPhone = (value: string): string | undefined => {
  if (!value) return undefined;
  // Basic phone validation: digits, spaces, dashes, parentheses, plus sign
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(value.replace(/\s/g, '')) 
    ? undefined 
    : i18n.t('common:errors.invalid_phone', { defaultValue: 'Invalid phone number' });
};

/**
 * URL validator
 */
export const isUrl = (value: string): string | undefined => {
  if (!value) return undefined;
  try {
    new URL(value);
    return undefined;
  } catch {
    return i18n.t('common:errors.invalid_url', { defaultValue: 'Invalid URL' });
  }
};

/**
 * Combine multiple validators
 * Returns first error found, or undefined if all pass
 */
export const combine = (...validators: Array<(value: any) => string | undefined>) => {
  return (value: any): string | undefined => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };
};


