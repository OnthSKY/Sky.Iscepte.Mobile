import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export interface Employee {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  isActive?: boolean;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
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

export const employeeService = {
  list: (req: GridRequest) =>
    request<Paginated<Employee>>('GET', `${apiEndpoints.employees.list}${toQueryParams(req)}`),

  get: (id: string) => request<Employee>('GET', apiEndpoints.employees.get(id)),

  stats: () => request<EmployeeStats>('GET', apiEndpoints.employees.stats),

  create: (payload: Partial<Employee>) =>
    request<Employee>('POST', apiEndpoints.employees.create, payload),

  update: (id: string, payload: Partial<Employee>) =>
    request<Employee>('PUT', apiEndpoints.employees.update(id), payload),

  remove: (id: string) => request<void>('DELETE', apiEndpoints.employees.remove(id)),
};

export default employeeService;


