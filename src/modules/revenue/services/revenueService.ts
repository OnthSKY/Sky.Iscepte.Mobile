import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export type RevenueSource = 'sales' | 'manual';
export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Revenue {
  id: string;
  title?: string;
  amount?: number;
  currency?: Currency;
  source?: RevenueSource; // 'sales', 'manual'
  revenueTypeId?: string;
  revenueTypeName?: string;
  date?: string;
  description?: string;
  // Related entity IDs for system-generated revenue
  saleId?: string;
  employeeId?: string;
  // Metadata
  isSystemGenerated?: boolean; // true if auto-generated from system
}

export interface RevenueStats {
  // Total counts
  totalTransactions: number;
  // Amounts
  totalRevenue: number;
  // Monthly
  monthlyRevenue: number;
  // By source
  revenueFromSales: number;
  revenueFromManual: number;
  // Types
  revenueTypes: number;
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

export const revenueService = {
  list: (req: GridRequest) =>
    request<Paginated<Revenue>>('GET', `${apiEndpoints.revenue.list}${toQueryParams(req)}`),

  get: (id: string) => request<Revenue>('GET', apiEndpoints.revenue.get(id)),

  stats: () => request<RevenueStats>('GET', apiEndpoints.revenue.stats),

  create: (payload: Partial<Revenue>) =>
    request<Revenue>('POST', apiEndpoints.revenue.create, payload),

  update: (id: string, payload: Partial<Revenue>) =>
    request<Revenue>('PUT', apiEndpoints.revenue.update(id), payload),

  remove: (id: string) => request<void>('DELETE', apiEndpoints.revenue.remove(id)),
};

export default revenueService;

