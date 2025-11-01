/**
 * Revenue Service Adapter
 * Adapts revenueService to BaseEntityService interface
 */

import { createBaseServiceAdapter } from '../../../core/services/baseServiceAdapter';
import { revenueService } from './revenueService';
import { Revenue } from '../store/revenueStore';
import httpService from '../../../shared/services/httpService';

// Extend revenue service with missing methods
const extendedRevenueService = {
  list: revenueService.list,
  get: async (id: string): Promise<Revenue | null> => {
    try {
      const response = await httpService.get<Revenue>(`/revenue/${id}`);
      return response;
    } catch {
      return null;
    }
  },
  create: async (data: Partial<Revenue>): Promise<Revenue> => {
    return httpService.post<Revenue>('/revenue', data);
  },
  update: async (id: string, data: Partial<Revenue>): Promise<Revenue> => {
    return httpService.put<Revenue>(`/revenue/${id}`, data);
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      await httpService.delete<void>(`/revenue/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

export const revenueEntityService = createBaseServiceAdapter<Revenue>(
  '/revenue',
  extendedRevenueService
);

