import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export type IncomeSource = 'sales' | 'manual';
export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Income {
  id: string;
  title?: string;
  amount?: number;
  currency?: Currency;
  source?: IncomeSource; // 'sales', 'manual'
  incomeTypeId?: string;
  incomeTypeName?: string;
  date?: string;
  description?: string;
  // Related entity IDs for system-generated income
  saleId?: string;
  employeeId?: string;
  // Metadata
  isSystemGenerated?: boolean; // true if auto-generated from system
}

export interface IncomeStats {
  // Total counts
  totalTransactions: number;
  // Amounts
  totalIncome: number;
  // Monthly
  monthlyIncome: number;
  // By source
  incomeFromSales: number;
  incomeFromManual: number;
  // Types
  incomeTypes: number;
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
    // NEDEN: Token'ı Keychain'den okuyoruz (güvenli storage)
    const { getAccessToken } = await import('../../../core/utils/getToken');
    const token = await getAccessToken();
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

export const incomeService = {
  list: (req: GridRequest) =>
    request<Paginated<Income>>('GET', `${apiEndpoints.income.list}${toQueryParams(req)}`),

  get: (id: string) => request<Income>('GET', apiEndpoints.income.get(id)),

  stats: () => request<IncomeStats>('GET', apiEndpoints.income.stats),

  create: (payload: Partial<Income>) =>
    request<Income>('POST', apiEndpoints.income.create, payload),

  update: (id: string, payload: Partial<Income>) =>
    request<Income>('PUT', apiEndpoints.income.update(id), payload),

  remove: (id: string) => request<void>('DELETE', apiEndpoints.income.remove(id)),
};

export default incomeService;

