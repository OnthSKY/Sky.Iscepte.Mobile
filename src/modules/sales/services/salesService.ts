import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  price?: number;
  total?: number;
  date?: string;
  status?: string;
}

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  monthlySales: number;
  averageOrderValue: number;
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

export const salesService = {
  list: (req: GridRequest) =>
    request<Paginated<Sale>>('GET', `/sales${toQueryParams(req)}`),

  get: (id: string) => request<Sale>('GET', `/sales/${id}`),

  stats: () => request<SalesStats>('GET', `/sales/stats`),

  create: (payload: Partial<Sale>) =>
    request<Sale>('POST', '/sales', payload),

  update: (id: string, payload: Partial<Sale>) =>
    request<Sale>('PUT', `/sales/${id}`, payload),

  remove: (id: string) => request<void>('DELETE', `/sales/${id}`),
};

export default salesService;


