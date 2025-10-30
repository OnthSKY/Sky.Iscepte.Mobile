import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Select from './Select';
import i18n from '../../i18n';
import { useAppStore } from '../../store/useAppStore';

type Props = { centeredLabel?: boolean };

export default function LanguagePicker({ centeredLabel }: Props) {
  const lang = (i18n.language as 'tr' | 'en') || 'tr';
  const setLanguage = useAppStore((s) => s.setLanguage);
  return (
    <View>
      <Text style={{ marginBottom: 6, textAlign: centeredLabel ? 'center' : undefined }}>
        {i18n.t('login:language') || 'Dil / Language'}
      </Text>
      <Select
        value={lang}
        options={[
          { label: '🇹🇷 Türkçe', value: 'tr' },
          { label: '🇬🇧 English', value: 'en' },
        ]}
        onChange={async (value) => {
          const v = value as 'tr' | 'en';
          await setLanguage(v);
          await i18n.changeLanguage(v);
        }}
        placeholder={(i18n.t('login:select_language') as string) || 'Select language'}
      />
    </View>
  );
}


