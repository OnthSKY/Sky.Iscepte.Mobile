import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../shared/components/Button';
import { employeeVerificationSettingsService } from '../modules/employees/services/employeeVerificationSettingsService';
import notificationService from '../shared/services/notificationService';

/**
 * Employee Verification Settings Screen
 * Configure TC Kimlik and IMEI verification settings
 */
export default function EmployeeVerificationSettingsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation(['settings', 'common', 'employees']);
  const { colors, activeTheme } = useTheme();
  const fromModule = route.params?.fromModule || 'EmployeesModuleSettings';
  
  const [tcVerificationEnabled, setTcVerificationEnabled] = useState(false);
  const [imeiVerificationEnabled, setImeiVerificationEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await employeeVerificationSettingsService.get();
      setTcVerificationEnabled(settings.tcVerificationEnabled);
      setImeiVerificationEnabled(settings.imeiVerificationEnabled);
    } catch (error) {
      console.error('Failed to load verification settings:', error);
      notificationService.error(t('settings:load_error', { defaultValue: 'Ayarlar yüklenirken bir hata oluştu' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    if (fromModule === 'EmployeesModuleSettings') {
      navigation.navigate('EmployeesModuleSettings');
    } else {
      navigation.navigate('Settings');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await employeeVerificationSettingsService.update({
        tcVerificationEnabled,
        imeiVerificationEnabled,
      });
      notificationService.success(t('settings:save_success', { defaultValue: 'Ayarlar başarıyla kaydedildi' }));
    } catch (error) {
      console.error('Failed to save verification settings:', error);
      notificationService.error(t('settings:save_error', { defaultValue: 'Ayarlar kaydedilirken bir hata oluştu' }));
    } finally {
      setIsSaving(false);
    }
  };

  const styles = getStyles(colors);

  if (isLoading) {
    return (
      <ScreenLayout 
        title={t('employees:verification_settings', { defaultValue: 'Doğrulama Ayarları' })}
        subtitle={t('settings:module_settings', { defaultValue: 'Modül Ayarları' })}
        showBackButton
        onBackPress={handleBackPress}
      >
        <View style={styles.container}>
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            {t('common:loading', { defaultValue: 'Yükleniyor...' })}
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout 
      title={t('employees:verification_settings', { defaultValue: 'Doğrulama Ayarları' })}
      subtitle={t('settings:module_settings', { defaultValue: 'Modül Ayarları' })}
      showBackButton
      onBackPress={handleBackPress}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.description, { color: colors.muted }]}>
          {t('employees:verification_settings_desc', { 
            defaultValue: 'Personel formunda TC Kimlik ve IMEI sorgulama özelliklerini etkinleştirin veya devre dışı bırakın.' 
          })}
        </Text>

        {/* TC Kimlik Verification */}
        <View style={styles.settingsGroup}>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="id-card-outline" size={24} color={colors.primary} />
                <View style={styles.settingItemContent}>
                  <Text style={[styles.settingItemTitle, { color: colors.text }]}>
                    {t('employees:tc_verification', { defaultValue: 'TC Kimlik Sorgulama' })}
                  </Text>
                  <Text style={[styles.settingItemDesc, { color: colors.muted }]}>
                    {t('employees:tc_verification_desc', { 
                      defaultValue: 'Personel formunda TC kimlik numarası girildiğinde otomatik sorgulama yapılır' 
                    })}
                  </Text>
                </View>
              </View>
              <Switch
                value={tcVerificationEnabled}
                onValueChange={setTcVerificationEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={activeTheme === 'dark' ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* IMEI Verification */}
        <View style={styles.settingsGroup}>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="phone-portrait-outline" size={24} color={colors.primary} />
                <View style={styles.settingItemContent}>
                  <Text style={[styles.settingItemTitle, { color: colors.text }]}>
                    {t('employees:imei_verification', { defaultValue: 'IMEI Sorgulama' })}
                  </Text>
                  <Text style={[styles.settingItemDesc, { color: colors.muted }]}>
                    {t('employees:imei_verification_desc', { 
                      defaultValue: 'Personel formunda IMEI numarası girildiğinde otomatik sorgulama yapılır' 
                    })}
                  </Text>
                </View>
              </View>
              <Switch
                value={imeiVerificationEnabled}
                onValueChange={setImeiVerificationEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={activeTheme === 'dark' ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {t('employees:verification_info', { 
              defaultValue: 'Bu özellikler etkinleştirildiğinde, personel formunda ilgili alanlar otomatik olarak sorgulama yapacaktır. Etkin değilse, düz form alanları olarak çalışacaktır.' 
            })}
          </Text>
        </View>

        {/* Save Button */}
        <View style={styles.settingsGroup}>
          <Button
            title={isSaving ? t('settings:saving', { defaultValue: 'Kaydediliyor...' }) : t('settings:save', { defaultValue: 'Kaydet' })}
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  loadingText: {
    textAlign: 'center',
    padding: spacing.xl,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  settingsGroup: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  card: {
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  settingItemDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});

