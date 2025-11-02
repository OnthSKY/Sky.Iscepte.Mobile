import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Product } from '../../modules/products/services/productService';

/**
 * Push Notification Service
 * Handles background notifications for low stock alerts
 */

// Bildirim davranışını yapılandır (sadece mobil platformlarda)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      // Bildirim içeriğini log'la
      console.log('Notification handler called:', {
        title: notification.request.content.title,
        body: notification.request.content.body,
      });
      
      return {
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    },
  });
}

/**
 * Bildirim izinlerini kontrol et ve iste
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  try {
    // Web platform için push notifications desteklenmiyor
    if (Platform.OS === 'web') {
      return null;
    }

    // Android için notification channel oluştur
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('low-stock-alerts', {
        name: 'Düşük Stok Uyarıları',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9500',
        sound: 'default',
      });
    }

    // Push notification izinlerini kontrol et ve iste
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }

    // Expo project ID'yi bul
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                     Constants.expoConfig?.extra?.projectId ||
                     Constants.easConfig?.project?.projectId;
    
    // Project ID yoksa, Expo Go'da çalışıyoruz demektir
    // In Expo Go, push notifications don't work properly without a project ID
    if (!projectId) {
      console.log('Expo project ID not found. Skipping push notification registration (expected in Expo Go).');
      return null;
    }
    
    // Push token al
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    })).data;

    // Token'ı sakla
    if (token) {
      await AsyncStorage.setItem('expo_push_token', token);
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Düşük stok için arka plan bildirimi gönder
 */
export async function scheduleLowStockNotification(product: Product, stock: number, threshold: number): Promise<void> {
  try {
    // Bildirim içeriğini hazırla
    const title = 'Düşük Stok Uyarısı';
    const body = `${product.name} ürününde düşük stok: ${stock} (Eşik: ${threshold})`;
    
    // Title ve body'nin dolu olduğundan emin ol
    if (!title || !body || !product.name) {
      console.warn('Notification title or body is empty:', { title, body, productName: product.name });
      return;
    }

    // Bildirim içeriğini hazırla
    const notificationContent = {
      title,
      body,
      data: {
        type: 'low-stock',
        productId: product.id,
        productName: product.name,
        stock,
        threshold,
      },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      // Android için channel ID belirt
      ...(Platform.OS === 'android' && {
        android: {
          channelId: 'low-stock-alerts',
        },
      }),
    };

    // Web platform için bildirimleri destekleme
    if (Platform.OS === 'web') {
      // Web'de bildirimler desteklenmiyor, sessizce çık
      if (__DEV__) {
        console.log('Notifications not supported on web.');
      }
      return;
    }

    // Sadece geliştirme modunda log göster
    if (__DEV__) {
      console.log('Sending notification:', { title, body, productName: product.name });
    }

    // Anında gösterim için scheduleNotificationAsync kullan (presentNotificationAsync deprecated)
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // Hemen göster
      });
      console.log('Notification scheduled successfully:', { title, body, notificationId });
      
      // Bildirim ID'sini sakla (gerekirse iptal etmek için)
      if (notificationId) {
        await AsyncStorage.setItem(`notification_${product.id}`, notificationId);
      }
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Belirli bir ürün için bildirimi iptal et
 */
export async function cancelNotificationForProduct(productId: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      return;
    }

    const notificationId = await AsyncStorage.getItem(`notification_${productId}`);
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await AsyncStorage.removeItem(`notification_${productId}`);
    }
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Tüm düşük stok bildirimlerini iptal et
 */
export async function cancelAllLowStockNotifications(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // AsyncStorage'dan tüm notification ID'lerini temizle
    const keys = await AsyncStorage.getAllKeys();
    const notificationKeys = keys.filter(key => key.startsWith('notification_'));
    if (notificationKeys.length > 0) {
      await AsyncStorage.multiRemove(notificationKeys);
    }
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Background task handler - uygulama kapalıyken çalışır
 * Bu fonksiyon app.json'da task name olarak tanımlanmalı
 */
export async function backgroundNotificationHandler(notification: Notifications.Notification): Promise<void> {
  // Background'da çalışan kod
  // Burada düşük stok kontrolü yapılabilir
  console.log('Background notification received:', notification);
}

/**
 * Bildirim tıklama handler'ı
 * Uygulama başlangıcında çağrılmalı
 */
export function setupNotificationHandlers(): void {
  // Web platform için bildirim handler'ları kurma
  if (Platform.OS === 'web') {
    // Web'de bildirim handler'ları desteklenmiyor, sessizce çık
    if (__DEV__) {
      console.log('Notification handlers not supported on web.');
    }
    return;
  }

  // Bildirime tıklandığında
  Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    
    if (data?.type === 'low-stock') {
      // Ürün detayına git veya uygulamayı aç
      console.log('Low stock notification tapped:', data);
    }
  });

  // Bildirim geldiğinde (uygulama açıkken)
  Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
  });
}

