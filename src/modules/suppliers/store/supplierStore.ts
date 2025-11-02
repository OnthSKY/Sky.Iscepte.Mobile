import { create } from 'zustand';
import { BaseCustomField } from '../../../shared/types/customFields';

export type Currency = 'TRY' | 'USD' | 'EUR';

export interface SupplierCustomField extends BaseCustomField {}

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
  customFields?: SupplierCustomField[];
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

