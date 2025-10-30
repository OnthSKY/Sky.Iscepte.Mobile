import Constants from 'expo-constants';

export type AppMode = 'api' | 'mock';

export interface AppConfig {
  apiBaseUrl: string;
  defaultLocale: 'tr' | 'en';
  theme: 'light' | 'dark';
  mode: AppMode; // toggles between real API and mock services
}

const extras = (Constants?.expoConfig as any)?.extra || (Constants?.manifest as any)?.extra || {};
const read = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value.length) return value;
  return fallback;
};

export const appConfig: AppConfig = {
  apiBaseUrl: read(extras.API_URL, 'https://api.example.com'),
  defaultLocale: (read(extras.DEFAULT_LOCALE, 'tr') as 'tr' | 'en'),
  theme: (read(extras.DEFAULT_THEME, 'light') as 'light' | 'dark'),
  mode: (read(extras.APP_MODE, 'mock') as AppMode),
};

export default appConfig;


