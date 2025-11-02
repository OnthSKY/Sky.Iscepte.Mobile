import { create } from 'zustand';
import { BaseCustomField } from '../../../shared/types/customFields';

export type Currency = 'TRY' | 'USD' | 'EUR';

// Sale custom field - inherits from BaseCustomField
export type SalesCustomField = BaseCustomField;

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
  customFields?: SalesCustomField[];
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


