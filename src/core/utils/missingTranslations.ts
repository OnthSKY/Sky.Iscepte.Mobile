/**
 * Missing Translations Checker
 *
 * Single Responsibility: Finds missing translations between languages
 * Open/Closed: Easy to extend with new languages
 *
 * Features:
 * - Find missing translation keys
 * - Compare translation files
 * - Generate missing translations report
 */

import i18n from '../../i18n';

/**
 * Missing translation result
 */
export interface MissingTranslation {
  namespace: string;
  key: string;
  missingIn: string[]; // Languages where this key is missing
  existsIn: string[]; // Languages where this key exists
}

/**
 * Translation comparison result
 */
export interface TranslationComparison {
  missingKeys: MissingTranslation[];
  totalKeys: number;
  missingCount: number;
  coverage: number; // Percentage of keys that exist in all languages
}

/**
 * Get all keys from a nested object
 */
function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Get nested value from object by dot-notation key
 */
function getNestedValue(obj: Record<string, unknown>, key: string): unknown {
  const keys = key.split('.');
  let current: unknown = obj;

  for (const k of keys) {
    if (typeof current === 'object' && current !== null && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Check for missing translations
 *
 * @param baseLanguage - Base language to compare against (default: 'en')
 * @param targetLanguages - Languages to check (default: all available languages)
 * @returns Translation comparison result
 *
 * @example
 * ```ts
 * const result = checkMissingTranslations('en', ['tr']);
 * console.log(`Missing ${result.missingCount} keys`);
 * result.missingKeys.forEach(key => {
 *   console.log(`${key.namespace}:${key.key} missing in ${key.missingIn.join(', ')}`);
 * });
 * ```
 */
export function checkMissingTranslations(
  baseLanguage: string = 'en',
  targetLanguages?: string[]
): TranslationComparison {
  const resources = i18n.options.resources as Record<
    string,
    Record<string, Record<string, unknown>>
  >;
  const availableLanguages = Object.keys(resources);
  const languagesToCheck =
    targetLanguages || availableLanguages.filter((lang) => lang !== baseLanguage);

  const missingKeys: MissingTranslation[] = [];
  const allKeys = new Set<string>();

  // Get all namespaces
  const baseResources = resources[baseLanguage];
  if (!baseResources) {
    return {
      missingKeys: [],
      totalKeys: 0,
      missingCount: 0,
      coverage: 0,
    };
  }

  // Collect all keys from base language
  for (const [namespace, translations] of Object.entries(baseResources)) {
    const keys = getAllKeys(translations as Record<string, unknown>);
    keys.forEach((key) => {
      allKeys.add(`${namespace}:${key}`);
    });
  }

  // Check each key in target languages
  for (const fullKey of allKeys) {
    const [namespace, ...keyParts] = fullKey.split(':');
    const key = keyParts.join(':');

    const missingIn: string[] = [];
    const existsIn: string[] = [baseLanguage];

    for (const lang of languagesToCheck) {
      const langResources = resources[lang];
      if (!langResources || !langResources[namespace]) {
        missingIn.push(lang);
        continue;
      }

      const value = getNestedValue(langResources[namespace] as Record<string, unknown>, key);
      if (value === undefined) {
        missingIn.push(lang);
      } else {
        existsIn.push(lang);
      }
    }

    if (missingIn.length > 0) {
      missingKeys.push({
        namespace,
        key,
        missingIn,
        existsIn,
      });
    }
  }

  const totalKeys = allKeys.size;
  const missingCount = missingKeys.length;
  const coverage = totalKeys > 0 ? ((totalKeys - missingCount) / totalKeys) * 100 : 100;

  return {
    missingKeys,
    totalKeys,
    missingCount,
    coverage,
  };
}

/**
 * Get missing translations for a specific namespace
 *
 * @param namespace - Namespace to check
 * @param baseLanguage - Base language (default: 'en')
 * @param targetLanguages - Languages to check
 * @returns Missing translations for the namespace
 */
export function getMissingTranslationsForNamespace(
  namespace: string,
  baseLanguage: string = 'en',
  targetLanguages?: string[]
): MissingTranslation[] {
  const result = checkMissingTranslations(baseLanguage, targetLanguages);
  return result.missingKeys.filter((key) => key.namespace === namespace);
}

/**
 * Generate a report of missing translations
 *
 * @param baseLanguage - Base language (default: 'en')
 * @param targetLanguages - Languages to check
 * @returns Formatted report string
 */
export function generateMissingTranslationsReport(
  baseLanguage: string = 'en',
  targetLanguages?: string[]
): string {
  const result = checkMissingTranslations(baseLanguage, targetLanguages);

  let report = `\n📊 Missing Translations Report\n`;
  report += `═══════════════════════════════════════\n\n`;
  report += `Base Language: ${baseLanguage}\n`;
  report += `Total Keys: ${result.totalKeys}\n`;
  report += `Missing Keys: ${result.missingCount}\n`;
  report += `Coverage: ${result.coverage.toFixed(2)}%\n\n`;

  if (result.missingKeys.length === 0) {
    report += `✅ All translations are complete!\n`;
    return report;
  }

  report += `Missing Translations:\n`;
  report += `───────────────────────────────────────\n\n`;

  // Group by namespace
  const byNamespace = result.missingKeys.reduce(
    (acc, key) => {
      if (!acc[key.namespace]) {
        acc[key.namespace] = [];
      }
      acc[key.namespace].push(key);
      return acc;
    },
    {} as Record<string, MissingTranslation[]>
  );

  for (const [namespace, keys] of Object.entries(byNamespace)) {
    report += `📦 ${namespace}\n`;
    for (const key of keys) {
      report += `  ❌ ${key.key}\n`;
      report += `     Missing in: ${key.missingIn.join(', ')}\n`;
    }
    report += `\n`;
  }

  return report;
}

/**
 * Check if a translation key exists in all languages
 *
 * @param key - Translation key (format: 'namespace:key' or 'key' for default namespace)
 * @param languages - Languages to check (default: all available languages)
 * @returns true if key exists in all languages
 */
export function isTranslationComplete(key: string, languages?: string[]): boolean {
  const resources = i18n.options.resources as Record<
    string,
    Record<string, Record<string, unknown>>
  >;
  const availableLanguages = languages || Object.keys(resources);

  const [namespace, ...keyParts] = key.includes(':') ? key.split(':') : ['common', key];
  const translationKey = keyParts.join(':');

  for (const lang of availableLanguages) {
    const langResources = resources[lang];
    if (!langResources || !langResources[namespace]) {
      return false;
    }

    const value = getNestedValue(
      langResources[namespace] as Record<string, unknown>,
      translationKey
    );
    if (value === undefined) {
      return false;
    }
  }

  return true;
}
