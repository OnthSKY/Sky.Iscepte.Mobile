/**
 * Application Constants
 * Centralized constants for roles, languages, themes, etc.
 */

/**
 * User Roles
 */
export const Role = {
  ADMIN: 'admin',
  OWNER: 'owner',
  STAFF: 'staff',
  GUEST: 'guest',
} as const;

export type Role = typeof Role[keyof typeof Role];

/**
 * Supported Languages
 */
export const Language = {
  TR: 'tr',
  EN: 'en',
} as const;

export type Language = typeof Language[keyof typeof Language];

/**
 * Theme Preferences
 */
export const ThemePreference = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ThemePreference = typeof ThemePreference[keyof typeof ThemePreference];

/**
 * Helper functions to check values
 */
export const isValidRole = (value: string): value is Role => {
  return Object.values(Role).includes(value as Role);
};

export const isValidLanguage = (value: string): value is Language => {
  return Object.values(Language).includes(value as Language);
};

export const isValidThemePreference = (value: string): value is ThemePreference => {
  return Object.values(ThemePreference).includes(value as ThemePreference);
};

