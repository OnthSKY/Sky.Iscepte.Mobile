import { useMemo } from 'react';
import { hasPermission } from '../config/permissions';
import { Role } from '../config/appConstants';
import { usePermissionStore } from '../../store/permissionsStore';

export const usePermissions = (role: Role) => {
  const jwtPermissions = usePermissionStore((s) => s.jwtPermissions);
  const modulePermissions = usePermissionStore((s) => s.modulePermissions);

  // Check if permissions are loaded (either from JWT or module permissions)
  const arePermissionsLoaded = useMemo(() => {
    return jwtPermissions.length > 0 || Object.keys(modulePermissions).length > 0;
  }, [jwtPermissions.length, Object.keys(modulePermissions).length]);

  const checkPermission = (permission: string): boolean => {
    // If permissions are not loaded yet, assume user has permission (to avoid false negatives)
    // This prevents showing "no permission" errors when permissions are still loading
    if (!arePermissionsLoaded) {
      return true;
    }

    // First check JWT permissions (primary source)
    if (jwtPermissions.includes(permission)) {
      return true;
    }
    
    // Fallback to role-based permissions
    if (hasPermission(role, permission)) {
      return true;
    }
    
    // Fallback to module-based structure (backward compatibility)
    const parts = permission.split(':');
    if (parts.length !== 2) return false;
    const [module, action] = parts as [string, string];
    const modPerm = (modulePermissions as any)[module];
    if (!modPerm) return false;
    // Actions from overrides can include custom values like custom_form/custom_fields/custom_value
    return Array.isArray(modPerm.actions) && modPerm.actions.includes(action);
  };

  return useMemo(
    () => ({
      can: (permission: string) => checkPermission(permission),
      canAny: (permissions: string[]) => permissions.some(p => checkPermission(p)),
      role,
      arePermissionsLoaded, // Expose loading state
    }),
    [role, jwtPermissions, modulePermissions, arePermissionsLoaded]
  );
};

export default usePermissions;


