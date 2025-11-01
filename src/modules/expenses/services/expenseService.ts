import httpService from '../../../shared/services/httpService';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export interface Expense {
  id: string;
  title?: string;
  amount?: number;
  expenseTypeId?: string;
  expenseTypeName?: string;
  date?: string;
  description?: string;
}

export interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  monthlyExpenses: number;
  expenseTypes: number;
}

export const expenseService = {
  list: (req: GridRequest) =>
    httpService.get<Paginated<Expense>>(`/expenses${toQueryParams(req)}`),

  get: (id: string) => httpService.get<Expense>(`/expenses/${id}`),

  stats: () => httpService.get<ExpenseStats>(`/expenses/stats`),

  create: (payload: Partial<Expense>) =>
    httpService.post<Expense>('/expenses', payload),

  update: (id: string, payload: Partial<Expense>) =>
    httpService.put<Expense>(`/expenses/${id}`, payload),

  remove: (id: string) => httpService.delete<void>(`/expenses/${id}`),
};

export default expenseService;


