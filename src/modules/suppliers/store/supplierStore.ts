import { create } from 'zustand';

export interface Supplier { 
  id: string | number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  status?: string;
  balance?: number;
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

