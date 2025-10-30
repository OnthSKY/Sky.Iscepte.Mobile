import { useCallback } from 'react';
import i18n from '../../i18n';

export const useLocalization = () => {
  const t = useCallback((key: string, options?: any) => i18n.t(key, options), []);
  const changeLanguage = useCallback(async (lang: 'tr' | 'en') => {
    await i18n.changeLanguage(lang);
  }, []);
  return { t, changeLanguage, language: i18n.language as 'tr' | 'en' };
};

export default useLocalization;


