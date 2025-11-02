import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';

/**
 * Language Settings Screen
 * Dedicated screen for language settings
 */
export default function LanguageSettingsScreen() {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { colors } = useTheme();
  
  const handleBackPress = () => {
    navigation.navigate('Settings');
  };

  const languageOptions = [
    { key: 'tr', label: t('settings:turkish', { defaultValue: 'Türkçe' }), icon: '🇹🇷' },
    { key: 'en', label: t('settings:english', { defaultValue: 'İngilizce' }), icon: '🇬🇧' },
  ];

  const styles = getStyles(colors);

  return (
    <ScreenLayout 
      title={t('settings:language', { defaultValue: 'Dil' })}
      subtitle={t('settings:general_settings_title', { defaultValue: 'Genel Ayarlar' })}
      showBackButton
      onBackPress={handleBackPress}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.description}>
            {t('settings:language_desc', { defaultValue: 'Uygulama dilini seçin' })}
          </Text>
          
          <View style={styles.optionsList}>
            {languageOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.optionCard,
                  i18n.language === opt.key && styles.optionCardActive,
                  { borderColor: i18n.language === opt.key ? colors.primary : colors.border }
                ]}
                onPress={() => i18n.changeLanguage(opt.key)}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionIcon}>{opt.icon}</Text>
                  <Text style={[
                    styles.optionLabel,
                    { color: i18n.language === opt.key ? colors.primary : colors.text }
                  ]}>
                    {opt.label}
                  </Text>
                  {i18n.language === opt.key && (
                    <View style={[styles.checkIcon, { backgroundColor: colors.primary }]}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  optionsList: {
    gap: spacing.md,
  },
  optionCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: colors.page,
  },
  optionCardActive: {
    backgroundColor: colors.surface,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionIcon: {
    fontSize: 32,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

