import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import Select from './Select';
import i18n from '../../i18n';
import { useAppStore } from '../../store/useAppStore';

type Props = { centeredLabel?: boolean; showLabel?: boolean; variant?: 'default' | 'compact' };

export default function LanguagePicker({ centeredLabel, showLabel = true, variant = 'default' }: Props) {
  const lang = (i18n.language as 'tr' | 'en') || 'tr';
  const setLanguage = useAppStore((s) => s.setLanguage);

  if (variant === 'compact') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity
          onPress={async () => { await setLanguage('tr'); await i18n.changeLanguage('tr'); }}
          style={{ opacity: lang === 'tr' ? 1 : 0.5 }}
          accessibilityLabel="Türkçe"
        >
          <Text style={{ fontSize: 20 }}>🇹🇷</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => { await setLanguage('en'); await i18n.changeLanguage('en'); }}
          style={{ opacity: lang === 'en' ? 1 : 0.5 }}
          accessibilityLabel="English"
        >
          <Text style={{ fontSize: 20 }}>🇬🇧</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      {showLabel && (
        <Text style={{ marginBottom: 6, textAlign: centeredLabel ? 'center' : undefined }}>
          {i18n.t('login:language') || 'Dil / Language'}
        </Text>
      )}
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


