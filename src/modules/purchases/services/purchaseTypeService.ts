import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PurchaseType = {
  id: string;
  name: string;
  formFields?: PurchaseTypeFormField[]; // Optional: Her type için özel form field'ları
};

export interface PurchaseTypeFormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea';
  required?: boolean;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>; // for select type
}

export type PurchaseTypeStats = {
  totalTypes: number;
  totalPurchases: number;
};

const base = '/purchase-types';

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

export const purchaseTypeService = {
  list: () => request<PurchaseType[]>(`GET`, `${base}`),
  create: (payload: { name: string; formFields?: PurchaseTypeFormField[] }) => 
    request<PurchaseType>(`POST`, `${base}`, payload),
  update: (id: string, payload: { name?: string; formFields?: PurchaseTypeFormField[] }) => 
    request<PurchaseType>(`PUT`, `${base}/${id}`, payload),
  remove: (id: string) => request<void>(`DELETE`, `${base}/${id}`),
  stats: () => request<PurchaseTypeStats>(`GET`, `${base}/stats`),
  get: (id: string) => request<PurchaseType>(`GET`, `${base}/${id}`),
};

export default purchaseTypeService;

