import { create } from 'zustand';
import { Role } from '../../../core/config/appConstants';
import { BaseCustomField } from '../../../shared/types/customFields';

export type Currency = 'TRY' | 'USD' | 'EUR';

export interface EmployeeCustomField extends BaseCustomField {}

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
  currency?: Currency;
  ownerId?: string | number;
  // User account fields
  username?: string;
  password?: string; // Only for creation, not stored
  role?: Role; // User role (staff, owner, admin)
  userRole?: Role; // User role (staff, owner, admin)
  // Permissions
  customPermissions?: Record<string, {
    actions: string[];
  }>;
  customFields?: EmployeeCustomField[];
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


