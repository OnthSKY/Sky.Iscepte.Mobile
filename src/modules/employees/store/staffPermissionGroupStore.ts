/**
 * Staff Permission Group Store
 * 
 * Zustand store for managing staff permission groups
 */

import { create } from 'zustand';
import {
  StaffPermissionGroup,
  getPermissionGroups,
  savePermissionGroups,
  addPermissionGroup as addGroup,
  updatePermissionGroup as updateGroup,
  deletePermissionGroup as deleteGroup,
} from '../../../core/config/staffPermissionGroups';

interface StaffPermissionGroupState {
  groups: StaffPermissionGroup[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadGroups: () => Promise<void>;
  addGroup: (group: StaffPermissionGroup) => Promise<void>;
  updateGroup: (id: string, updates: Partial<StaffPermissionGroup>) => Promise<void>;
  removeGroup: (id: string) => Promise<void>;
  saveGroups: (groups: StaffPermissionGroup[]) => Promise<void>;
}

export const useStaffPermissionGroupStore = create<StaffPermissionGroupState>((set, get) => ({
  groups: [],
  isLoading: false,
  error: null,

  loadGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const groups = await getPermissionGroups();
      set({ groups, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load permission groups', isLoading: false });
    }
  },

  addGroup: async (group: StaffPermissionGroup) => {
    set({ isLoading: true, error: null });
    try {
      await addGroup(group);
      const groups = await getPermissionGroups();
      set({ groups, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to add permission group', isLoading: false });
      throw error;
    }
  },

  updateGroup: async (id: string, updates: Partial<StaffPermissionGroup>) => {
    set({ isLoading: true, error: null });
    try {
      await updateGroup(id, updates);
      const groups = await getPermissionGroups();
      set({ groups, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update permission group', isLoading: false });
      throw error;
    }
  },

  removeGroup: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteGroup(id);
      const groups = await getPermissionGroups();
      set({ groups, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete permission group', isLoading: false });
      throw error;
    }
  },

  saveGroups: async (groups: StaffPermissionGroup[]) => {
    set({ isLoading: true, error: null });
    try {
      await savePermissionGroups(groups);
      set({ groups, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to save permission groups', isLoading: false });
      throw error;
    }
  },
}));

