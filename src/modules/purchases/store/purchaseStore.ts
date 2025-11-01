import { create } from 'zustand';

export interface Purchase {
  id: string | number;
  title?: string;
  amount?: number;
  supplierId?: string | number;
  supplierName?: string;
  productId?: string | number;
  productName?: string;
  quantity?: number;
  price?: number;
  total?: number;
  date?: string;
  status?: string;
  ownerId?: string | number;
  employeeId?: string | number;
}

interface PurchaseState {
  items: Purchase[];
  setItems: (items: Purchase[]) => void;
}

export const usePurchaseStore = create<PurchaseState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export default usePurchaseStore;

