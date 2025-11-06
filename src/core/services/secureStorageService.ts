/**
 * Secure Storage Service
 * 
 * NEDEN: AsyncStorage güvenli değil - token'lar düz metin olarak saklanıyor
 * ÇÖZÜM: Keychain/Keystore kullanarak donanım seviyesinde şifreleme
 * 
 * Avantajlar:
 * - iOS Keychain ve Android Keystore donanım seviyesinde şifreleme
 * - Root/jailbreak cihazlarda bile daha güvenli
 * - OWASP Mobile Top 10 önerisi
 * - GDPR/KVKK uyumluluğu için gerekli
 */

import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure storage keys - sensitive data için
 */
const SECURE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  USER_ROLE: 'user_role',
} as const;

/**
 * Non-sensitive keys - AsyncStorage için
 */
const NON_SENSITIVE_KEYS = {
  LANGUAGE: 'lang',
  THEME: 'themePreference',
  MENU_TEXT_CASE: 'menuTextCase',
} as const;

/**
 * Secure Storage Service
 * 
 * Token'lar ve hassas veriler için Keychain kullanır
 * Non-sensitive veriler için AsyncStorage kullanır
 */
export const secureStorageService = {
  /**
   * Store sensitive data in Keychain
   * NEDEN: Keychain donanım seviyesinde şifreleme sağlar
   */
  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        key,
        key, // username (required by Keychain API)
        value, // password (actual value we want to store)
        {
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          // NEDEN: Sadece cihaz kilit açıkken erişilebilir, başka cihaza sync olmaz
        }
      );
    } catch (error) {
      console.error(`Failed to store secure item ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get sensitive data from Keychain
   */
  async getSecureItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(key);
      if (credentials && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get secure item ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove sensitive data from Keychain
   */
  async removeSecureItem(key: string): Promise<void> {
    try {
      await Keychain.resetInternetCredentials(key);
    } catch (error) {
      console.error(`Failed to remove secure item ${key}:`, error);
    }
  },

  /**
   * Store non-sensitive data in AsyncStorage
   * NEDEN: Keychain sadece sensitive data için, diğerleri AsyncStorage'da kalabilir
   */
  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },

  /**
   * Get non-sensitive data from AsyncStorage
   */
  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  },

  /**
   * Remove non-sensitive data from AsyncStorage
   */
  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  /**
   * Clear all secure items (logout)
   * NEDEN: Logout'ta tüm token'ları temizlemek güvenlik için kritik
   */
  async clearAllSecureItems(): Promise<void> {
    try {
      await Promise.all([
        this.removeSecureItem(SECURE_KEYS.ACCESS_TOKEN),
        this.removeSecureItem(SECURE_KEYS.REFRESH_TOKEN),
        this.removeSecureItem(SECURE_KEYS.USER_ID),
        this.removeSecureItem(SECURE_KEYS.USER_ROLE),
      ]);
    } catch (error) {
      console.error('Failed to clear secure items:', error);
    }
  },

  /**
   * Check if Keychain is available
   * NEDEN: Bazı cihazlarda Keychain çalışmayabilir, fallback gerekebilir
   */
  async isKeychainAvailable(): Promise<boolean> {
    try {
      // Test if we can write and read from Keychain
      const testKey = '__keychain_test__';
      await this.setSecureItem(testKey, 'test');
      const value = await this.getSecureItem(testKey);
      await this.removeSecureItem(testKey);
      return value === 'test';
    } catch {
      return false;
    }
  },
};

/**
 * Token storage helpers
 * NEDEN: Token'lar en kritik sensitive data, özel helper'lar gerekli
 */
export const tokenStorage = {
  async setAccessToken(token: string): Promise<void> {
    await secureStorageService.setSecureItem(SECURE_KEYS.ACCESS_TOKEN, token);
  },

  async getAccessToken(): Promise<string | null> {
    return await secureStorageService.getSecureItem(SECURE_KEYS.ACCESS_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await secureStorageService.setSecureItem(SECURE_KEYS.REFRESH_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return await secureStorageService.getSecureItem(SECURE_KEYS.REFRESH_TOKEN);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      secureStorageService.removeSecureItem(SECURE_KEYS.ACCESS_TOKEN),
      secureStorageService.removeSecureItem(SECURE_KEYS.REFRESH_TOKEN),
    ]);
  },
};

/**
 * User data storage helpers
 */
export const userDataStorage = {
  async setUserId(userId: string): Promise<void> {
    await secureStorageService.setSecureItem(SECURE_KEYS.USER_ID, userId);
  },

  async getUserId(): Promise<string | null> {
    return await secureStorageService.getSecureItem(SECURE_KEYS.USER_ID);
  },

  async setUserRole(role: string): Promise<void> {
    await secureStorageService.setSecureItem(SECURE_KEYS.USER_ROLE, role);
  },

  async getUserRole(): Promise<string | null> {
    return await secureStorageService.getSecureItem(SECURE_KEYS.USER_ROLE);
  },

  async clearUserData(): Promise<void> {
    await Promise.all([
      secureStorageService.removeSecureItem(SECURE_KEYS.USER_ID),
      secureStorageService.removeSecureItem(SECURE_KEYS.USER_ROLE),
    ]);
  },
};

export default secureStorageService;

