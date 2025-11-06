import httpService from './httpService';
import appConfig from '../../core/config/appConfig';
import { apiEndpoints } from '../../core/config/apiEndpoints';
import { tokenStorage, userDataStorage } from '../../core/services/secureStorageService';
/**
 * NEDEN: AsyncStorage yerine secureStorageService kullanıyoruz
 * - Token'lar Keychain'de güvenli saklanır (donanım seviyesinde şifreleme)
 * - Root/jailbreak cihazlarda bile daha güvenli
 * - OWASP Mobile Top 10 önerisi
 * - GDPR/KVKK uyumluluğu için gerekli
 */

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    role: 'admin' | 'manager' | 'user' | 'guest';
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  /**
   * Login with username and password
   * @param username - User's username
   * @param password - User's password
   * @returns Login response with tokens and user info
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await httpService.post<LoginResponse>(apiEndpoints.auth.login, {
      username,
      password,
    });
    
    // Store tokens and user info securely in Keychain
    // NEDEN: Token'lar en kritik sensitive data, Keychain'de saklanmalı
    await tokenStorage.setAccessToken(response.accessToken);
    await tokenStorage.setRefreshToken(response.refreshToken);
    await userDataStorage.setUserRole(response.user.role);
    await userDataStorage.setUserId(response.user.id.toString());
    
    // Owner ID will be extracted from token when needed
    // No need to store separately
    
    return response;
  },

  /**
   * Refresh access token using refresh token
   * @param refreshToken - Refresh token
   * @returns New access and refresh tokens
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    // TODO: Replace with actual API call
    // For refresh token endpoint, we pass refreshToken as Authorization header in mock mode
    const config = appConfig.mode === 'mock' ? {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    } : undefined;
    
    const response = await httpService.post<RefreshTokenResponse>(apiEndpoints.auth.refresh, {
      refreshToken,
    }, config);
    
    // Update stored tokens securely in Keychain
    // NEDEN: Yeni token'lar da güvenli saklanmalı
    await tokenStorage.setAccessToken(response.accessToken);
    await tokenStorage.setRefreshToken(response.refreshToken);
    
    return response;
  },

  /**
   * Logout - clear tokens and user data
   * NEDEN: Logout'ta tüm token'ları temizlemek güvenlik için kritik
   */
  async logout(): Promise<void> {
    const refreshToken = await tokenStorage.getRefreshToken();
    
    if (refreshToken) {
      try {
        // TODO: Call logout API to invalidate token on server
        await httpService.post(apiEndpoints.auth.logout, { refreshToken });
      } catch (error) {
        // Ignore errors if server is unreachable
        // Logout API call failed - continue with local cleanup
      }
    }
    
    // Clear all secure storage (Keychain)
    // NEDEN: Token'lar Keychain'de saklandığı için oradan temizlenmeli
    await tokenStorage.clearTokens();
    await userDataStorage.clearUserData();
  },
};

export default authService;
