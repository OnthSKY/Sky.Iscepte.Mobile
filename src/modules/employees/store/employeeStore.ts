import { create } from 'zustand';

export interface Employee { id: string; name: string; role: string }

interface EmployeeState {
  items: Employee[];
  setItems: (items: Employee[]) => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export default useEmployeeStore;


