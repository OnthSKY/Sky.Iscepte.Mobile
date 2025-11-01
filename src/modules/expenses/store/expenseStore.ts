import { create } from 'zustand';

export type ExpenseType = 'income' | 'expense';
export type ExpenseSource = 'sales' | 'product_purchase' | 'employee_salary' | 'manual';

export interface Expense { 
  id: string | number;
  title?: string;
  amount?: number;
  type?: ExpenseType; // 'income' or 'expense'
  source?: ExpenseSource; // 'sales', 'product_purchase', 'employee_salary', 'manual'
  expenseTypeId?: string;
  expenseTypeName?: string;
  date?: string;
  description?: string;
  status?: string;
  ownerId?: string | number;
  employeeId?: string | number;
  // Related entity IDs for system-generated expenses
  saleId?: string;
  productId?: string;
  // Metadata
  isSystemGenerated?: boolean; // true if auto-generated from system
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


