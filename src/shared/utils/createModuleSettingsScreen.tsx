/**
 * Generic Module Settings Screen Factory
 * Creates module settings screens for any module with form templates
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../../shared/layouts/ScreenLayout';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../../store/useAppStore';
import { usePermissions } from '../../core/hooks/usePermissions';

interface ModuleSettingsItem {
  key: string;
  label: string;
  desc: string;
  icon: string;
  route: string;
  color: string;
  permission?: string;
}

interface CreateModuleSettingsScreenProps {
  module: string;
  translationNamespace: string;
  moduleTitle: string;
  settings: ModuleSettingsItem[];
  defaultBackRoute?: string;
}

export function createModuleSettingsScreen({
  module,
  translationNamespace,
  moduleTitle,
  settings,
  defaultBackRoute = 'Settings',
}: CreateModuleSettingsScreenProps) {
  return function ModuleSettingsScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation(['settings', 'common', translationNamespace]);
    const { colors } = useTheme();
    const role = useAppStore((s) => s.role);
    const permissions = usePermissions(role);

    const moduleSettings = useMemo(() => {
      return settings.filter(setting => {
        if (!setting.permission) return true;
        return permissions.can(setting.permission);
      });
    }, [permissions, settings]);

    const styles = getStyles(colors);

    const handleBackPress = () => {
      navigation.navigate(defaultBackRoute);
    };

    return (
      <ScreenLayout 
        title={moduleTitle}
        subtitle={t('settings:module_settings', { defaultValue: 'Modül Ayarları' })}
        showBackButton
        onBackPress={handleBackPress}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.description}>
            {t(`settings:${module}_module_settings_desc`, { defaultValue: `${moduleTitle} modülüne özel ayarlar` })}
          </Text>

          {moduleSettings.length === 0 ? (
            <View style={styles.container}>
              <Text style={[styles.description, { color: colors.muted, textAlign: 'center' }]}>
                {t('settings:no_settings_available', { defaultValue: 'Bu modül için ayar bulunmamaktadır' })}
              </Text>
            </View>
          ) : (
            <View style={styles.settingsList}>
              {moduleSettings.map((setting) => (
                <TouchableOpacity
                  key={setting.key}
                  style={styles.settingCard}
                  onPress={() => navigation.navigate(setting.route, { fromModule: `${module}ModuleSettings` })}
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
          )}
        </ScrollView>
      </ScreenLayout>
    );
  };
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
});

