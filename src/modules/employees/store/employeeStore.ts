import { create } from 'zustand';
import { Role } from '../../../core/config/appConstants';

export interface Employee { 
  id: string | number;
  firstName?: string;
  lastName?: string;
  name?: string; // Full name or firstName + lastName combination
  email?: string;
  phone?: string;
  position?: string; // Job position/title
  isActive?: boolean;
  status?: string;
  hireDate?: string;
  salary?: number;
  ownerId?: string | number;
  // User account fields
  username?: string;
  password?: string; // Only for creation, not stored
  role?: Role; // User role (staff, owner, admin)
  // Permissions
  customPermissions?: Record<string, {
    actions: string[];
  }>;
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


