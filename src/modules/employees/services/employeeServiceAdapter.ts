/**
 * Employee Service Adapter
 * Adapts employeeService to BaseEntityService interface
 */

import { createBaseServiceAdapter } from '../../../core/services/baseServiceAdapter';
import { employeeService } from './employeeService';
import { Employee } from '../store/employeeStore';
import httpService from '../../../shared/services/httpService';

// Extend employee service with missing methods
const extendedEmployeeService = {
  list: employeeService.list,
  get: async (id: string): Promise<Employee | null> => {
    try {
      const response = await httpService.get<Employee>(`/users/${id}`);
      return response;
    } catch {
      return null;
    }
  },
  create: async (data: Partial<Employee>): Promise<Employee> => {
    return httpService.post<Employee>('/users', data);
  },
  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    return httpService.put<Employee>(`/users/${id}`, data);
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      await httpService.delete<void>(`/users/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

export const employeeEntityService = createBaseServiceAdapter<Employee>(
  '/users',
  extendedEmployeeService
);

