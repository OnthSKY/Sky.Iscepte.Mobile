/**
 * Error Report Modal
 * Allows users to report errors to admins/owners based on error category
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../core/contexts/ThemeContext';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { ErrorCategory } from '../services/notificationService';
import spacing from '../../core/constants/spacing';
import { useAppStore } from '../../store/useAppStore';
import { Role } from '../../core/config/appConstants';
import notificationService from '../services/notificationService';
import errorReportService from '../services/errorReportService';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  visible: boolean;
  onClose: () => void;
  errorCategory: ErrorCategory;
  errorMessage: string;
  errorDetails?: any;
  context?: string;
  mode?: 'error' | 'contact'; // 'error' for error reports, 'contact' for general contact
};

export default function ErrorReportModal({
  visible,
  onClose,
  errorCategory,
  errorMessage,
  errorDetails,
  context,
  mode = 'error',
}: Props) {
  const { t } = useTranslation('common');
  const { colors } = useTheme();
  const role = useAppStore((s) => s.role);
  const user = useAppStore((s) => s.user);
  
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine target based on error category or mode
  const target = useMemo(() => {
    if (mode === 'contact') {
      // For contact form, always send to admin
      return { role: Role.ADMIN, label: t('errors:categories.admin', { defaultValue: 'Admin' }) };
    }
    if (errorCategory === 'api' || errorCategory === 'system') {
      return { role: Role.ADMIN, label: t('errors:categories.admin', { defaultValue: 'Admin' }) };
    }
    if (errorCategory === 'permission') {
      return { role: Role.OWNER, label: t('errors:categories.owner', { defaultValue: 'Owner' }) };
    }
    return { role: Role.ADMIN, label: t('errors:categories.admin', { defaultValue: 'Admin' }) };
  }, [errorCategory, mode, t]);

  // Collect automatic error details
  const autoDetails = useMemo(() => {
    const details: any = {
      message: errorMessage,
      category: errorCategory,
      context: context || 'unknown',
      timestamp: new Date().toISOString(),
      userRole: role,
      userId: user?.id,
      userEmail: user?.email,
      errorDetails: errorDetails || {},
    };

    // Add API error details if available
    if (errorDetails) {
      if (errorDetails.status) details.status = errorDetails.status;
      if (errorDetails.code) details.code = errorDetails.code;
      if (errorDetails.url) details.url = errorDetails.url;
      if (errorDetails.method) details.method = errorDetails.method;
      if (errorDetails.stack) details.stack = errorDetails.stack;
    }

    return details;
  }, [errorMessage, errorCategory, context, errorDetails, role, user]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      notificationService.validationError(
        t('errors:validation.required', { defaultValue: 'Açıklama gereklidir' })
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await errorReportService.submitErrorReport({
        category: errorCategory,
        message: errorMessage,
        description: description.trim(),
        targetRole: target.role,
        autoDetails,
      });

      notificationService.success(
        t('error_report_sent', { defaultValue: 'Hata bildirimi gönderildi' })
      );
      
      setDescription('');
      onClose();
    } catch (error: any) {
      notificationService.error(
        error?.message || t('error_report_failed', { defaultValue: 'Hata bildirimi gönderilemedi' })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    onClose();
  };

  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <Modal visible={visible} onRequestClose={handleClose}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons 
            name={mode === 'contact' ? 'mail-outline' : 'alert-circle-outline'} 
            size={32} 
            color={mode === 'contact' ? colors.primary : colors.error} 
          />
          <Text style={[styles.title, { color: colors.text }]}>
            {mode === 'contact' 
              ? t('contact_us', { defaultValue: 'Bizimle İletişime Geç' })
              : t('report_error', { defaultValue: 'Hata Bildir' })
            }
          </Text>
        </View>

        {mode === 'error' && (
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>
                {t('error_category', { defaultValue: 'Hata Kategorisi' })}:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {t(`errors:categories.${errorCategory}`, { defaultValue: errorCategory })}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>
                {t('report_to', { defaultValue: 'Bildirilecek Kişi' })}:
              </Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                {target.label}
              </Text>
            </View>

            <View style={styles.errorMessageContainer}>
              <Text style={[styles.errorMessageLabel, { color: colors.muted }]}>
                {t('error_message', { defaultValue: 'Hata Mesajı' })}:
              </Text>
              <Text style={[styles.errorMessage, { color: colors.text }]}>
                {errorMessage}
              </Text>
            </View>
          </View>
        )}

        {mode === 'contact' && (
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>
                {t('report_to', { defaultValue: 'Bildirilecek Kişi' })}:
              </Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                {target.label}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('description', { defaultValue: 'Açıklama' })} *
          </Text>
          <Text style={[styles.hint, { color: colors.muted }]}>
            {mode === 'contact'
              ? t('contact_description_hint', {
                  defaultValue: 'Sorularınız, önerileriniz, sorunlarınız veya geri bildirimleriniz için mesajınızı yazın.',
                })
              : t('error_description_hint', {
                  defaultValue: 'Lütfen hatanın nasıl oluştuğunu ve neler yaptığınızı açıklayın. Teknik detaylar otomatik olarak eklenir.',
                })
            }
          </Text>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder={mode === 'contact'
              ? t('contact_description_placeholder', {
                  defaultValue: 'Mesajınızı yazın...',
                })
              : t('error_description_placeholder', {
                  defaultValue: 'Hata hakkında açıklama yazın...',
                })
            }
            multiline
            numberOfLines={5}
            style={styles.textArea}
          />
        </View>

        {mode === 'error' && (
          <View style={styles.autoDetailsSection}>
            <Text style={[styles.autoDetailsLabel, { color: colors.muted }]}>
              {t('auto_details_note', {
                defaultValue: 'Aşağıdaki teknik detaylar otomatik olarak eklenir:',
              })}
            </Text>
            <View style={styles.autoDetailsList}>
              <Text style={[styles.autoDetailsItem, { color: colors.muted }]}>
                • {t('error_category', { defaultValue: 'Hata kategorisi' })}
              </Text>
              <Text style={[styles.autoDetailsItem, { color: colors.muted }]}>
                • {t('error_context', { defaultValue: 'Hata konteksti' })}
              </Text>
              <Text style={[styles.autoDetailsItem, { color: colors.muted }]}>
                • {t('timestamp', { defaultValue: 'Zaman damgası' })}
              </Text>
              <Text style={[styles.autoDetailsItem, { color: colors.muted }]}>
                • {t('user_info', { defaultValue: 'Kullanıcı bilgileri' })}
              </Text>
              {errorDetails?.status && (
                <Text style={[styles.autoDetailsItem, { color: colors.muted }]}>
                  • {t('api_status', { defaultValue: 'API durum kodu' })}
                </Text>
              )}
              {errorDetails?.code && (
                <Text style={[styles.autoDetailsItem, { color: colors.muted }]}>
                  • {t('error_code', { defaultValue: 'Hata kodu' })}
                </Text>
              )}
            </View>
          </View>
        )}

        {mode === 'contact' && (
          <View style={styles.autoDetailsSection}>
            <Text style={[styles.autoDetailsLabel, { color: colors.muted }]}>
              {t('auto_details_note_contact', {
                defaultValue: 'Aşağıdaki bilgiler otomatik olarak eklenir:',
              })}
            </Text>
            <View style={styles.autoDetailsList}>
              <Text style={[styles.autoDetailsItem, { color: colors.muted }]}>
                • {t('timestamp', { defaultValue: 'Zaman damgası' })}
              </Text>
              <Text style={[styles.autoDetailsItem, { color: colors.muted }]}>
                • {t('user_info', { defaultValue: 'Kullanıcı bilgileri' })}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title={t('cancel', { defaultValue: 'İptal' })}
            onPress={handleClose}
            style={[styles.button, { backgroundColor: colors.muted }]}
            disabled={isSubmitting}
          />
          <Button
            title={mode === 'contact'
              ? t('send_message', { defaultValue: 'Gönder' })
              : t('send_report', { defaultValue: 'Bildir' })
            }
            onPress={handleSubmit}
            style={styles.button}
            loading={isSubmitting}
            disabled={isSubmitting || !description.trim()}
          />
        </View>
      </ScrollView>
    </Modal>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      maxHeight: '90%',
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
    },
    infoSection: {
      marginBottom: spacing.lg,
      gap: spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    errorMessageContainer: {
      marginTop: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 8,
    },
    errorMessageLabel: {
      fontSize: 12,
      fontWeight: '500',
      marginBottom: spacing.xs,
    },
    errorMessage: {
      fontSize: 14,
    },
    formSection: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    hint: {
      fontSize: 12,
      marginBottom: spacing.sm,
      lineHeight: 16,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    autoDetailsSection: {
      marginBottom: spacing.lg,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 8,
    },
    autoDetailsLabel: {
      fontSize: 12,
      fontWeight: '500',
      marginBottom: spacing.sm,
    },
    autoDetailsList: {
      gap: spacing.xs,
    },
    autoDetailsItem: {
      fontSize: 11,
      lineHeight: 16,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    button: {
      flex: 1,
    },
  });

