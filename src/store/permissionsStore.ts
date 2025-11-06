import { create } from 'zustand';
import packages from '../mocks/packages.json';
import users from '../mocks/users.json';
import { extractPermissionsFromToken } from '../core/utils/jwtUtils';
import { rolePermissions } from '../core/config/permissions';
import { Role } from '../core/config/appConstants';
import { tokenStorage } from '../core/services/secureStorageService';
/**
 * NEDEN: Token'ları Keychain'den okuyoruz (güvenli storage)
 */

export interface PermissionDetail {
  actions: string[];
  fields: string[];
  notifications: string[];
}

interface PermissionStore {
  jwtPermissions: string[]; // Direct permissions from JWT token (format: "module:action")
  modulePermissions: Record<string, PermissionDetail>;
  loadPermissions: (userId: number) => void;
  loadPermissionsFromToken: (token: string) => void;
  clearPermissions: () => void;
}

export const usePermissionStore = create<PermissionStore>((set, get) => ({
  jwtPermissions: [],
  modulePermissions: {},
  
  /**
   * Load permissions from JWT token
   * This is the primary method - extracts permissions directly from JWT
   */
  loadPermissionsFromToken: (token: string) => {
    const permissions = extractPermissionsFromToken(token);
    
    // Store raw JWT permissions
    set({ jwtPermissions: permissions });
    
    // Also parse into module-based structure for backward compatibility
    const modulePerms: Record<string, PermissionDetail> = {};
    
    permissions.forEach((perm) => {
      // Permission format: "module:action" (e.g., "customers:create", "stock:custom_form")
      const parts = perm.split(':');
      if (parts.length !== 2) return;
      
      const [module, action] = parts as [string, string];
      
      if (!modulePerms[module]) {
        modulePerms[module] = { actions: [], fields: [], notifications: [] };
      }
      
      // Add action to the module
      if (!modulePerms[module].actions.includes(action)) {
        modulePerms[module].actions.push(action);
      }
    });
    
    set({ modulePermissions: modulePerms });
  },
  
  /**
   * Load permissions from user data (fallback method)
   * Used when JWT doesn't contain permissions or for mock mode
   * 
   * Permission calculation flow:
   * 1. Get base role permissions from permissions.ts (rolePermissions)
   * 2. Apply package permissions (UNION with role permissions, then filter):
   *    - Start with role's base permissions
   *    - Add package's allowedPermissions that role CAN have (based on role's base permissions for that module)
   *    - Filter out permissions that are NOT in package's allowedPermissions (package restriction)
   *    - This allows: Gold owner > Premium owner > Free owner (different permission levels)
   * 3. Apply custom permissions (addActions, removeActions, etc.)
   *    - Custom permissions can ADD permissions that are:
   *      - Either in package's allowedPermissions
   *      - Or settings:* permissions (always allowed)
   *    - Custom permissions can REMOVE any permission (even if in role/package)
   * 4. Convert to "module:action" format and store in jwtPermissions
   * 
   * Example:
   * - Owner role base: ["sales:view", "sales:create", "sales:edit", "sales:delete", ...]
   * - Free package: ["sales:view", "sales:create"]
   * - Result: ["sales:view", "sales:create"] (only what package allows)
   * 
   * - Owner role base: ["sales:view", "sales:create", "sales:edit", "sales:delete", ...]
   * - Gold package: [all permissions including custom_fields, custom_form, custom_value]
   * - Result: [all permissions] (package allows everything)
   */
  loadPermissions: async (userId: number) => {
    // First try to load from JWT token if available
    // NEDEN: Token'ı Keychain'den okuyoruz (güvenli storage)
    const token = await tokenStorage.getAccessToken();
    if (token) {
      const permissions = extractPermissionsFromToken(token);
      if (permissions.length > 0) {
        get().loadPermissionsFromToken(token);
        return;
      }
    }
    
    // Fallback to user data
    const user: any = (users as any).find((u: any) => u.id === userId);
      if (!user) return;

      // Get user's role and convert to Role enum
      const userRole = user.role as string;
      const role: Role = userRole === 'admin' ? Role.ADMIN 
                        : userRole === 'owner' ? Role.OWNER
                        : userRole === 'staff' ? Role.STAFF
                        : Role.GUEST;

            // Get base role permissions from permissions.ts
      const baseRolePermissions: string[] = rolePermissions[role] || [];        

      // Get package and allowed permissions
      // For STAFF: Use owner's package (staff doesn't have their own package)
      // For OWNER/ADMIN: Use their own package
      let packageId = user.package;
      if (role === Role.STAFF && user.ownerId) {
        // Find owner and use their package
        const owner: any = (users as any).find((u: any) => u.id === user.ownerId);
        packageId = owner?.package || 'free';
      }
      const pkg: any = (packages as any).find((p: any) => p.id === packageId);                                                                               
      const allowedPermissions: string[] = pkg?.allowedPermissions || [];

      // Get custom permissions from user
      const customPermissions: any = (user as any).customPermissions || {};

      // Step 1 & 2: Combine role and package permissions
      // Strategy: Start with role permissions, then filter by package allowedPermissions
      // This ensures that:
      // - Gold owner gets more permissions (package allows more)
      // - Premium owner gets medium permissions (package allows medium)
      // - Free owner gets basic permissions (package allows basic)
      
      // Get all possible permissions for this role's modules (from permissionsRegistry)
      // This helps us know which permissions this role CAN have
      const roleModules = new Set<string>();
      baseRolePermissions.forEach((perm) => {
        const [module] = perm.split(':');
        roleModules.add(module);
      });

      // Start with role's base permissions
      // Then filter to only include what package allows
      const basePermissions = baseRolePermissions.filter((perm) => {
        // Settings module permissions are always allowed (not restricted by package)
        if (perm.startsWith('settings:')) return true;
        
        // Only include permissions that package allows
        return allowedPermissions.includes(perm);
      });

      // Convert to Set for easier manipulation
      const finalPermissionsSet = new Set<string>(basePermissions);

      // Step 3: Apply custom permissions per module
      Object.keys(customPermissions).forEach((module) => {
        const custom = customPermissions[module];
        const addActions: string[] = custom.addActions || custom.actions || [];
        const removeActions: string[] = custom.removeActions || [];

        // Add custom actions
        // IMPORTANT: Custom permissions can ADD permissions that:
        // 1. Are in package's allowedPermissions (package allows it)
        // 2. OR are settings:* permissions (always allowed)
        // This allows adding permissions that role doesn't have, IF package allows it
        addActions.forEach((action: string) => {
          const perm = `${module}:${action}`;
          // Only add if package allows this permission or if it's settings
          if (perm.startsWith('settings:') || allowedPermissions.includes(perm)) {
            finalPermissionsSet.add(perm);
          }
        });

        // Remove custom actions
        // Custom permissions can REMOVE any permission, even if it's in role/package
        removeActions.forEach((action: string) => {
          const perm = `${module}:${action}`;
          finalPermissionsSet.delete(perm);
        });

        // Handle addFields/removeFields (convert to custom_fields, custom_form, custom_value if needed)
        // Note: fields are not directly permissions, but we can add them as custom_fields permission
        const addFields: string[] = custom.addFields || custom.fields || [];
        const removeFields: string[] = custom.removeFields || [];
        
        if (addFields.length > 0) {
          const perm = `${module}:custom_fields`;
          if (perm.startsWith('settings:') || allowedPermissions.includes(perm)) {
            finalPermissionsSet.add(perm);
          }
        }
        if (removeFields.length > 0) {
          // If removing fields, we might want to remove custom_fields permission
          // But this is context-dependent, so we'll leave it for now
        }
      });

      // Convert Set back to array
      const finalPermissions = Array.from(finalPermissionsSet);

      // Store in jwtPermissions format (module:action)
      set({ jwtPermissions: finalPermissions });

      // Also parse into module-based structure for backward compatibility
      const modulePerms: Record<string, PermissionDetail> = {};
      
      finalPermissions.forEach((perm) => {
        const parts = perm.split(':');
        if (parts.length !== 2) return;
        
        const [module, action] = parts as [string, string];
        
        if (!modulePerms[module]) {
          modulePerms[module] = { actions: [], fields: [], notifications: [] };
        }
        
        if (!modulePerms[module].actions.includes(action)) {
          modulePerms[module].actions.push(action);
        }
      });

      set({ modulePermissions: modulePerms });
    });
  },
  
  clearPermissions: () => {
    set({ jwtPermissions: [], modulePermissions: {} });
  },
}));

export default usePermissionStore;


