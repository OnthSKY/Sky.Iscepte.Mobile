import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';
import { BaseCustomField } from '../../../shared/types/customFields';

export type Currency = 'TRY' | 'USD' | 'EUR';

// Sale custom field - inherits from BaseCustomField
export type SalesCustomField = BaseCustomField;

// Sale item interface for bulk sales
export interface SaleItem {
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
  subtotal: number;
  currency?: Currency;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  productId?: string; // Deprecated: Use items array for bulk sales
  productName?: string; // Deprecated: Use items array for bulk sales
  quantity?: number; // Deprecated: Use items array for bulk sales
  price?: number; // Deprecated: Use items array for bulk sales
  currency?: Currency;
  total?: number;
  date?: string;
  status?: string;
  debtCollectionDate?: string; // Borç alınacak tarih
  isPaid?: boolean; // Ödeme alındı mı?
  items?: SaleItem[]; // Toplu satış için ürün listesi
  customFields?: SalesCustomField[];
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
    request<Paginated<Sale>>('GET', `${apiEndpoints.sales.list}${toQueryParams(req)}`),

  get: (id: string) => request<Sale>('GET', apiEndpoints.sales.get(id)),

  stats: () => request<SalesStats>('GET', apiEndpoints.sales.stats),

  create: (payload: Partial<Sale>) =>
    request<Sale>('POST', apiEndpoints.sales.create, payload),

  update: (id: string, payload: Partial<Sale>) =>
    request<Sale>('PUT', apiEndpoints.sales.update(id), payload),

  remove: (id: string) => request<void>('DELETE', apiEndpoints.sales.remove(id)),

  // Borçlu satışlar listesi
  debtList: (req: GridRequest) =>
    request<Paginated<Sale>>('GET', `${apiEndpoints.sales.debtList}${toQueryParams(req)}`),

  // Ödeme alındı işaretle
  markAsPaid: (id: string) =>
    request<Sale>('PUT', apiEndpoints.sales.markAsPaid(id), { isPaid: true }),
};

export default salesService;


