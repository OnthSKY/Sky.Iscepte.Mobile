/**
 * Staff Permission Groups Configuration
 * 
 * Defines permission groups for staff users that can be quickly assigned
 * when creating or editing employee permissions.
 * 
 * Uses API service with fallback to local storage for offline support.
 */

import { storageService } from '../../shared/services/storageService';
import { staffPermissionGroupService } from '../../modules/employees/services/staffPermissionGroupService';
import appConfig from './appConfig';

export interface StaffPermissionGroup {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, {
    actions: string[];
  }>;
}

const STORAGE_KEY = 'STAFF_PERMISSION_GROUPS';

// Default permission groups (fallback)
const DEFAULT_GROUPS: StaffPermissionGroup[] = [
  {
    id: 'mobile-seller',
    name: 'Arabalı Satıcı',
    description: 'Seyyar satış yapabilen personel için yetki grubu',
    permissions: {
      sales: { actions: ['view', 'create'] },
      customers: { actions: ['view', 'create'] },
      products: { actions: ['view'] },
      reports: { actions: ['view'] },
    },
  },
  {
    id: 'store-seller',
    name: 'Dükkan Satıcısı',
    description: 'Dükkanda satış yapabilen personel için yetki grubu',
    permissions: {
      sales: { actions: ['view', 'create', 'edit'] },
      customers: { actions: ['view', 'create', 'edit'] },
      products: { actions: ['view'] },
      purchases: { actions: ['view'] },
      reports: { actions: ['view'] },
    },
  },
  {
    id: 'cashier',
    name: 'Kasa',
    description: 'Kasa işlemlerini yönetebilen personel için yetki grubu',
    permissions: {
      sales: { actions: ['view', 'create', 'edit'] },
      purchases: { actions: ['view', 'create', 'edit'] },
      expenses: { actions: ['view', 'create'] },
      revenue: { actions: ['view', 'create'] },
      customers: { actions: ['view'] },
      suppliers: { actions: ['view'] },
      products: { actions: ['view'] },
      reports: { actions: ['view'] },
    },
  },
  {
    id: 'warehouse',
    name: 'Depo',
    description: 'Depo işlemlerini yönetebilen personel için yetki grubu',
    permissions: {
      products: { actions: ['view', 'create', 'edit'] },
      purchases: { actions: ['view', 'create', 'edit'] },
      suppliers: { actions: ['view', 'create'] },
      stock: { actions: ['view', 'create', 'edit'] },
      reports: { actions: ['view'] },
    },
  },
  {
    id: 'sales-manager',
    name: 'Satış Müdürü',
    description: 'Satış işlemlerini tam olarak yönetebilen personel için yetki grubu',
    permissions: {
      sales: { actions: ['view', 'create', 'edit', 'delete'] },
      customers: { actions: ['view', 'create', 'edit', 'delete'] },
      products: { actions: ['view'] },
      reports: { actions: ['view'] },
    },
  },
];

/**
 * Get all permission groups (from API, fallback to local storage)
 */
export const getPermissionGroups = async (): Promise<StaffPermissionGroup[]> => {
  try {
    // Try API first (if not in mock mode)
    if (appConfig.mode !== 'mock') {
      try {
        const groups = await staffPermissionGroupService.list();
        // Cache in local storage as backup
        if (groups && groups.length > 0) {
          await storageService.set(STORAGE_KEY, groups);
          return groups;
        }
      } catch (apiError) {
        console.warn('Failed to load permission groups from API, falling back to local storage:', apiError);
      }
    }

    // Fallback to local storage
    const stored = await storageService.get<StaffPermissionGroup[]>(STORAGE_KEY);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      return stored;
    }

    // Return defaults if nothing stored
    return DEFAULT_GROUPS;
  } catch (error) {
    console.error('Failed to load permission groups:', error);
    return DEFAULT_GROUPS;
  }
};

