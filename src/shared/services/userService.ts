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

// Internal mock service handler
async function getMockService() {
  if (appConfig.mode === 'mock') {
    const mod = await import('./mockService');
    return mod.mockRequest;
  }
  return null;
}

async function request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, body?: any): Promise<T> {
  const mockService = await getMockService();
  if (mockService) {
    // Get token from AsyncStorage for mock service
    const token = await AsyncStorage.getItem('access_token');
    return mockService<T>(method, url, body, token || undefined);
  }
  
  switch (method) {
    case 'GET':
      return httpService.get<T>(url);
    case 'POST':
      return httpService.post<T>(url, body);
    case 'PUT':
      return httpService.put<T>(url, body);
    case 'DELETE':
      return httpService.delete<T>(url);
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

