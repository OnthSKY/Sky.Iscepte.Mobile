import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme, AppTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Input from '../shared/components/Input';
import Button from '../shared/components/Button';
import { useLowStockAlertStore } from '../core/store/lowStockAlertStore';
import stockAlertSettingsService from '../modules/products/services/stockAlertSettingsService';
import notificationService from '../shared/services/notificationService';

/**
 * Low Stock Alert Settings Screen
 * Dedicated screen for configuring low stock alert settings
 */
export default function LowStockAlertSettingsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation(['settings', 'common', 'stock']);
  const { colors, activeTheme } = useTheme();
  const fromModule = route.params?.fromModule || 'StockModuleSettings';
  
  const handleBackPress = () => {
    if (fromModule === 'Stock') {
      navigation.navigate('Stock');
    } else if (fromModule === 'StockModuleSettings') {
      navigation.navigate('StockModuleSettings');
    } else {
      navigation.navigate('Settings');
    }
  };
  
  // Low stock alert settings
  const { 
    threshold, 
    enabled, 
    reminderFrequency, 
    reminderLimit,
    setThreshold, 
    setEnabled, 
    setReminderFrequency,
    setReminderLimit,
    hydrate 
  } = useLowStockAlertStore();
  const [thresholdInput, setThresholdInput] = useState(String(threshold));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setThresholdInput(String(threshold));
  }, [threshold]);

  const handleThresholdChange = (text: string) => {
    setThresholdInput(text);
    const numValue = parseInt(text, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setThreshold(numValue);
    }
  };

  const handleThresholdBlur = () => {
    const numValue = parseInt(thresholdInput, 10);
    if (isNaN(numValue) || numValue < 0) {
      setThresholdInput(String(threshold));
    } else {
      setThreshold(numValue);
    }
  };

  const reminderFrequencyOptions = [
    { key: 'day', label: t('settings:per_day', { defaultValue: 'Günde' }) },
    { key: 'week', label: t('settings:per_week', { defaultValue: 'Haftada' }) },
  ];

  const reminderLimitOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 5, label: '5' },
    { value: 10, label: '10' },
  ] as const;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await stockAlertSettingsService.update({
        enabled,
        threshold,
        reminderFrequency,
        reminderLimit,
      });
      notificationService.success(t('settings:save_success', { defaultValue: 'Ayarlar başarıyla kaydedildi' }));
    } catch (error) {
      console.error('Failed to save stock alert settings:', error);
      notificationService.error(t('settings:save_error', { defaultValue: 'Ayarlar kaydedilirken bir hata oluştu' }));
    } finally {
      setIsSaving(false);
    }
  };

  const styles = getStyles(colors);

  return (
    <ScreenLayout 
      title={t('settings:stock_alerts', { defaultValue: 'Stok Bildirim Ayarları' })}
      subtitle={t('settings:stock_module_settings', { defaultValue: 'Stock Modülü Ayarları' })}
      showBackButton
      onBackPress={handleBackPress}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Enable/Disable Toggle */}
        <View style={styles.settingsGroup}>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="warning-outline" size={24} color={colors.primary} />
                <View style={styles.settingItemContent}>
                  <Text style={[styles.settingItemTitle, { color: colors.text }]}>
                    {t('settings:enable_low_stock_alerts', { defaultValue: 'Düşük Stok Uyarıları' })}
                  </Text>
                  <Text style={[styles.settingItemDesc, { color: colors.muted }]}>
                    {t('settings:enable_low_stock_alerts_desc', { defaultValue: 'Stok miktarı belirli seviyenin altına düştüğünde bildirim alın' })}
                  </Text>
                </View>
              </View>
              <Switch
                value={enabled}
                onValueChange={setEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={activeTheme === 'dark' ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {enabled && (
          <>
            {/* Threshold Settings */}
            <View style={styles.settingsGroup}>
              <Text style={styles.groupTitle}>{t('settings:alert_threshold', { defaultValue: 'Uyarı Eşiği' })}</Text>
              <View style={styles.card}>
                <Text style={[styles.cardTitle, { fontSize: 14, marginBottom: spacing.sm }]}>
                  {t('settings:alert_threshold', { defaultValue: 'Uyarı Eşiği' })}
                </Text>
                <Text style={[styles.settingItemDesc, { color: colors.muted, marginBottom: spacing.md }]}>
                  {t('settings:alert_threshold_desc', { defaultValue: 'Stok miktarı bu değerin altına düştüğünde bildirim alırsınız' })}
                </Text>
                <Input
                  value={thresholdInput}
                  onChangeText={handleThresholdChange}
                  onBlur={handleThresholdBlur}
                  placeholder={t('settings:threshold_placeholder', { defaultValue: 'Eşik değeri' })}
                  keyboardType="number-pad"
                  style={{ marginTop: spacing.xs }}
                />
                <Text style={[styles.settingItemDesc, { color: colors.muted, marginTop: spacing.sm }]}>
                  {t('settings:threshold_hint', { defaultValue: 'Mevcut eşik: {{threshold}} birim', threshold })}
                </Text>
              </View>
            </View>

            {/* Reminder Settings */}
            <View style={styles.settingsGroup}>
              <Text style={styles.groupTitle}>{t('settings:reminder_settings', { defaultValue: 'Hatırlatma Ayarları' })}</Text>
              
              {/* Reminder Frequency */}
              <View style={styles.card}>
                <Text style={[styles.cardTitle, { fontSize: 14, marginBottom: spacing.sm }]}>
                  {t('settings:reminder_frequency', { defaultValue: 'Hatırlatma Sıklığı' })}
                </Text>
                <Text style={[styles.settingItemDesc, { color: colors.muted, marginBottom: spacing.md }]}>
                  {t('settings:reminder_frequency_desc', { defaultValue: 'Hatırlatmaların hangi sıklıkla gönderileceğini seçin' })}
                </Text>
                <View style={styles.segmentControl}>
                  {reminderFrequencyOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.segmentButton,
                        reminderFrequency === opt.key && styles.segmentButtonActive,
                      ]}
                      onPress={() => setReminderFrequency(opt.key as 'day' | 'week')}
                    >
                      <Text style={[styles.segmentButtonText, { 
                        color: reminderFrequency === opt.key ? colors.primary : colors.muted 
                      }]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Reminder Limit */}
              <View style={[styles.card, { marginTop: spacing.md }]}>
                <Text style={[styles.cardTitle, { fontSize: 14, marginBottom: spacing.sm }]}>
                  {t('settings:reminder_limit', { defaultValue: 'Maksimum Hatırlatma Sayısı' })}
                </Text>
                <Text style={[styles.settingItemDesc, { color: colors.muted, marginBottom: spacing.md }]}>
                  {t('settings:reminder_limit_desc', { 
                    defaultValue: 'Seçtiğiniz süre içinde bir ürün için en fazla bu kadar hatırlatma alırsınız',
                  })}
                </Text>
                <View style={styles.segmentControl}>
                  {reminderLimitOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.segmentButton,
                        reminderLimit === opt.value && styles.segmentButtonActive,
                      ]}
                      onPress={() => setReminderLimit(opt.value as 1 | 2 | 3 | 5 | 10)}
                    >
                      <Text style={[styles.segmentButtonText, { 
                        color: reminderLimit === opt.value ? colors.primary : colors.muted 
                      }]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.settingItemDesc, { color: colors.muted, marginTop: spacing.md, fontSize: 11 }]}>
                  {t('settings:current_limit', { 
                    defaultValue: 'Mevcut: {{frequency}} {{limit}} kez',
                    frequency: reminderFrequency === 'day' ? t('settings:per_day', { defaultValue: 'günde' }) : t('settings:per_week', { defaultValue: 'haftada' }),
                    limit: reminderLimit
                  })}
                </Text>
              </View>
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
          </>
        )}

        {/* Product-Based Notification Settings - Coming Soon */}
        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>{t('settings:product_based_notifications', { defaultValue: 'Ürün Bazlı Bildirim Ayarları' })}</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="cube-outline" size={24} color={colors.muted} />
                <View style={styles.settingItemContent}>
                  <Text style={[styles.settingItemTitle, { color: colors.text }]}>
                    {t('settings:product_based_notifications', { defaultValue: 'Ürün Bazlı Bildirim Ayarları' })}
                  </Text>
                  <Text style={[styles.settingItemDesc, { color: colors.muted }]}>
                    {t('settings:product_based_notifications_desc', { defaultValue: 'Her ürün için özel bildirim ayarlarını yapılandırın' })}
                  </Text>
                </View>
              </View>
              <View style={styles.comingSoonBadge}>
                <Text style={[styles.comingSoonText, { color: colors.muted }]}>
                  {t('settings:coming_soon', { defaultValue: 'Yakında gelecek' })}
                </Text>
              </View>
            </View>
            <View style={[styles.comingSoonMessage, { backgroundColor: colors.page }]}>
              <Ionicons name="time-outline" size={16} color={colors.muted} />
              <Text style={[styles.comingSoonDesc, { color: colors.muted }]}>
                {t('settings:coming_soon_desc', { defaultValue: 'Bu özellik yakında eklenecektir' })}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
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
    marginBottom: spacing.sm,
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
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  settingItemDesc: {
    fontSize: 12,
    lineHeight: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: colors.surface,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    marginTop: spacing.md,
  },
  comingSoonBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  comingSoonMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  comingSoonDesc: {
    fontSize: 12,
    flex: 1,
  },
});

