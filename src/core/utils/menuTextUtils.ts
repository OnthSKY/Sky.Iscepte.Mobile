/**
 * Menu Text Utility Functions
 * Transforms menu text based on case preference and language
 */

import { MenuTextCase } from '../config/appConstants';
import i18n from '../../i18n';

/**
 * Replaces Turkish characters with their English equivalents for uppercase conversion
 * This ensures that when converting to uppercase in English, we don't have Turkish characters
 */
const replaceTurkishChars = (text: string): string => {
  // Turkish to English character mapping
  const turkishToEnglish: Record<string, string> = {
    'İ': 'I',
    'ı': 'i',
    'Ö': 'O',
    'ö': 'o',
    'Ü': 'U',
    'ü': 'u',
    'Ş': 'S',
    'ş': 's',
    'Ğ': 'G',
    'ğ': 'g',
    'Ç': 'C',
    'ç': 'c',
  };

  let result = text;
  Object.entries(turkishToEnglish).forEach(([turkish, english]) => {
    result = result.replace(new RegExp(turkish, 'g'), english);
  });
  return result;
};

/**
 * Transforms menu text based on case preference
 * For English language, replaces Turkish characters to avoid issues with uppercase
 * 
 * @param text - The text to transform
 * @param caseType - The case transformation to apply
 * @param language - Optional language override (defaults to current i18n language)
 * @returns Transformed text
 */
export const transformMenuText = (
  text: string,
  caseType: MenuTextCase,
  language?: string
): string => {
  const currentLang = language || (i18n.language as string);
  const isEnglish = currentLang === 'en';

  // If English and uppercase, replace Turkish characters first
  if (isEnglish && caseType === MenuTextCase.UPPERCASE) {
    const textWithoutTurkish = replaceTurkishChars(text);
    return textWithoutTurkish.toUpperCase();
  }

  // Apply case transformation
  switch (caseType) {
    case MenuTextCase.UPPERCASE:
      return text.toUpperCase();
    case MenuTextCase.LOWERCASE:
      return text.toLowerCase();
    case MenuTextCase.NORMAL:
    default:
      return text;
  }
};

/**
 * Calculates appropriate font size for compact areas based on text case
 * Uppercase text takes more space, so we reduce font size slightly
 * 
 * @param baseFontSize - Base font size
 * @param caseType - The case transformation type
 * @returns Adjusted font size
 */
export const getCompactFontSize = (
  baseFontSize: number,
  caseType: MenuTextCase
): number => {
  switch (caseType) {
    case MenuTextCase.UPPERCASE:
      // Uppercase text is wider, reduce by ~10%
      return Math.max(baseFontSize * 0.9, baseFontSize - 1);
    case MenuTextCase.LOWERCASE:
      // Lowercase can be slightly smaller
      return baseFontSize;
    case MenuTextCase.NORMAL:
    default:
      return baseFontSize;
  }
};

