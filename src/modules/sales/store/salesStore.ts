import { create } from 'zustand';

export interface Sale {
  id: string;
  title: string;
  amount: number;
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


