/**
 * Sales Service Adapter
 * Adapts salesService to BaseEntityService interface
 */

import { createBaseServiceAdapter } from '../../../core/services/baseServiceAdapter';
import { salesService } from './salesService';
import { Sale } from '../store/salesStore';
import httpService from '../../../shared/services/httpService';

// Extend sales service with missing methods
const extendedSalesService = {
  list: salesService.list,
  get: async (id: string): Promise<Sale | null> => {
    try {
      const response = await httpService.get<Sale>(`/sales/${id}`);
      return response;
    } catch {
      return null;
    }
  },
  create: async (data: Partial<Sale>): Promise<Sale> => {
    return httpService.post<Sale>('/sales', data);
  },
  update: async (id: string, data: Partial<Sale>): Promise<Sale> => {
    return httpService.put<Sale>(`/sales/${id}`, data);
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      await httpService.delete<void>(`/sales/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

export const salesEntityService = createBaseServiceAdapter<Sale>(
  '/sales',
  extendedSalesService
);

