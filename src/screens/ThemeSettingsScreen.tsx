import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme, AppTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * Theme Settings Screen
 * Dedicated screen for theme settings
 */
export default function ThemeSettingsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['settings', 'common']);
  const { colors, theme, setTheme, activeTheme } = useTheme();
  
  const handleBackPress = () => {
    navigation.navigate('Settings');
  };

  const themeOptions = [
    { key: 'light', label: t('settings:light', { defaultValue: 'Açık' }), icon: 'sunny-outline', desc: t('settings:light_desc', { defaultValue: 'Açık tema kullan' }) },
    { key: 'dark', label: t('settings:dark', { defaultValue: 'Koyu' }), icon: 'moon-outline', desc: t('settings:dark_desc', { defaultValue: 'Koyu tema kullan' }) },
    { key: 'system', label: t('settings:system', { defaultValue: 'Sistem' }), icon: 'phone-portrait-outline', desc: t('settings:system_desc', { defaultValue: 'Sistem temasını kullan' }) },
  ];

  const styles = getStyles(colors);

  return (
    <ScreenLayout 
      title={t('settings:theme', { defaultValue: 'Tema' })}
      subtitle={t('settings:general_settings_title', { defaultValue: 'Genel Ayarlar' })}
      showBackButton
      onBackPress={handleBackPress}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.description}>
            {t('settings:theme_desc', { defaultValue: 'Uygulama temasını seçin' })}
          </Text>
          
          <View style={styles.optionsList}>
            {themeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.optionCard,
                  theme === opt.key && styles.optionCardActive,
                  { borderColor: theme === opt.key ? colors.primary : colors.border }
                ]}
                onPress={() => setTheme(opt.key as AppTheme)}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.iconContainer,
                    theme === opt.key && { backgroundColor: colors.primary + '20' }
                  ]}>
                    <Ionicons 
                      name={opt.icon as any} 
                      size={24} 
                      color={theme === opt.key ? colors.primary : colors.muted} 
                    />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[
                      styles.optionLabel,
                      { color: theme === opt.key ? colors.primary : colors.text }
                    ]}>
                      {opt.label}
                    </Text>
                    <Text style={styles.optionDesc}>
                      {opt.desc}
                    </Text>
                  </View>
                  {theme === opt.key && (
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.page,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.muted,
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

