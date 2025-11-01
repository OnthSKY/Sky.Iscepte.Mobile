import { create } from 'zustand';

export interface Employee { 
  id: string | number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  isActive?: boolean;
  status?: string;
  hireDate?: string;
  salary?: number;
  ownerId?: string | number;
}

interface EmployeeState {
  items: Employee[];
  setItems: (items: Employee[]) => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export default useEmployeeStore;


