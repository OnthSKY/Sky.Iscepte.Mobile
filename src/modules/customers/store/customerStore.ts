import { create } from 'zustand';

export interface Customer { id: string; name: string }

interface CustomerState {
  items: Customer[];
  setItems: (items: Customer[]) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export default useCustomerStore;


