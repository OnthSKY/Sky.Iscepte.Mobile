import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export type ExpenseType = 'expense'; // Only expense, income has separate module
export type ExpenseSource = 'product_purchase' | 'employee_salary' | 'manual';
export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Expense {
  id: string;
  title?: string;
  amount?: number;
  currency?: Currency;
  type?: ExpenseType; // Always 'expense'
  source?: ExpenseSource; // 'product_purchase', 'employee_salary', 'manual'
  expenseTypeId?: string;
  expenseTypeName?: string;
  date?: string;
  description?: string;
  // Related entity IDs for system-generated expenses
  saleId?: string;
  productId?: string;
  employeeId?: string;
  // Metadata
  isSystemGenerated?: boolean; // true if auto-generated from system
}

export interface ExpenseStats {
  // Total counts
  totalTransactions: number;
  // Amounts
  totalExpenses: number;
  // Monthly
  monthlyExpenses: number;
  // By source
  expensesFromProducts: number;
  expensesFromSalaries: number;
  expensesFromManual: number;
  // Types
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


