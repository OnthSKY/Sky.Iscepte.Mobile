import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
// NEDEN: Token'lar artık Keychain'de saklanıyor, AsyncStorage yerine getToken utility kullanıyoruz
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { PaginatedData } from '../../../shared/types/apiResponse';
import { toQueryParams } from '../../../shared/utils/query';

import { BaseCustomField } from '../../../shared/types/customFields';

// Product custom field - inherits from BaseCustomField
export type ProductCustomField = BaseCustomField;

export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  price?: number;
  currency?: Currency;
  stock?: number;
  trackStock?: boolean; // Stok takibi yapılsın mı? (default: true)
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

// Use httpService directly (it handles both mock and real API)
// httpService already parses BaseControllerResponse format correctly
async function request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, body?: any): Promise<T> {
  // Get token from secure storage (Keychain)
  // NEDEN: Token'lar Keychain'de güvenli saklanır
  const { getAccessToken } = await import('../../../core/utils/getToken');
  const token = appConfig.mode === 'mock' ? await getAccessToken() : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  
  switch (method) {
    case 'GET':
      return httpService.get<T>(url, { headers });
    case 'POST':
      return httpService.post<T>(url, body, { headers });
    case 'PUT':
      return httpService.put<T>(url, body, { headers });
    case 'DELETE':
      return httpService.delete<T>(url, { headers });
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

/**
 * Product Movement - Birleşik hareket kaydı (alış, satış, stok işlemleri)
 */
export interface ProductMovement {
  id: string | number;
  type: 'stock' | 'purchase' | 'sale';
  action: string;
  description?: string;
  user?: string;
  timestamp: string;
  changes?: Record<string, { old: any; new: any }>;
  // Purchase/Sale specific fields
  quantity?: number;
  price?: number;
  currency?: string;
  total?: number;
  supplierName?: string;
  customerName?: string;
  purchaseId?: string | number;
  saleId?: string | number;
}

export const productService = {
  list: async (req: GridRequest): Promise<Paginated<Product>> => {
    const response = await request<any>('GET', `${apiEndpoints.stock.list}${toQueryParams(req)}`);
    
    // Handle null or undefined response
    if (!response) {
      return {
        items: [],
        total: 0,
        page: req.page || 1,
        pageSize: req.pageSize || 20,
      };
    }
    
    // Normalize PaginatedData to Paginated format (new API structure)
    if ('totalCount' in response || 'totalPage' in response) {
      const paginatedData = response as PaginatedData<Product>;
      return {
        items: Array.isArray(paginatedData.items) ? paginatedData.items : [],
        total: paginatedData.totalCount || 0,
        page: paginatedData.page || (req.page || 1),
        pageSize: paginatedData.pageSize || (req.pageSize || 20),
      };
    }
    
    // Handle legacy Paginated format
    if ('items' in response || 'total' in response) {
      const paginated = response as Paginated<Product>;
      return {
        items: Array.isArray(paginated.items) ? paginated.items : [],
        total: paginated.total || 0,
        page: paginated.page || (req.page || 1),
        pageSize: paginated.pageSize || (req.pageSize || 20),
      };
    }
    
    // Handle array response (fallback)
    if (Array.isArray(response)) {
      return {
        items: response,
        total: response.length,
        page: req.page || 1,
        pageSize: req.pageSize || 20,
      };
    }
    
    // Fallback: empty result
    return {
      items: [],
      total: 0,
      page: req.page || 1,
      pageSize: req.pageSize || 20,
    };
  },

  get: (id: string) => request<Product>('GET', apiEndpoints.stock.get(id)),

  stats: () => request<ProductStats>('GET', apiEndpoints.stock.stats),

  create: (payload: Partial<Product>) =>
    request<Product>('POST', apiEndpoints.stock.create, payload),

  update: (id: string, payload: Partial<Product>) =>
    request<Product>('PUT', apiEndpoints.stock.update(id), payload),

  remove: (id: string) => request<void>('DELETE', apiEndpoints.stock.remove(id)),

  history: (id: string | number) => request<ProductHistoryItem[]>('GET', apiEndpoints.stock.history(id)),

  movements: (id: string | number) => request<ProductMovement[]>('GET', apiEndpoints.stock.movements(id)),
};

export default productService;


