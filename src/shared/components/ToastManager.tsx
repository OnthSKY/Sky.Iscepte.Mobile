import React, { useState, useEffect } from 'react';
import { Snackbar } from 'react-native-paper';
import { useTheme } from '../../core/contexts/ThemeContext';
import notificationService, { NotificationEvent, NotificationType, ErrorCategory } from '../services/notificationService';
import { useTranslation } from 'react-i18next';
import ErrorReportModal from './ErrorReportModal';

/**
 * Merkezi Toast Yönetim Bileşeni
 * Tüm toast bildirimlerini queue sistemi ile yönetir
 */
export default function ToastManager() {
  const { colors } = useTheme();
  const { t } = useTranslation('common');
  const [currentToast, setCurrentToast] = useState<NotificationEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [errorReportVisible, setErrorReportVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((event: NotificationEvent) => {
      setCurrentToast(event);
      setVisible(true);
    });

    return unsubscribe;
  }, []);

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
      case 'info':
      default:
        return colors.primary;
    }
  };

  // Show "Report Error" button only for error toasts with reportable categories
  const isReportableError = currentToast.type === 'error' && 
    currentToast.category && 
    ['api', 'system', 'permission'].includes(currentToast.category);

  return (
    <>
      <Snackbar
        visible={visible}
        onDismiss={handleDismiss}
        duration={currentToast.duration || 3000}
        style={{ backgroundColor: getBackgroundColor(currentToast.type) }}
        action={
          isReportableError
            ? {
                label: t('report_error', { defaultValue: 'Talep İlet' }),
                onPress: handleReportError,
                textColor: '#fff',
              }
            : {
                label: t('confirm', { defaultValue: 'OK' }),
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

