import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * General Module Settings Screen
 * Shows all general settings (language, theme, etc.)
 */
export default function GeneralModuleSettingsScreen() {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { colors, theme } = useTheme();

  const generalSettings = [
    {
      key: 'language',
      label: t('settings:language', { defaultValue: 'Dil' }),
      desc: t('settings:language_desc', { defaultValue: 'Uygulama dilini seçin' }),
      icon: 'language-outline',
      route: 'LanguageSettings',
      color: '#3B82F6',
      currentValue: i18n.language === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English',
    },
    {
      key: 'theme',
      label: t('settings:theme', { defaultValue: 'Tema' }),
      desc: t('settings:theme_desc', { defaultValue: 'Uygulama temasını seçin' }),
      icon: 'color-palette-outline',
      route: 'ThemeSettings',
      color: '#10B981',
      currentValue: theme === 'light' ? t('settings:light', { defaultValue: 'Açık' }) : 
                   theme === 'dark' ? t('settings:dark', { defaultValue: 'Koyu' }) : 
                   t('settings:system', { defaultValue: 'Sistem' }),
    },
  ];

  const styles = getStyles(colors);

  const handleBackPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <ScreenLayout 
      title={t('settings:settings', { defaultValue: 'Ayarlar' })}
      subtitle={t('settings:module_settings', { defaultValue: 'Modül Ayarları' })}
      showBackButton
      onBackPress={handleBackPress}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.description}>
          {t('settings:general_settings_desc', { defaultValue: 'Uygulama genel ayarları' })}
        </Text>

        <View style={styles.settingsList}>
          {generalSettings.map((setting) => (
            <TouchableOpacity
              key={setting.key}
              style={styles.settingCard}
              onPress={() => navigation.navigate(setting.route)}
            >
              <View style={styles.settingContent}>
                <View style={[styles.iconContainer, { backgroundColor: setting.color + '20' }]}>
                  <Ionicons name={setting.icon as any} size={24} color={setting.color} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>
                    {setting.label}
                  </Text>
                  <Text style={styles.settingDesc}>
                    {setting.desc}
                  </Text>
                  {setting.currentValue && (
                    <Text style={styles.currentValue}>
                      {t('settings:current', { defaultValue: 'Mevcut' })}: {setting.currentValue}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
              </View>
            </TouchableOpacity>
          ))}
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
  description: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  settingsList: {
    gap: spacing.md,
  },
  settingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  settingDesc: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
    marginBottom: spacing.xs / 2,
  },
  currentValue: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
});

