import { create } from 'zustand';

export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Supplier { 
  id: string | number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  status?: string;
  balance?: number;
  currency?: Currency;
  lastTransaction?: string;
  ownerId?: string | number;
}

interface SupplierState {
  items: Supplier[];
  setItems: (items: Supplier[]) => void;
}

export const useSupplierStore = create<SupplierState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export default useSupplierStore;

