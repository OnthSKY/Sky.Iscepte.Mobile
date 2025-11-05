import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useSalesQuery } from '../../modules/sales/hooks/useSalesQuery';
import { Sale } from '../../modules/sales/services/salesService';
import notificationService from '../../shared/services/notificationService';
import { useTranslation } from 'react-i18next';
import * as PushNotifications from '../services/pushNotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook to monitor debt collection dates and show notifications
 * Checks sales with debtCollectionDate when data changes and notifies when dates are approaching
 */
export function useDebtCollectionAlert() {
  const { t } = useTranslation(['sales', 'common']);
  const { data: salesData } = useSalesQuery();
  const notifiedSales = useRef<Set<string>>(new Set());
  const lastCheckTime = useRef<number>(0);
  const isRegistered = useRef<boolean>(false);

  // Bildirim izinlerini kaydet (sadece bir kez)
  useEffect(() => {
    if (!isRegistered.current) {
      PushNotifications.registerForPushNotificationsAsync()
        .then(() => {
          isRegistered.current = true;
        })
        .catch(err => {
          console.warn('Failed to register push notifications:', err);
        });
    }
  }, []);

  useEffect(() => {
    // Skip if no sales data
    if (!salesData?.items || salesData.items.length === 0) {
      return;
    }

    const checkInterval = 5 * 60 * 1000; // 5 dakikada bir kontrol et
    const now = Date.now();

    // Throttle checks to avoid excessive processing
    if (now - lastCheckTime.current < checkInterval) {
      return;
    }

    lastCheckTime.current = now;

    const checkDebtCollectionDates = async () => {
      try {
        // Find sales with debtCollectionDate
        const salesWithDebt = salesData.items.filter(
          (sale: Sale) => sale.debtCollectionDate && sale.customerId
        );

        if (salesWithDebt.length === 0) {
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check each sale with debt collection date
        for (const sale of salesWithDebt) {
          if (!sale.debtCollectionDate) continue;

          const saleId = String(sale.id);
          
          // Check if already notified in current check cycle
          if (notifiedSales.current.has(saleId)) {
            continue;
          }

          // Parse debt collection date (handle YYYY-MM-DD format or date with time)
          const dateStr = sale.debtCollectionDate.split(' ')[0]; // Get date part only (YYYY-MM-DD)
          const debtDate = new Date(dateStr);
          
          // Check if date is valid
          if (isNaN(debtDate.getTime())) {
            console.warn(`Invalid debt collection date for sale ${sale.id}:`, sale.debtCollectionDate);
            continue;
          }
          
          debtDate.setHours(0, 0, 0, 0);

          // Calculate days until debt collection date
          const diffTime = debtDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Check if we should notify (within 3 days before, on the day, or overdue)
          const shouldNotify = diffDays <= 3 && diffDays >= -7; // 3 gün öncesinden 7 gün sonrasına kadar

          if (!shouldNotify) {
            continue;
          }

          // Check if we've already notified for this sale recently (avoid spam)
          const lastNotificationKey = `debt_collection_notified_${saleId}`;
          const lastNotificationTime = await AsyncStorage.getItem(lastNotificationKey);
          
          if (lastNotificationTime) {
            const lastTime = parseInt(lastNotificationTime, 10);
            const hoursSinceLastNotification = (now - lastTime) / (1000 * 60 * 60);
            
            // Don't notify more than once per day for the same sale
            if (hoursSinceLastNotification < 24) {
              continue;
            }
          }

          const customerName = sale.customerName || 'Müşteri';
          const amount = sale.total || sale.amount || 0;
          const currency = sale.currency || 'TRY';

          let message = '';
          if (diffDays === 0) {
            message = t('sales:debt_collection_today', {
              customerName,
            });
          } else if (diffDays < 0) {
            message = t('sales:debt_collection_overdue', {
              customerName,
            });
          } else {
            message = t('sales:debt_collection_approaching', {
              customerName,
            });
          }

          message += ` (${t('sales:debt_collection_amount', { amount, currency })})`;

          // Uygulama açıkken toast göster
          const appState = AppState.currentState;
          if (appState === 'active') {
            notificationService.warning(message, {
              priority: 10,
              duration: undefined, // Süresiz - kullanıcı kapatana kadar açık kalacak
            });
          }

          // Arka plan bildirimi gönder (uygulama kapalıyken de çalışır)
          PushNotifications.scheduleDebtCollectionNotification(sale, diffDays)
            .catch(err => {
              console.warn('Failed to schedule push notification:', err);
            });

          // Record that notification was sent
          await AsyncStorage.setItem(lastNotificationKey, String(now));

          // Mark as notified in current check cycle
          notifiedSales.current.add(saleId);
        }

        // Reset notified sales set periodically (every hour)
        if (now % (60 * 60 * 1000) < checkInterval) {
          notifiedSales.current.clear();
        }
      } catch (error) {
        console.warn('Error processing debt collection alerts:', error);
      }
    };

    checkDebtCollectionDates();
  }, [salesData, t]);

  // Clear notified sales when app state changes to active
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // Reset notified sales when app becomes active to allow re-checking
        notifiedSales.current.clear();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
}

