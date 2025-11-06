import { create } from 'zustand';

export type Currency = 'TRY' | 'USD' | 'EUR';

import { BaseCustomField } from '../../../shared/types/customFields';

// Purchase custom field - inherits from BaseCustomField
export type PurchaseCustomField = BaseCustomField;

// Purchase item interface for bulk purchases
export interface PurchaseItem {
  productId: string | number;
  productName?: string;
  quantity: number;
  price: number;
  subtotal: number;
  currency?: Currency;
  isStockPurchase?: boolean; // true = stok için alış, false = gider olarak kaydedilecek
  customFields?: PurchaseCustomField[]; // Custom fields for this purchase item
}

export interface Purchase {
  id: string | number;
  title?: string;
  amount?: number;
  supplierId?: string | number;
  supplierName?: string;
  productId?: string | number; // Deprecated: Use items array for bulk purchases
  productName?: string; // Deprecated: Use items array for bulk purchases
  quantity?: number; // Deprecated: Use items array for bulk purchases
  price?: number; // Deprecated: Use items array for bulk purchases
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
  isStockPurchase?: boolean; // true = stok için alış, false = gider olarak kaydedilecek (for single item purchases)
  items?: PurchaseItem[]; // Toplu alış için ürün listesi
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

