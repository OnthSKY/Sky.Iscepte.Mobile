import { create } from 'zustand';
import { BaseCustomField } from '../../../shared/types/customFields';

export type Currency = 'TRY' | 'USD' | 'EUR';

// Sale custom field - inherits from BaseCustomField
export type SalesCustomField = BaseCustomField;

// Sale item interface for bulk sales
export interface SaleItem {
  productId: string | number;
  productName?: string;
  quantity: number;
  price: number;
  subtotal: number;
  currency?: Currency;
}

export interface Sale {
  id: string | number;
  title?: string;
  amount?: number;
  customerId?: string | number;
  customerName?: string;
  productId?: string | number; // Deprecated: Use items array for bulk sales
  productName?: string; // Deprecated: Use items array for bulk sales
  quantity?: number; // Deprecated: Use items array for bulk sales
  price?: number; // Deprecated: Use items array for bulk sales
  currency?: Currency;
  total?: number;
  date?: string;
  status?: string;
  ownerId?: string | number;
  employeeId?: string | number;
  debtCollectionDate?: string; // Borç alınacak tarih
  isPaid?: boolean; // Ödeme alındı mı?
  items?: SaleItem[]; // Toplu satış için ürün listesi
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


