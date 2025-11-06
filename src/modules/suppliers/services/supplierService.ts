import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export interface Supplier {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  totalOrders?: number;
}

export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
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

export const supplierService = {
  list: (req: GridRequest) =>
    request<Paginated<Supplier>>('GET', `${apiEndpoints.suppliers.list}${toQueryParams(req)}`),

  get: (id: string) => request<Supplier>('GET', apiEndpoints.suppliers.get(id)),

  stats: () => request<SupplierStats>('GET', apiEndpoints.suppliers.stats),

  create: (payload: Partial<Supplier>) =>
    request<Supplier>('POST', apiEndpoints.suppliers.create, payload),

  update: (id: string, payload: Partial<Supplier>) =>
    request<Supplier>('PUT', apiEndpoints.suppliers.update(id), payload),

  remove: (id: string) => request<void>('DELETE', apiEndpoints.suppliers.remove(id)),
};

export default supplierService;

