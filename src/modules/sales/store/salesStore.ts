import { create } from 'zustand';

export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Sale {
  id: string | number;
  title?: string;
  amount?: number;
  customerId?: string | number;
  customerName?: string;
  productId?: string | number;
  productName?: string;
  quantity?: number;
  price?: number;
  currency?: Currency;
  total?: number;
  date?: string;
  status?: string;
  ownerId?: string | number;
  employeeId?: string | number;
}

interface SalesState {
  items: Sale[];
  setItems: (items: Sale[]) => void;
}

export const useSalesStore = create<SalesState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export default useSalesStore;


