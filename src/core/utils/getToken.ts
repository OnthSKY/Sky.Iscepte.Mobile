/**
 * Get Access Token Utility
 * 
 * NEDEN: Tüm servislerde token okuma işlemini merkezileştiriyoruz
 * - Keychain'den güvenli token okuma
 * - Mock mode kontrolü
 * - Tek bir yerden yönetim
 */

import { tokenStorage } from '../services/secureStorageService';
import appConfig from '../config/appConfig';

/**
 * Get access token from secure storage
 * NEDEN: Token'lar Keychain'de saklandığı için oradan okumalıyız
 * 
 * @returns Access token or null
 */
export async function getAccessToken(): Promise<string | null> {
  // In mock mode, we might need token for mock service
  // In real API mode, token is always needed
  if (appConfig.mode === 'mock') {
    return await tokenStorage.getAccessToken();
  }
  
  // Real API mode - always get token
  return await tokenStorage.getAccessToken();
}

export default getAccessToken;

