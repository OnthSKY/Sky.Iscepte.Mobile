import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export interface Customer {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  totalOrders?: number;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  totalOrders: number;
}

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

export const customerService = {
  list: (req: GridRequest) =>
    request<Paginated<Customer>>('GET', `${apiEndpoints.customers.list}${toQueryParams(req)}`),

  get: (id: string) => request<Customer>('GET', apiEndpoints.customers.get(id)),

  stats: () => request<CustomerStats>('GET', apiEndpoints.customers.stats),

  create: (payload: Partial<Customer>) =>
    request<Customer>('POST', apiEndpoints.customers.create, payload),

  update: (id: string, payload: Partial<Customer>) =>
    request<Customer>('PUT', apiEndpoints.customers.update(id), payload),

  remove: (id: string) => request<void>('DELETE', apiEndpoints.customers.remove(id)),
};

export default customerService;


