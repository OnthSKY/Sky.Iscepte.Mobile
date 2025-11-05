import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useLowStockAlertStore } from '../store/lowStockAlertStore';
import { useProductsQuery } from '../../modules/products/hooks/useProductsQuery';
import { Product } from '../../modules/products/services/productService';
import notificationService from '../../shared/services/notificationService';
import { useTranslation } from 'react-i18next';
import * as PushNotifications from '../services/pushNotificationService';
import { canSendReminder, recordReminderSent, canSendBatchReminder, recordBatchReminderSent } from '../utils/reminderUtils';

/**
 * Hook to monitor low stock and show notifications
 * Checks products when data changes and notifies if any product is below threshold
 */
export function useLowStockAlert() {
  const { t } = useTranslation(['stock', 'common']);
  const { threshold, enabled, reminderFrequency, reminderLimit, batchMode } = useLowStockAlertStore();
  const { data: productsData } = useProductsQuery();
  const notifiedProducts = useRef<Set<string>>(new Set());
  const lastCheckTime = useRef<number>(0);
  const isRegistered = useRef<boolean>(false);

  // Bildirim izinlerini kaydet (sadece bir kez)
  useEffect(() => {
    if (!isRegistered.current && enabled) {
      PushNotifications.registerForPushNotificationsAsync()
        .then(() => {
          isRegistered.current = true;
        })
        .catch(err => {
          console.warn('Failed to register push notifications:', err);
        });
    }
  }, [enabled]);

  useEffect(() => {
    // Skip if alerts are disabled
    if (!enabled || threshold < 0) {
      return;
    }

    // Skip if no products data
    if (!productsData?.items || productsData.items.length === 0) {
      return;
    }

    const now = Date.now();
    // Throttle checks to avoid too many notifications
    // Only check every 5 seconds
    if (now - lastCheckTime.current < 5000) {
      return;
    }
    lastCheckTime.current = now;

    // Async işlemi bir fonksiyon içinde yap
    (async () => {
      // Find products with low stock
      const lowStockProducts: Product[] = productsData.items.filter(
        (product: Product) => {
          const stock = product.stock ?? 0;
          return stock > 0 && stock <= threshold;
        }
      );

      // Eğer düşük stoklu ürün yoksa çık
      if (lowStockProducts.length === 0) {
        return;
      }

      // Toplu bildirim modu aktifse ve birden fazla ürün varsa
      if (batchMode && lowStockProducts.length > 1) {
        // Toplu bildirim için kontrol et
        const canSendBatch = await canSendBatchReminder(reminderFrequency, reminderLimit);
        
        if (canSendBatch) {
          // Şu anda bildirilmiş ürünleri filtrele (yeni ürünler için)
          const newLowStockProducts = lowStockProducts.filter(
            (product) => !notifiedProducts.current.has(String(product.id))
          );

          // Eğer yeni düşük stoklu ürün varsa toplu bildirim gönder
          if (newLowStockProducts.length > 0) {
            // Toplu bildirim mesajını oluştur
            const productCount = newLowStockProducts.length;
            const displayCount = Math.min(productCount, 5);
            const displayedProducts = newLowStockProducts.slice(0, displayCount);
            const productNames = displayedProducts
              .map(p => {
                const stock = p.stock ?? 0;
                return `${p.name} (${stock})`;
              })
              .join(', ');

            let message = '';
            if (productCount === 1) {
              const product = newLowStockProducts[0];
              const stock = product.stock ?? 0;
              message = t('stock:low_stock_alert_message', {
                defaultValue: '{{productName}} ürününde düşük stok: {{stock}} (Eşik: {{threshold}})',
                productName: product.name,
                stock,
                threshold,
              });
            } else if (productCount > 5) {
              message = t('stock:low_stock_batch_alert_message_with_more', {
                defaultValue: '{{products}} ve {{remaining}} ürün daha (Eşik: {{threshold}})',
                products: productNames,
                remaining: productCount - 5,
                threshold,
              });
            } else {
              message = t('stock:low_stock_batch_alert_message', {
                defaultValue: '{{products}} (Eşik: {{threshold}})',
                products: productNames,
                threshold,
              });
            }

            // Uygulama açıkken toast göster
            const appState = AppState.currentState;
            if (appState === 'active') {
              notificationService.warning(message, {
                priority: 10,
                duration: undefined, // Süresiz - kullanıcı kapatana kadar açık kalacak
              });
            }

            // Arka plan toplu bildirimi gönder
            PushNotifications.scheduleBatchLowStockNotification(newLowStockProducts, threshold)
              .catch(err => {
                console.warn('Failed to schedule batch push notification:', err);
              });

            // Toplu bildirim gönderildiğini kaydet
            await recordBatchReminderSent(reminderFrequency);

            // Tüm ürünleri bildirilmiş olarak işaretle
            newLowStockProducts.forEach(product => {
              notifiedProducts.current.add(String(product.id));
            });
          }
        }
      } else {
        // Tekli bildirim modu veya tek ürün varsa (eski davranış)
        Promise.all(
          lowStockProducts.map(async (product) => {
            const productId = String(product.id);
            const stock = product.stock ?? 0;

            // Check if already shown in current check cycle (to avoid duplicate notifications)
            if (notifiedProducts.current.has(productId)) {
              return;
            }

            // Check if we can send reminder based on frequency and limit
            const canSend = await canSendReminder(productId, reminderFrequency, reminderLimit);
            
            if (!canSend) {
              return; // Skip if limit reached for this period
            }

            const message = t('stock:low_stock_alert_message', {
              defaultValue: '{{productName}} ürününde düşük stok: {{stock}} (Eşik: {{threshold}})',
              productName: product.name,
              stock,
              threshold,
            });

            // Uygulama açıkken toast göster
            const appState = AppState.currentState;
            if (appState === 'active') {
              notificationService.warning(message, {
                priority: 10,
                duration: undefined, // Süresiz - kullanıcı kapatana kadar açık kalacak
              });
            }

            // Arka plan bildirimi gönder (uygulama kapalıyken de çalışır)
            PushNotifications.scheduleLowStockNotification(product, stock, threshold)
              .catch(err => {
                console.warn('Failed to schedule push notification:', err);
              });

            // Record that reminder was sent
            await recordReminderSent(productId, reminderFrequency);

            // Mark as notified in current check cycle (prevents multiple notifications in same check)
            notifiedProducts.current.add(productId);
          })
        ).catch(err => {
          console.warn('Error processing low stock alerts:', err);
        });
      }
    })();
  }, [productsData, threshold, enabled, reminderFrequency, reminderLimit, batchMode, t]);

  // Clear notified products when threshold or reminder settings change
  useEffect(() => {
    notifiedProducts.current.clear();
  }, [threshold, reminderFrequency, reminderLimit, batchMode]);
}

/**
 * Hook to get low stock products list
 */
export function useLowStockProducts() {
  const { threshold, enabled } = useLowStockAlertStore();
  const { data: productsData, isLoading, error } = useProductsQuery();

  const lowStockProducts = enabled
    ? productsData?.items?.filter(
        (product: Product) => {
          const stock = product.stock ?? 0;
          return stock > 0 && stock <= threshold;
        }
      ) || []
    : [];

  return {
    lowStockProducts,
    isLoading,
    error,
    threshold,
    enabled,
  };
}

