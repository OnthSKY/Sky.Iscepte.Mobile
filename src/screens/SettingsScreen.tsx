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
import { MODULE_CONFIGS } from '../core/config/moduleConfig';
import { Role } from '../core/config/appConstants';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  // Get all translation namespaces from MODULE_CONFIGS
  const translationNamespaces = useMemo(() => {
    const namespaces = new Set(['settings', 'common', 'packages']);
    MODULE_CONFIGS.forEach((module) => {
      namespaces.add(module.translationNamespace);
    });
    return Array.from(namespaces);
  }, []);
  const { t } = useTranslation(translationNamespaces);
  const { colors } = useTheme();
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const role = useAppStore((s) => s.role);
  const permissions = usePermissions(role);

  // User Settings (General - dil, tema vb.)
  const userSettings = useMemo(() => {
    const userSettingsList: Array<{
      key: string;
      title: string;
      desc: string;
      icon: string;
      route: string;
      requiredPermission: string;
    }> = [];

    // General Settings Module - Always available (settings:view)
    if (permissions.can('settings:view')) {
      userSettingsList.push({
        key: 'general',
        title: t('settings:settings', { defaultValue: 'Ayarlar' }),
        desc: t('settings:general_settings_module_desc', { defaultValue: 'Dil, tema ve diğer genel ayarlar' }),
        icon: 'settings-outline',
        route: 'GeneralModuleSettings',
        requiredPermission: 'settings:view',
      });
    }

    // My Package - Only for OWNER role
    if (role === Role.OWNER && permissions.can('settings:view')) {
      userSettingsList.push({
        key: 'my_package',
        title: t('packages:my_package', { defaultValue: 'Paketim' }),
        desc: t('packages:my_package_desc', { defaultValue: 'Mevcut paketinizin özeti ve özellikleri' }),
        icon: 'cube-outline',
        route: 'MyPackage',
        requiredPermission: 'settings:view',
      });
    }

    // Packages - Only for OWNER role
    if (role === Role.OWNER && permissions.can('settings:view')) {
      userSettingsList.push({
        key: 'packages',
        title: t('packages:packages', { defaultValue: 'Paketler' }),
        desc: t('packages:select_package', { defaultValue: 'İşletmeniz için en uygun paketi seçin' }),
        icon: 'cube-outline',
        route: 'Packages',
        requiredPermission: 'settings:view',
      });
    }

    return userSettingsList;
  }, [t, permissions, role]);

  // Module Settings (Tüm modül ayarları)
  const moduleSettings = useMemo(() => {
    const modulesList: Array<{
      key: string;
      title: string;
      desc: string;
      icon: string;
      route: string;
      requiredPermission: string;
      isLocked?: boolean;
    }> = [];

    // Get module settings from MODULE_CONFIGS (same as FullScreenMenu)
    MODULE_CONFIGS.forEach((module) => {
      const hasAccess = permissions.can(module.requiredPermission);
      // Route format: StockModuleSettings, CustomersModuleSettings, etc.
      const moduleSettingsRoute = `${module.key.charAt(0).toUpperCase() + module.key.slice(1)}ModuleSettings`;
      
      // Get module name using same format as FullScreenMenu: t('stock:module_name')
      const moduleName = t(`${module.translationNamespace}:${module.translationKey}`, {
        defaultValue: module.key,
      });
      
      // Get module description from translation: settings:stock_management
      const moduleDesc = t(`settings:${module.key}_management`, { 
        defaultValue: `${moduleName} ayarları` 
      });
      
      modulesList.push({
        key: module.key,
        title: moduleName,
        desc: moduleDesc,
        icon: module.icon,
        route: moduleSettingsRoute,
        requiredPermission: module.requiredPermission,
        isLocked: !hasAccess,
      });
    });

    // Filter: Staff only sees unlocked items, Owner/Admin sees all (locked items shown with lock icon)
    return role === 'staff' 
      ? modulesList.filter(m => !m.isLocked)
      : modulesList;
  }, [t, permissions, role]);

  const styles = getStyles(colors);

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('common:settings')}</Text>

        {/* Form Templates Section */}
        {permissions.canAny(['stock:view', 'customers:view', 'suppliers:view', 'sales:view', 'purchases:view', 'expenses:view', 'revenue:view', 'employees:view']) && (
          <View style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{t('settings:form_templates', { defaultValue: 'Form Şablonları' })}</Text>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => navigation.navigate('FormTemplateManagement')}
              >
                <View style={styles.settingItemLeft}>
                  <Ionicons name="document-text-outline" size={22} color="#8B5CF6" />
                  <View style={styles.settingItemContent}>
                    <Text style={[styles.settingItemTitle, { color: colors.text }]}>
                      {t('settings:manage_form_templates', { defaultValue: 'Form Şablonlarını Yönet' })}
                    </Text>
                    <Text style={[styles.settingItemDesc, { color: colors.muted }]}>
                      {t('settings:manage_form_templates_desc', { defaultValue: 'Tüm modüller için form şablonlarını oluşturun, düzenleyin ve çoğaltın' })}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* User Settings Section - General settings (dil, tema vb.) */}
        {userSettings.length > 0 && (
          <View style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{t('settings:user_settings', { defaultValue: 'Kullanıcı Ayarları' })}</Text>
            
            {userSettings.map((setting, index) => (
              <View key={setting.key} style={[styles.card, index < userSettings.length - 1 && { marginBottom: spacing.md }]}>
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={() => navigation.navigate(setting.route)}
                >
                  <View style={styles.settingItemLeft}>
                    <Ionicons name={setting.icon as any} size={22} color={colors.primary} />
                    <View style={styles.settingItemContent}>
                      <Text style={[styles.settingItemTitle, { color: colors.text }]}>
                        {setting.title}
                      </Text>
                      <Text style={[styles.settingItemDesc, { color: colors.muted }]}>
                        {setting.desc}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Module Settings Section - Module-specific settings */}
        {moduleSettings.length > 0 && (
          <View style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{t('settings:module_settings', { defaultValue: 'Modül Ayarları' })}</Text>
            
                        {moduleSettings.map((module, index) => (
              <View key={module.key} style={[styles.card, index < moduleSettings.length - 1 && { marginBottom: spacing.md }]}>                                  
                <TouchableOpacity
                  style={[styles.settingItem, module.isLocked && { opacity: 0.6 }]}
                  onPress={() => {
                    if (module.isLocked) {
                      // If locked, navigate to Packages screen to upgrade
                      navigation.navigate('Packages');
                    } else {
                      navigation.navigate(module.route);
                    }
                  }}
                >
                  <View style={styles.settingItemLeft}>
                    <View style={{ position: 'relative' }}>
                      <Ionicons name={module.icon as any} size={22} color={module.isLocked ? colors.muted : colors.primary} />                                                                     
                      {module.isLocked && (
                        <View style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          backgroundColor: colors.muted,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          <Ionicons name="lock-closed" size={8} color={colors.surface} />
                        </View>
                      )}
                    </View>
                    <View style={styles.settingItemContent}>
                      <Text style={[styles.settingItemTitle, { color: module.isLocked ? colors.muted : colors.text }]}>                                                                          
                        {module.title}
                      </Text>
                      <Text style={[styles.settingItemDesc, { color: colors.muted }]}>                                                                          
                        {module.desc}
                      </Text>
                    </View>
                  </View>
                  {module.isLocked ? (
                    <Ionicons name="lock-closed" size={20} color={colors.muted} />
                  ) : (
                    <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Support Section - Separated from module settings */}
        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>{t('settings:support', { defaultValue: 'Destek' })}</Text>
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

