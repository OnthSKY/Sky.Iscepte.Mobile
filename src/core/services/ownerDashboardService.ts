/**
 * Owner Dashboard Service Types and Implementation
 * 
 * Single Responsibility: Provides owner-specific dashboard summary data
 */

export interface OwnerTodaySummary {
  sales: number;
  expenses: number;
  total: number;
}

export interface OwnerTotalSummary {
  sales: number;
  expenses: number;
  total: number;
}

export interface OwnerEmployeeSummary {
  sales: number;
  expenses: number;
  total: number;
  employeeId?: string | number;
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
  getTodaySummary: () => 
    request<OwnerTodaySummary>('GET', apiEndpoints.dashboard.owner.todaySummary),

  getTotalSummary: () => 
    request<OwnerTotalSummary>('GET', apiEndpoints.dashboard.owner.totalSummary),

  getEmployeeSummary: (employeeId?: string | number, period: 'today' | 'all' = 'today') => 
    request<OwnerEmployeeSummary>('GET', apiEndpoints.dashboard.owner.employeeSummary(employeeId, period)),
};

export default ownerDashboardService;

