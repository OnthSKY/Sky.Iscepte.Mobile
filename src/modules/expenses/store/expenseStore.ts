import { create } from 'zustand';

export type ExpenseType = 'expense'; // Only expense, income has separate module
export type ExpenseSource = 'product_purchase' | 'employee_salary' | 'manual';
export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Expense { 
  id: string | number;
  title?: string;
  amount?: number;
  currency?: Currency;
  type?: ExpenseType; // Always 'expense'
  source?: ExpenseSource; // 'product_purchase', 'employee_salary', 'manual'
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


