/**
 * Purchase Service Adapter
 * Adapts purchaseService to BaseEntityService interface
 */

import { createBaseServiceAdapter } from '../../../core/services/baseServiceAdapter';
import { purchaseService } from './purchaseService';
import { Purchase } from '../store/purchaseStore';
import httpService from '../../../shared/services/httpService';

// Extend purchase service with missing methods
const extendedPurchaseService = {
  list: purchaseService.list,
  get: async (id: string): Promise<Purchase | null> => {
    try {
      const response = await httpService.get<Purchase>(`/purchases/${id}`);
      return response;
    } catch {
      return null;
    }
  },
  create: async (data: Partial<Purchase>): Promise<Purchase> => {
    return httpService.post<Purchase>('/purchases', data);
  },
  update: async (id: string, data: Partial<Purchase>): Promise<Purchase> => {
    return httpService.put<Purchase>(`/purchases/${id}`, data);
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      await httpService.delete<void>(`/purchases/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

export const purchaseEntityService = createBaseServiceAdapter<Purchase>(
  '/purchases',
  extendedPurchaseService
);

