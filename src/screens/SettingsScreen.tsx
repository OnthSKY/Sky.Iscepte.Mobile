import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme, AppTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ErrorReportModal from '../shared/components/ErrorReportModal';
import { useAppStore } from '../store/useAppStore';
import { usePermissions } from '../core/hooks/usePermissions';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['settings', 'common', 'stock', 'employees']);
  const { colors } = useTheme();
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const role = useAppStore((s) => s.role);
  const permissions = usePermissions(role);

  const modules = useMemo(() => {
    const modulesList = [];
    
    // General Settings Module - Always available (settings:view)
    if (permissions.can('settings:view')) {
      modulesList.push({
        key: 'general',
        title: t('settings:settings', { defaultValue: 'Ayarlar' }),
        desc: t('settings:general_settings_module_desc', { defaultValue: 'Dil, tema ve diğer genel ayarlar' }),
        icon: 'settings-outline',
        route: 'GeneralModuleSettings',
        requiredPermission: 'settings:view',
      });
    }

    // Stock Module - Requires stock:view
    if (permissions.can('stock:view')) {
      modulesList.push({
        key: 'stock',
        title: t('stock:stock', { defaultValue: 'Stock' }),
        desc: t('settings:stock_management', { defaultValue: 'Stok yönetimi ayarları' }),
        icon: 'cube-outline',
        route: 'StockModuleSettings',
        requiredPermission: 'stock:view',
      });
    }

    // Employees Module - Requires employees:view
    if (permissions.can('employees:view')) {
      modulesList.push({
        key: 'employees',
        title: t('employees:employees', { defaultValue: 'Çalışanlar' }),
        desc: t('settings:employees_management', { defaultValue: 'Çalışan yönetimi ayarları' }),
        icon: 'people-outline',
        route: 'EmployeesModuleSettings',
        requiredPermission: 'employees:view',
      });
    }

    return modulesList;
  }, [t, permissions]);

  const styles = getStyles(colors);

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('common:settings')}</Text>

        {/* Modules Section */}
        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>{t('settings:modules', { defaultValue: 'Modüller' })}</Text>
          
          {modules.map((module, index) => (
            <View key={module.key} style={[styles.card, index < modules.length - 1 && { marginBottom: spacing.md }]}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => navigation.navigate(module.route)}
              >
                <View style={styles.settingItemLeft}>
                  <Ionicons name={module.icon as any} size={22} color={colors.primary} />
                  <View style={styles.settingItemContent}>
                    <Text style={[styles.settingItemTitle, { color: colors.text }]}>
                      {module.title}
                    </Text>
                    <Text style={[styles.settingItemDesc, { color: colors.muted }]}>
                      {module.desc}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.settingsGroup}>
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
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  settingsGroup: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
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
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingItemValue: {
    fontSize: 14,
    fontWeight: '500',
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

