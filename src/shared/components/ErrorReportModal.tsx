/**
 * Error Report Modal
 * Allows users to report errors to admins/owners based on error category
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../core/contexts/ThemeContext';
import Modal from './Modal';
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
  const [isFocused, setIsFocused] = useState(false);

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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: mode === 'contact' ? `${colors.primary}15` : `${colors.error}15` }]}>
            <Ionicons 
              name={mode === 'contact' ? 'mail' : 'alert-circle'} 
              size={28} 
              color={mode === 'contact' ? colors.primary : colors.error} 
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {mode === 'contact' 
              ? t('contact_us', { defaultValue: 'Bizimle İletişime Geç' })
              : t('report_error', { defaultValue: 'Hata Bildir' })
            }
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {mode === 'contact'
              ? t('contact_subtitle', { defaultValue: 'Mesajınızı paylaşın, size yardımcı olalım' })
              : t('error_subtitle', { defaultValue: 'Hatayı bildirin, çözüme kavuşturalım' })
            }
          </Text>
        </View>

        {mode === 'error' && (
          <View style={styles.infoSection}>
            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Ionicons name="folder-outline" size={20} color={colors.muted} />
                  <Text style={[styles.infoLabel, { color: colors.muted }]}>
                    {t('error_category', { defaultValue: 'Hata Kategorisi' })}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: `${colors.muted}15` }]}>
                  <Text style={[styles.badgeText, { color: colors.text }]}>
                    {t(`errors:categories.${errorCategory}`, { defaultValue: errorCategory })}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoRow, { marginTop: spacing.sm }]}>
                <View style={styles.infoRowLeft}>
                  <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
                  <Text style={[styles.infoLabel, { color: colors.muted }]}>
                    {t('report_to', { defaultValue: 'Bildirilecek' })}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: `${colors.primary}15` }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    {target.label}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.errorMessageContainer, { borderColor: colors.border }]}>
              <View style={styles.infoRowLeft}>
                <Ionicons name="information-circle-outline" size={18} color={colors.muted} />
                <Text style={[styles.errorMessageLabel, { color: colors.muted }]}>
                  {t('error_message', { defaultValue: 'Hata Mesajı' })}
                </Text>
              </View>
              <Text style={[styles.errorMessage, { color: colors.text, marginTop: spacing.xs }]}>
                {errorMessage}
              </Text>
            </View>
          </View>
        )}

        {mode === 'contact' && (
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
                <Text style={[styles.infoLabel, { color: colors.muted }]}>
                  {t('report_to', { defaultValue: 'Mesajınız iletilecek' })}:
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: `${colors.primary}15` }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {target.label}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.formSection}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('description', { defaultValue: 'Mesajınız' })}
            </Text>
            <View style={[styles.requiredBadge, { backgroundColor: `${colors.error}15` }]}>
              <Text style={[styles.requiredText, { color: colors.error }]}>Zorunlu</Text>
            </View>
          </View>
          <Text style={[styles.hint, { color: colors.muted }]}>
            {mode === 'contact'
              ? t('contact_description_hint', {
                  defaultValue: 'Sorularınız, önerileriniz veya sorunlarınızı detaylıca paylaşın.',
                })
              : t('error_description_hint', {
                  defaultValue: 'Hatanın nasıl oluştuğunu ve neler yaptığınızı detaylıca açıklayın.',
                })
            }
          </Text>
          <View style={[
            styles.textAreaContainer,
            isFocused && styles.textAreaContainerFocused,
            { 
              borderColor: isFocused ? colors.primary : colors.border,
              backgroundColor: colors.surface,
            }
          ]}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={mode === 'contact'
                ? t('contact_description_placeholder', {
                    defaultValue: 'Mesajınızı buraya yazın...',
                  })
                : t('error_description_placeholder', {
                    defaultValue: 'Açıklamanızı buraya yazın...',
                  })
              }
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={6}
              style={[styles.textArea, { color: colors.text }]}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              textAlignVertical="top"
            />
          </View>
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
      maxHeight: '85vh',
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      gap: spacing.md,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    infoSection: {
      marginBottom: spacing.lg,
      gap: spacing.md,
    },
    infoCard: {
      padding: spacing.md,
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    infoRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    badge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    errorMessageContainer: {
      marginTop: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    errorMessageLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    errorMessage: {
      fontSize: 14,
      lineHeight: 20,
    },
    formSection: {
      marginBottom: spacing.xl,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
    },
    requiredBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
    },
    requiredText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    hint: {
      fontSize: 13,
      marginBottom: spacing.md,
      lineHeight: 18,
      fontWeight: '400',
    },
    textAreaContainer: {
      borderRadius: 16,
      borderWidth: 2,
      minHeight: 160,
      padding: spacing.md,
      ...Platform.select({
        web: {
          transition: 'all 0.2s ease',
        },
      }),
    },
    textAreaContainerFocused: {
      ...Platform.select({
        web: {
          boxShadow: `0px 0px 0px 4px ${colors.primary}20`,
        },
        default: {
          shadowColor: colors.primary,
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        },
      }),
    },
    textArea: {
      fontSize: 16,
      lineHeight: 24,
      minHeight: 140,
      padding: 0,
    },
    autoDetailsSection: {
      marginBottom: spacing.lg,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    autoDetailsLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    autoDetailsList: {
      gap: spacing.xs,
    },
    autoDetailsItem: {
      fontSize: 12,
      lineHeight: 18,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.lg,
      paddingTop: spacing.md,
    },
    button: {
      flex: 1,
    },
  });

