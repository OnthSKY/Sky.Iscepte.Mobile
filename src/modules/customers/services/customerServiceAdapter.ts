/**
 * Customer Service Adapter
 * Adapts customerService to BaseEntityService interface
 */

import { createBaseServiceAdapter } from '../../../core/services/baseServiceAdapter';
import { customerService } from './customerService';
import { Customer } from '../store/customerStore';
import httpService from '../../../shared/services/httpService';
import { Paginated } from '../../../shared/types/module';

// Extend customer service with missing methods if needed
const extendedCustomerService = {
  list: customerService.list,
  get: async (id: string): Promise<Customer | null> => {
    try {
      // If service doesn't have get, return mock or fetch all and filter
      const response = await httpService.get<Customer>(`/customers/${id}`);
      return response;
    } catch {
      return null;
    }
  },
  create: async (data: Partial<Customer>): Promise<Customer> => {
    return httpService.post<Customer>('/customers', data);
  },
  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    return httpService.put<Customer>(`/customers/${id}`, data);
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      await httpService.delete<void>(`/customers/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

export const customerEntityService = createBaseServiceAdapter<Customer>(
  '/customers',
  extendedCustomerService
);

