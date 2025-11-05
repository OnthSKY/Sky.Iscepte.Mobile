import { create } from 'zustand';

export type Currency = 'TRY' | 'USD' | 'EUR';

import { BaseCustomField } from '../../../shared/types/customFields';

// Purchase custom field - inherits from BaseCustomField
export type PurchaseCustomField = BaseCustomField;

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
  currency?: Currency;
  total?: number;
  date?: string;
  status?: string;
  ownerId?: string | number;
  employeeId?: string | number;
  purchaseTypeId?: string;
  purchaseTypeName?: string;
  signature?: string; // İmza alanı (SVG path data)
  customFields?: PurchaseCustomField[]; // Her purchase'a özel custom field'lar
  isStockPurchase?: boolean; // true = stok için alış, false = gider olarak kaydedilecek
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

