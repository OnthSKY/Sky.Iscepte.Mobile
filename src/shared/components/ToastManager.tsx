import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, ActivityIndicator } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../core/contexts/ThemeContext';
import notificationService, { NotificationEvent, NotificationType, ErrorCategory } from '../services/notificationService';
import { useTranslation } from 'react-i18next';
import ErrorReportModal from './ErrorReportModal';
import spacing from '../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../../store/useAppStore';

/**
 * Merkezi Toast Yönetim Bileşeni
 * Tüm toast bildirimlerini queue sistemi ile yönetir
 */
export default function ToastManager() {
  const { colors, activeTheme } = useTheme();
  const { t } = useTranslation('common');
  const [currentToast, setCurrentToast] = useState<NotificationEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [errorReportVisible, setErrorReportVisible] = useState(false);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((event: NotificationEvent) => {
      setCurrentToast(event);
      setVisible(true);
    });

    return unsubscribe;
  }, []);

  // Login ekranına geçildiğinde (isAuthenticated false olduğunda) toast'ı temizle
  useEffect(() => {
    if (!isAuthenticated && currentToast?.isCenter) {
      setVisible(false);
      notificationService.onToastDismissed();
    }
  }, [isAuthenticated, currentToast?.isCenter]);

  const handleDismiss = () => {
    setVisible(false);
    // Toast gizlendiğinde sonraki toast'ı işle
    notificationService.onToastDismissed();
  };

  const handleReportError = () => {
    setVisible(false);
    setErrorReportVisible(true);
  };

  const handleCloseReport = () => {
    setErrorReportVisible(false);
    // Toast'ı da kapat
    handleDismiss();
  };

  if (!currentToast) {
    return null;
  }

  const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'warning':
        // Warning için gradient kullanacağız, bu sadece fallback
        return '#F59E0B';
      case 'info':
      default:
        return colors.primary;
    }
  };

  const getWarningGradientColors = (isDark: boolean) => {
    // Turuncu/sarı tonlarında gradient
    return isDark 
      ? ['#D97706', '#F59E0B', '#FBBF24'] // Koyu tema için daha koyu turuncu
      : ['#F59E0B', '#FBBF24', '#FCD34D']; // Açık tema için daha parlak turuncu
  };

  const isWarning = currentToast.type === 'warning';
  const isDismissible = isWarning; // Warning tipi için manuel kapatma
  const isCenter = currentToast.isCenter; // Ekran ortasında gösterilecek toast

  // Show "Report Error" button only for error toasts with reportable categories
  const isReportableError = currentToast.type === 'error' && 
    currentToast.category && 
    ['api', 'system', 'permission'].includes(currentToast.category);

  // Ekran ortasında gösterilecek toast
  if (isCenter) {
    // Warning tipi için özel gradient tasarımı (çıkış yapmak istiyor musunuz gibi)
    if (isWarning) {
      const isDark = activeTheme === 'dark';
      const warningGradient = getWarningGradientColors(isDark);
      
      return (
        <Modal
          visible={visible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleDismiss}
        >
          <View style={styles.centerToastOverlay}>
            <LinearGradient
              colors={warningGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.centerWarningToast}
            >
              <View style={styles.centerWarningContent}>
                <Ionicons name="warning" size={32} color="#FFFFFF" style={styles.centerWarningIcon} />
                <Text style={styles.centerWarningText}>
                  {currentToast.message}
                </Text>
              </View>
              {currentToast.onAction ? (
                <TouchableOpacity
                  onPress={() => {
                    handleDismiss();
                    currentToast.onAction?.();
                  }}
                  style={styles.centerWarningActionButton}
                >
                  <Text style={styles.centerWarningActionText}>
                    {currentToast.actionText || t('ok', { defaultValue: 'Tamam' })}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleDismiss}
                  style={styles.centerWarningActionButton}
                >
                  <Text style={styles.centerWarningActionText}>
                    {t('ok', { defaultValue: 'Tamam' })}
                  </Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        </Modal>
      );
    }
    
    // Info tipi için normal center toast (çıkış yapılıyor gibi)
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDismiss}
      >
        <View style={styles.centerToastOverlay}>
          <View style={[styles.centerToastContainer, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: spacing.md }} />
            <Text style={[styles.centerToastText, { color: colors.text }]}>
              {currentToast.message}
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  // Warning tipi için özel gradient toast (altta)
  if (isWarning) {
    const isDark = activeTheme === 'dark';
    const warningGradient = getWarningGradientColors(isDark);

    return (
      <>
        {visible && (
          <View style={styles.warningToastContainer}>
            <LinearGradient
              colors={warningGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.warningToast}
            >
              <View style={styles.warningContent}>
                <Ionicons name="warning" size={24} color="#FFFFFF" style={styles.warningIcon} />
                <Text style={styles.warningText} numberOfLines={3}>
                  {currentToast.message}
                </Text>
                <TouchableOpacity
                  onPress={handleDismiss}
                  style={styles.warningCloseButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {currentToast.onAction ? (
                <TouchableOpacity
                  onPress={() => {
                    handleDismiss();
                    currentToast.onAction?.();
                  }}
                  style={styles.warningActionButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.warningActionText}>
                    {currentToast.actionText || t('ok', { defaultValue: 'Tamam' })}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleDismiss}
                  style={styles.warningActionButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.warningActionText}>
                    {t('ok', { defaultValue: 'Tamam' })}
                  </Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        )}

        {isReportableError && currentToast.category && (
          <ErrorReportModal
            visible={errorReportVisible}
            onClose={handleCloseReport}
            errorCategory={currentToast.category as ErrorCategory}
            errorMessage={currentToast.message}
            errorDetails={currentToast.details}
            context={currentToast.id}
          />
        )}
      </>
    );
  }

  // Normal toast (error, success, info)
  return (
    <>
      <Snackbar
        visible={visible}
        onDismiss={isDismissible ? undefined : handleDismiss}
        duration={isDismissible ? undefined : (currentToast.duration || 4000)}
        style={{ backgroundColor: getBackgroundColor(currentToast.type) }}
        action={
          isReportableError
            ? {
                label: t('report_error', { defaultValue: 'Talep İlet' }),
                onPress: handleReportError,
                textColor: '#fff',
              }
            : isDismissible
            ? undefined // Warning için action zaten özel component'te
            : {
                label: t('thanks', { defaultValue: 'Teşekkürler' }),
                onPress: handleDismiss,
                textColor: '#fff',
              }
        }
      >
        {currentToast.message}
      </Snackbar>

      {isReportableError && currentToast.category && (
        <ErrorReportModal
          visible={errorReportVisible}
          onClose={handleCloseReport}
          errorCategory={currentToast.category as ErrorCategory}
          errorMessage={currentToast.message}
          errorDetails={currentToast.details}
          context={currentToast.id}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  warningToastContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  warningToast: {
    borderRadius: 12,
    padding: spacing.md,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  warningIcon: {
    marginRight: spacing.sm,
  },
  warningText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  warningCloseButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  warningActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  warningActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  centerToastOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerToastContainer: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 200,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  centerToastText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  centerWarningToast: {
    borderRadius: 16,
    padding: spacing.xl,
    minWidth: 280,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  centerWarningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  centerWarningIcon: {
    marginRight: spacing.md,
  },
  centerWarningText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  centerWarningActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  centerWarningActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

