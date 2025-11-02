/**
 * Owner Dashboard Service Types and Implementation
 * 
 * Single Responsibility: Provides owner-specific dashboard summary data
 */

export type Currency = 'TRY' | 'USD' | 'EUR';

export interface ProductSaleDetail {
  productId: number;
  productName: string;
  quantity: number;
  totalAmount: number;
  currency?: Currency;
}

export interface OwnerStoreSummary {
  sales: number;
  expenses: number;
  total: number;
}

export interface OwnerEmployeeSummary {
  sales: number;
  expenses: number;
  total: number;
  employeeId?: string | number;
  productSales?: ProductSaleDetail[];
  productCount?: number;
}

export interface OwnerTopProducts {
  products: ProductSaleDetail[];
  totalCount: number;
}

import httpService from '../../shared/services/httpService';
import appConfig from '../config/appConfig';
import { apiEndpoints } from '../config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Internal mock service handler
async function getMockService() {
  if (appConfig.mode === 'mock') {
    const mod = await import('../../shared/services/mockService');
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

export const ownerDashboardService = {
  getStoreSummary: (period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all') => 
    request<OwnerStoreSummary>('GET', apiEndpoints.dashboard.owner.storeSummary(period)),

  getEmployeeSummary: (employeeId?: string | number, period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all') => 
    request<OwnerEmployeeSummary>('GET', apiEndpoints.dashboard.owner.employeeSummary(employeeId, period)),

  getTopProducts: (period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all', limit: number = 10) => 
    request<OwnerTopProducts>('GET', apiEndpoints.dashboard.owner.topProducts(period, limit)),
};

export default ownerDashboardService;

