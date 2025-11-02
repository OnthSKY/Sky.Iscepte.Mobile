import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export type Currency = 'TRY' | 'USD' | 'EUR';

import { BaseCustomField } from '../../../shared/types/customFields';

// Purchase custom field - inherits from BaseCustomField
export type PurchaseCustomField = BaseCustomField;

export interface Purchase {
  id: string;
  supplierId?: string;
  supplierName?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  price?: number;
  currency?: Currency;
  total?: number;
  date?: string;
  status?: string;
  purchaseTypeId?: string;
  purchaseTypeName?: string;
  customFields?: PurchaseCustomField[]; // Her purchase'a özel custom field'lar
}

export interface PurchaseStats {
  totalPurchases: number;
  totalCost: number;
  monthlyPurchases: number;
  averagePurchaseValue: number;
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

export const purchaseService = {
  list: (req: GridRequest) =>
    request<Paginated<Purchase>>('GET', `${apiEndpoints.purchases.list}${toQueryParams(req)}`),

  get: (id: string) => request<Purchase>('GET', apiEndpoints.purchases.get(id)),

  stats: () => request<PurchaseStats>('GET', apiEndpoints.purchases.stats),

  create: (payload: Partial<Purchase>) =>
    request<Purchase>('POST', apiEndpoints.purchases.create, payload),

  update: (id: string, payload: Partial<Purchase>) =>
    request<Purchase>('PUT', apiEndpoints.purchases.update(id), payload),

  remove: (id: string) => request<void>('DELETE', apiEndpoints.purchases.remove(id)),
};

export default purchaseService;

