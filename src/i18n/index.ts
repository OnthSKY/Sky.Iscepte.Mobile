import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import trCommon from './locales/tr/common.json';

import enLogin from './locales/en/login.json';
import trLogin from './locales/tr/login.json';

import enRegister from './locales/en/register.json';
import trRegister from './locales/tr/register.json';

import enDashboard from './locales/en/dashboard.json';
import trDashboard from './locales/tr/dashboard.json';

import enSales from './locales/en/sales.json';
import trSales from './locales/tr/sales.json';

import enCustomers from './locales/en/customers.json';
import trCustomers from './locales/tr/customers.json';

import enReports from './locales/en/reports.json';
import trReports from './locales/tr/reports.json';

import enExpenses from './locales/en/expenses.json';
import trExpenses from './locales/tr/expenses.json';

import enSettings from './locales/en/settings.json';
import trSettings from './locales/tr/settings.json';
import enProducts from './locales/en/products.json';
import trProducts from './locales/tr/products.json';
import enDynamic from './locales/en/dynamic-fields.json';
import trDynamic from './locales/tr/dynamic-fields.json';

const resources = {
  en: {
    common: enCommon,
    login: enLogin,
    register: enRegister,
    dashboard: enDashboard,
    sales: enSales,
    customers: enCustomers,
    reports: enReports,
    expenses: enExpenses,
    settings: enSettings,
    products: enProducts,
    'dynamic-fields': enDynamic,
  },
  tr: {
    common: trCommon,
    login: trLogin,
    register: trRegister,
    dashboard: trDashboard,
    sales: trSales,
    customers: trCustomers,
    reports: trReports,
    expenses: trExpenses,
    settings: trSettings,
    products: trProducts,
    'dynamic-fields': trDynamic,
  },
};

if (!i18n.isInitialized) {
  // Use default language 'tr' - saved language will be restored by useAppStore.hydrate()
  // This avoids _nativeModule undefined errors from expo-localization
  // User can change language via LanguagePicker, which is stored in AsyncStorage
  
  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4',
      resources,
      ns: ['common', 'login', 'register', 'dashboard', 'sales', 'customers', 'reports', 'expenses', 'settings', 'products', 'dynamic-fields'],
      defaultNS: 'common',
      lng: 'tr', // Default language, will be updated by useAppStore.hydrate() if a saved preference exists
      fallbackLng: 'tr',
      interpolation: { escapeValue: false },
    });
}

export default i18n;


