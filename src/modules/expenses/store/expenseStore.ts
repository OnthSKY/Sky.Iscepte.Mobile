import { create } from 'zustand';

export interface Expense { 
  id: string | number;
  title?: string;
  amount?: number;
  expenseTypeId?: string;
  expenseTypeName?: string;
  type?: string;
  date?: string;
  description?: string;
  status?: string;
  ownerId?: string | number;
  employeeId?: string | number;
}

interface ExpenseState {
  items: Expense[];
  setItems: (items: Expense[]) => void;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export default useExpenseStore;


