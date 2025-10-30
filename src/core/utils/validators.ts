import i18n from '../../i18n';

export const required = (value: unknown): string | undefined =>
  value === null || value === undefined || value === '' ? i18n.t('common:errors.required') : undefined;

export const minLength = (min: number) => (value: string): string | undefined =>
  value && value.length < min ? i18n.t('common:errors.min_length', { min }) : undefined;

export const isEmail = (value: string): string | undefined =>
  /.+@.+\..+/.test(value) ? undefined : i18n.t('common:errors.email');


