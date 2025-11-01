/**
 * ExpenseType Service Adapter
 * Adapts expenseTypeService to BaseEntityService interface
 */

import { createBaseServiceAdapter } from '../../../core/services/baseServiceAdapter';
import { expenseTypeService, ExpenseType } from './expenseTypeService';
import httpService from '../../../shared/services/httpService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';

// Adapt expenseTypeService.list to return Paginated format
const adaptedListService = {
  list: async (req: GridRequest): Promise<Paginated<ExpenseType>> => {
    const items = await expenseTypeService.list();
    // Convert array to paginated format
    const page = req.page || 1;
    const pageSize = req.pageSize || items.length || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = items.slice(start, end);
    
    return {
      items: paginatedItems,
      total: items.length,
    };
  },
};

// Extend expenseType service with missing methods
const extendedExpenseTypeService = {
  list: adaptedListService.list,
  get: async (id: string): Promise<ExpenseType | null> => {
    try {
      const items = await expenseTypeService.list();
      return items.find(item => item.id === id) || null;
    } catch {
      return null;
    }
  },
  create: async (data: Partial<ExpenseType>): Promise<ExpenseType> => {
    return expenseTypeService.create(data as { name: string });
  },
  update: async (id: string, data: Partial<ExpenseType>): Promise<ExpenseType> => {
    return expenseTypeService.update(id, data as { name: string });
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      await expenseTypeService.remove(id);
      return true;
    } catch {
      return false;
    }
  },
};

export const expenseTypeEntityService = createBaseServiceAdapter<ExpenseType>(
  '/expense-types',
  extendedExpenseTypeService
);

