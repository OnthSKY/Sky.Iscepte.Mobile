/**
 * Expense Service Adapter
 * Adapts expenseService to BaseEntityService interface
 */

import { createBaseServiceAdapter } from '../../../core/services/baseServiceAdapter';
import { expenseService } from './expenseService';
import { Expense } from '../store/expenseStore';
import httpService from '../../../shared/services/httpService';

// Extend expense service with missing methods
const extendedExpenseService = {
  list: expenseService.list,
  get: async (id: string): Promise<Expense | null> => {
    try {
      const response = await httpService.get<Expense>(`/expenses/${id}`);
      return response;
    } catch {
      return null;
    }
  },
  create: async (data: Partial<Expense>): Promise<Expense> => {
    return httpService.post<Expense>('/expenses', data);
  },
  update: async (id: string, data: Partial<Expense>): Promise<Expense> => {
    return httpService.put<Expense>(`/expenses/${id}`, data);
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      await httpService.delete<void>(`/expenses/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

export const expenseEntityService = createBaseServiceAdapter<Expense>(
  '/expenses',
  extendedExpenseService
);

