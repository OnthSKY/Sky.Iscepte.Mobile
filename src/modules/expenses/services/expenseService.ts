import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export interface Expense {
  id: string;
  title?: string;
  amount?: number;
  expenseTypeId?: string;
  expenseTypeName?: string;
  date?: string;
  description?: string;
}

export interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  monthlyExpenses: number;
  expenseTypes: number;
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

export const expenseService = {
  list: (req: GridRequest) =>
    request<Paginated<Expense>>('GET', `${apiEndpoints.expenses.list}${toQueryParams(req)}`),

  get: (id: string) => request<Expense>('GET', apiEndpoints.expenses.get(id)),

  stats: () => request<ExpenseStats>('GET', apiEndpoints.expenses.stats),

  create: (payload: Partial<Expense>) =>
    request<Expense>('POST', apiEndpoints.expenses.create, payload),

  update: (id: string, payload: Partial<Expense>) =>
    request<Expense>('PUT', apiEndpoints.expenses.update(id), payload),

  remove: (id: string) => request<void>('DELETE', apiEndpoints.expenses.remove(id)),
};

export default expenseService;


