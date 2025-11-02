/**
 * Supplier Service Adapter
 * Adapts supplierService to BaseEntityService interface
 */

import { createBaseServiceAdapter } from '../../../core/services/baseServiceAdapter';
import { supplierService } from './supplierService';
import { Supplier } from '../store/supplierStore';
import httpService from '../../../shared/services/httpService';
import { Paginated } from '../../../shared/types/module';

// Extend supplier service with missing methods if needed
const extendedSupplierService = {
  list: supplierService.list,
  get: async (id: string): Promise<Supplier | null> => {
    try {
      // If service doesn't have get, return mock or fetch all and filter
      const response = await httpService.get<Supplier>(`/suppliers/${id}`);
      return response;
    } catch {
      return null;
    }
  },
  create: async (data: Partial<Supplier>): Promise<Supplier> => {
    return httpService.post<Supplier>('/suppliers', data);
  },
  update: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    return httpService.put<Supplier>(`/suppliers/${id}`, data);
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      await httpService.delete<void>(`/suppliers/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

export const supplierEntityService = createBaseServiceAdapter<Supplier>(
  '/suppliers',
  extendedSupplierService
);

