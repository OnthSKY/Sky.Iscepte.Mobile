import { create } from 'zustand';

export type RevenueSource = 'sales' | 'manual';
export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Revenue { 
  id: string | number;
  title?: string;
  amount?: number;
  currency?: Currency;
  source?: RevenueSource; // 'sales', 'manual'
  revenueTypeId?: string;
  revenueTypeName?: string;
  date?: string;
  description?: string;
  status?: string;
  ownerId?: string | number;
  employeeId?: string | number;
  // Related entity IDs for system-generated revenue
  saleId?: string;
  // Metadata
  isSystemGenerated?: boolean; // true if auto-generated from system
}

interface RevenueState {
  items: Revenue[];
  setItems: (items: Revenue[]) => void;
}

export const useRevenueStore = create<RevenueState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export default useRevenueStore;

