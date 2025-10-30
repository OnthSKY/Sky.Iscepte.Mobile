import { create } from 'zustand';
import { ExpenseType, ExpenseTypeStats } from '../services/expenseTypeService';

interface ExpenseTypeState {
  items: ExpenseType[];
  stats?: ExpenseTypeStats;
  setItems: (items: ExpenseType[]) => void;
  setStats: (stats: ExpenseTypeStats) => void;
}

export const useExpenseTypeStore = create<ExpenseTypeState>((set) => ({
  items: [],
  stats: undefined,
  setItems: (items) => set({ items }),
  setStats: (stats) => set({ stats }),
}));

export default useExpenseTypeStore;
