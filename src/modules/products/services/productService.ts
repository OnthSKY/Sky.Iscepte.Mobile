import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';

export interface ProductCustomField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  value: any;
  options?: Array<{ label: string; value: any }>; // for select type
  isGlobal?: boolean; // true: tüm ürünlerde kullanılabilir, false/undefined: sadece bu ürüne özel
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  price?: number;
  stock?: number;
  moq?: number; // Minimum Order Quantity
  isActive?: boolean;
  hasSales?: boolean; // if true, cannot be deleted
  customFields?: ProductCustomField[]; // Dynamic custom fields
}

export interface ProductStats {
  totalStockItems: number;
  totalCategories: number;
  lowStock: number;
  totalStockValue?: number;
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

export interface ProductHistoryItem {
  id: string | number;
  action: string;
  description?: string;
  user?: string;
  timestamp: string;
  changes?: Record<string, { old: any; new: any }>;
}

export const productService = {
  list: (req: GridRequest) =>
    request<Paginated<Product>>('GET', `${apiEndpoints.stock.list}${toQueryParams(req)}`),

  get: (id: string) => request<Product>('GET', apiEndpoints.stock.get(id)),

  stats: () => request<ProductStats>('GET', apiEndpoints.stock.stats),

  create: (payload: Partial<Product>) =>
    request<Product>('POST', apiEndpoints.stock.create, payload),

  update: (id: string, payload: Partial<Product>) =>
    request<Product>('PUT', apiEndpoints.stock.update(id), payload),

  remove: (id: string) => request<void>('DELETE', apiEndpoints.stock.remove(id)),

  history: (id: string | number) => request<ProductHistoryItem[]>('GET', apiEndpoints.stock.history(id)),
};

export default productService;


