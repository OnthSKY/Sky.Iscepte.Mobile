import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme, AppTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ErrorReportModal from '../shared/components/ErrorReportModal';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation(['settings', 'common', 'stock']);
  const { colors, theme, setTheme, activeTheme } = useTheme();
  const [contactModalVisible, setContactModalVisible] = useState(false);

  const languageOptions = [
    { key: 'tr', label: t('turkish'), icon: '🇹🇷' },
    { key: 'en', label: t('english'), icon: '🇬🇧' },
  ];

  const themeOptions = [
    { key: 'light', label: t('light'), icon: 'sunny-outline' },
    { key: 'dark', label: t('dark'), icon: 'moon-outline' },
    { key: 'system', label: t('system'), icon: 'cog-outline' },
  ];

  const styles = getStyles(colors);

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('common:settings')}</Text>

        {/* Language Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('language')}</Text>
          <View style={styles.segmentControl}>
            {languageOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.segmentButton,
                  i18n.language === opt.key && styles.segmentButtonActive,
                ]}
                onPress={() => i18n.changeLanguage(opt.key)}
              >
                <Text style={[styles.segmentButtonText, { color: i18n.language === opt.key ? colors.primary : colors.muted }]}>
                  {`${opt.icon} ${opt.label}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Theme Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('theme')}</Text>
          <View style={styles.segmentControl}>
            {themeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.segmentButton,
                  theme === opt.key && styles.segmentButtonActive,
                ]}
                onPress={() => setTheme(opt.key as AppTheme)}
              >
                <Ionicons 
                  name={opt.icon as any} 
                  size={20} 
                  color={theme === opt.key ? colors.primary : colors.muted} 
                />
                <Text style={[styles.segmentButtonText, { color: theme === opt.key ? colors.primary : colors.muted }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Admin Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('admin_settings', { defaultValue: 'Yönetici Ayarları' })}</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('GlobalFieldsManagement')}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name="grid-outline" size={22} color={colors.primary} />
              <View style={styles.settingItemContent}>
                <Text style={[styles.settingItemTitle, { color: colors.text }]}>
                  {t('stock:manage_global_fields', { defaultValue: 'Genel Alanları Yönet' })}
                </Text>
                <Text style={[styles.settingItemDesc, { color: colors.muted }]}>
                  {t('stock:manage_global_fields_desc', { defaultValue: 'Tüm ürünlerde kullanılabilecek genel alanları oluşturun' })}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Contact Us */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setContactModalVisible(true)}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name="mail-outline" size={22} color={colors.primary} />
              <View style={styles.settingItemContent}>
                <Text style={[styles.settingItemTitle, { color: colors.text }]}>
                  {t('common:contact_us', { defaultValue: 'Bizimle İletişime Geç' })}
                </Text>
                <Text style={[styles.settingItemDesc, { color: colors.muted }]}>
                  {t('common:contact_us_desc', { defaultValue: 'Sorularınız, önerileriniz veya sorunlarınız için bize ulaşın' })}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Contact Modal */}
      <ErrorReportModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        errorCategory="business"
        errorMessage={t('common:contact_form', { defaultValue: 'İletişim Formu' })}
        context="settings-contact"
        mode="contact"
      />
    </ScreenLayout>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: colors.page,
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  segmentButtonActive: {
    backgroundColor: colors.surface,
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xs / 2,
  },
  settingItemDesc: {
    fontSize: 12,
  },
});

