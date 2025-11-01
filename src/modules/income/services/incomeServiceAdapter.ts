/**
 * Income Service Adapter
 * Adapts incomeService to BaseEntityService interface
 */

import { createBaseServiceAdapter } from '../../../core/services/baseServiceAdapter';
import { incomeService } from './incomeService';
import { Income } from '../store/incomeStore';
import httpService from '../../../shared/services/httpService';

// Extend income service with missing methods
const extendedIncomeService = {
  list: incomeService.list,
  get: async (id: string): Promise<Income | null> => {
    try {
      const response = await httpService.get<Income>(`/income/${id}`);
      return response;
    } catch {
      return null;
    }
  },
  create: async (data: Partial<Income>): Promise<Income> => {
    return httpService.post<Income>('/income', data);
  },
  update: async (id: string, data: Partial<Income>): Promise<Income> => {
    return httpService.put<Income>(`/income/${id}`, data);
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      await httpService.delete<void>(`/income/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

export const incomeEntityService = createBaseServiceAdapter<Income>(
  '/income',
  extendedIncomeService
);

