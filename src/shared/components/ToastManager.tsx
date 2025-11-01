import React, { useState, useEffect } from 'react';
import { Snackbar } from 'react-native-paper';
import { useTheme } from '../../core/contexts/ThemeContext';
import notificationService, { NotificationEvent, NotificationType } from '../services/notificationService';

/**
 * Merkezi Toast Yönetim Bileşeni
 * Tüm toast bildirimlerini queue sistemi ile yönetir
 */
export default function ToastManager() {
  const { colors } = useTheme();
  const [currentToast, setCurrentToast] = useState<NotificationEvent | null>(null);
  const [visible, setVisible] = useState(false);

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

  return (
    <Snackbar
      visible={visible}
      onDismiss={handleDismiss}
      duration={currentToast.duration || 3000}
      style={{ backgroundColor: getBackgroundColor(currentToast.type) }}
      action={{
        label: 'Tamam',
        onPress: handleDismiss,
        textColor: '#fff',
      }}
    >
      {currentToast.message}
    </Snackbar>
  );
}

