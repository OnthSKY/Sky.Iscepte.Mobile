import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store/useAppStore';
import { usePermissions } from '../core/hooks/usePermissions';

/**
 * Employees Module Settings Screen
 * Shows all settings related to the Employees module
 */
export default function EmployeesModuleSettingsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['settings', 'common', 'employees']);
  const { colors } = useTheme();
  const role = useAppStore((s) => s.role);
  const permissions = usePermissions(role);

  const allEmployeesSettings = [
    {
      key: 'employee-permissions',
      label: t('employees:manage_permissions', { defaultValue: 'Çalışan Yetkilerini Yönet' }),
      desc: t('settings:manage_employee_permissions_desc', { defaultValue: 'Staff çalışanlarının yetkilerini yönetin' }),
      icon: 'people-outline',
      route: 'Employees',
      color: '#8B5CF6',
      permission: 'employees:edit',
    },
  ];

  // Filter settings based on permissions
  const employeesSettings = useMemo(() => {
    return allEmployeesSettings.filter(setting => {
      if (!setting.permission) return true;
      return permissions.can(setting.permission);
    });
  }, [permissions, allEmployeesSettings]);

  const styles = getStyles(colors);

  const handleBackPress = () => {
    navigation.navigate('Settings');
  };

  // Check if user has access to employees module
  if (!permissions.can('employees:view')) {
    return (
      <ScreenLayout 
        title={t('employees:employees', { defaultValue: 'Çalışanlar' })}
        subtitle={t('settings:module_settings', { defaultValue: 'Modül Ayarları' })}
        showBackButton
        onBackPress={handleBackPress}
      >
        <View style={styles.container}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {t('settings:no_permission', { defaultValue: 'Bu sayfaya erişim yetkiniz yok' })}
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  if (employeesSettings.length === 0) {
    return (
      <ScreenLayout 
        title={t('employees:employees', { defaultValue: 'Çalışanlar' })}
        subtitle={t('settings:module_settings', { defaultValue: 'Modül Ayarları' })}
        showBackButton
        onBackPress={handleBackPress}
      >
        <View style={styles.container}>
          <Text style={[styles.errorText, { color: colors.muted }]}>
            {t('settings:no_settings_available', { defaultValue: 'Bu modül için ayar bulunmamaktadır' })}
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout 
      title={t('employees:employees', { defaultValue: 'Çalışanlar' })}
      subtitle={t('settings:module_settings', { defaultValue: 'Modül Ayarları' })}
      showBackButton
      onBackPress={handleBackPress}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.description}>
          {t('settings:employees_module_settings_desc', { defaultValue: 'Çalışanlar modülüne özel ayarlar' })}
        </Text>

        <View style={styles.settingsList}>
          {employeesSettings.map((setting) => (
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
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: spacing.xl,
  },
});

