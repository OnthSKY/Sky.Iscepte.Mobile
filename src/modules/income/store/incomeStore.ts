import { create } from 'zustand';

export type IncomeSource = 'sales' | 'manual';

export interface Income { 
  id: string | number;
  title?: string;
  amount?: number;
  source?: IncomeSource; // 'sales', 'manual'
  incomeTypeId?: string;
  incomeTypeName?: string;
  date?: string;
  description?: string;
  status?: string;
  ownerId?: string | number;
  employeeId?: string | number;
  // Related entity IDs for system-generated income
  saleId?: string;
  // Metadata
  isSystemGenerated?: boolean; // true if auto-generated from system
}

interface IncomeState {
  items: Income[];
  setItems: (items: Income[]) => void;
}

export const useIncomeStore = create<IncomeState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export default useIncomeStore;

