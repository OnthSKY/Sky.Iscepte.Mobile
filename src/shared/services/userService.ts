import httpService from './httpService';
import appConfig from '../../core/config/appConfig';
import { apiEndpoints } from '../../core/config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  package: string;
  ownerId: number | null;
  company: string | null;
  ownerCompanyName: string | null;
  customPermissions?: Record<string, any>;
}

// Use httpService directly (it handles both mock and real API)
// httpService already parses BaseControllerResponse format correctly
async function request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, body?: any): Promise<T> {
  // Get token from AsyncStorage for mock service (if in mock mode)
  // For real API, interceptor in App.tsx will add Authorization header
  // NEDEN: Token'ı Keychain'den okuyoruz (güvenli storage)
  const { getAccessToken } = await import('../../core/utils/getToken');
  const token = appConfig.mode === 'mock' ? await getAccessToken() : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  
  switch (method) {
    case 'GET':
      return httpService.get<T>(url, { headers });
    case 'POST':
      return httpService.post<T>(url, body, { headers });
    case 'PUT':
      return httpService.put<T>(url, body, { headers });
    case 'DELETE':
      return httpService.delete<T>(url, { headers });
  }
}

export const userService = {
  /**
   * Get current user profile
   * @returns User profile information
   */
  getProfile: () => request<UserProfile>('GET', apiEndpoints.user.profile),

  /**
   * Update current user profile
   * @param payload - Profile update data
   * @returns Updated user profile
   */
  updateProfile: (payload: Partial<UserProfile>) =>
    request<UserProfile>('PUT', apiEndpoints.user.updateProfile, payload),
};

export default userService;