/**
 * Save permission groups (to API, fallback to local storage)
 */
export const savePermissionGroups = async (groups: StaffPermissionGroup[]): Promise<void> => {
  try {
    // Also cache in local storage as backup
    await storageService.set(STORAGE_KEY, groups);
  } catch (error) {
    console.error('Failed to save permission groups to local storage:', error);
    // Don't throw, local storage is just a backup
  }
};

/**
 * Get a specific permission group by ID
 */
export const getPermissionGroup = async (id: string | number): Promise<StaffPermissionGroup | null> => {
  try {
    // Try API first
    if (appConfig.mode !== 'mock') {
      try {
        return await staffPermissionGroupService.get(id);
      } catch (apiError) {
        console.warn('Failed to load permission group from API, falling back to local storage:', apiError);
      }
    }

    // Fallback to local storage
    const groups = await getPermissionGroups();
    return groups.find(g => g.id === String(id)) || null;
  } catch (error) {
    console.error('Failed to load permission group:', error);
    return null;
  }
};

/**
 * Add a new permission group (via API, fallback to local storage)
 */
export const addPermissionGroup = async (group: StaffPermissionGroup): Promise<void> => {
  try {
    // Try API first
    if (appConfig.mode !== 'mock') {
      try {
        await staffPermissionGroupService.create(group);
        // Refresh list and cache
        const groups = await getPermissionGroups();
        return;
      } catch (apiError) {
        console.warn('Failed to create permission group via API, falling back to local storage:', apiError);
      }
    }

    // Fallback to local storage
    const groups = await getPermissionGroups();
    // Check if ID already exists
    if (groups.some(g => g.id === group.id)) {
      throw new Error('Permission group with this ID already exists');
    }
    groups.push(group);
    await savePermissionGroups(groups);
  } catch (error) {
    console.error('Failed to add permission group:', error);
    throw error;
  }
};

/**
 * Update a permission group (via API, fallback to local storage)
 */
export const updatePermissionGroup = async (id: string | number, updates: Partial<StaffPermissionGroup>): Promise<void> => {
  try {
    // Try API first
    if (appConfig.mode !== 'mock') {
      try {
        await staffPermissionGroupService.update(id, updates);
        // Refresh list and cache
        const groups = await getPermissionGroups();
        return;
      } catch (apiError) {
        console.warn('Failed to update permission group via API, falling back to local storage:', apiError);
      }
    }

    // Fallback to local storage
    const groups = await getPermissionGroups();
    const index = groups.findIndex(g => g.id === String(id));
    if (index === -1) {
      throw new Error('Permission group not found');
    }
    groups[index] = { ...groups[index], ...updates };
    await savePermissionGroups(groups);
  } catch (error) {
    console.error('Failed to update permission group:', error);
    throw error;
  }
};

/**
 * Delete a permission group (via API, fallback to local storage)
 */
export const deletePermissionGroup = async (id: string | number): Promise<void> => {
  try {
    // Try API first
    if (appConfig.mode !== 'mock') {
      try {
        await staffPermissionGroupService.remove(id);
        // Refresh list and cache
        const groups = await getPermissionGroups();
        return;
      } catch (apiError) {
        console.warn('Failed to delete permission group via API, falling back to local storage:', apiError);
      }
    }

    // Fallback to local storage
    const groups = await getPermissionGroups();
    const filtered = groups.filter(g => g.id !== String(id));
    if (filtered.length === groups.length) {
      throw new Error('Permission group not found');
    }
    await savePermissionGroups(filtered);
  } catch (error) {
    console.error('Failed to delete permission group:', error);
    throw error;
  }
};

/**
 * Reset to default groups
 */
export const resetToDefaults = async (): Promise<void> => {
  // Save defaults to local storage
  await savePermissionGroups(DEFAULT_GROUPS);
  
  // If using API, you might want to recreate default groups there too
  // But for now, we'll just update local storage
};

