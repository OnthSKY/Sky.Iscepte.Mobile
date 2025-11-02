import { create } from 'zustand';

export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Customer { 
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
  group?: string;
  debtLimit?: number;
}

interface CustomerState {
  items: Customer[];
  setItems: (items: Customer[]) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export default useCustomerStore;


