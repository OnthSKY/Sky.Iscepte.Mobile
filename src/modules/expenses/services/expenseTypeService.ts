import httpService from '../../../shared/services/httpService';

export type ExpenseType = {
  id: string;
  name: string;
};

export type ExpenseTypeStats = {
  totalTypes: number;
  totalExpenseAmount: number;
};

const base = '/expense-types';

export const expenseTypeService = {
  list: () => httpService.get<ExpenseType[]>(`${base}`),
  create: (payload: { name: string }) => httpService.post<ExpenseType>(`${base}`, payload),
  update: (id: string, payload: { name: string }) => httpService.put<ExpenseType>(`${base}/${id}`, payload),
  remove: (id: string) => httpService.delete<void>(`${base}/${id}`),
  stats: () => httpService.get<ExpenseTypeStats>(`${base}/stats`),
};

export default expenseTypeService;
