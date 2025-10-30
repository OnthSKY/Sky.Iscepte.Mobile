import { create } from 'zustand';

export interface Expense { id: string; title: string; amount: number }

interface ExpenseState {
  items: Expense[];
  setItems: (items: Expense[]) => void;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export default useExpenseStore;


