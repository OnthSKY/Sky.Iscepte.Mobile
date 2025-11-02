/**
 * Staff Permission Group Service
 * 
 * Handles API calls for staff permission groups
 */

import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StaffPermissionGroup } from '../../../core/config/staffPermissionGroups';

// Internal mock service handler
async function getMockService() {
  if (appConfig.mode === 'mock') {
    const mod = await import('../../../shared/services/mockService');
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

export const staffPermissionGroupService = {
  list: () => request<StaffPermissionGroup[]>('GET', apiEndpoints.permissionGroups.list),

  get: (id: string | number) => request<StaffPermissionGroup>('GET', apiEndpoints.permissionGroups.get(id)),

  create: (payload: Partial<StaffPermissionGroup>) =>
    request<StaffPermissionGroup>('POST', apiEndpoints.permissionGroups.create, payload),

  update: (id: string | number, payload: Partial<StaffPermissionGroup>) =>
    request<StaffPermissionGroup>('PUT', apiEndpoints.permissionGroups.update(id), payload),

  remove: (id: string | number) => request<void>('DELETE', apiEndpoints.permissionGroups.remove(id)),
};

export default staffPermissionGroupService;

