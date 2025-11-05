import { permissionsRegistry } from '../../../core/config/permissions';
import packages from '../../../mocks/packages.json';

/**
 * Permission constants - shared across employee form and permissions screens
 */
export const ALL_FIELDS = ['category', 'price', 'group', 'phone', 'expenseType', 'amount', 'role', 'dateRange'];
export const ALL_NOTIFICATIONS = ['dailyReport', 'lowStock'];

/**
 * Get all possible actions from permissions registry
 */
export const getAllActions = (): string[] => {
  const actions = new Set<string>();
  permissionsRegistry.forEach(module => {
    module.permissions.forEach(permission => {
      const action = permission.split(':')[1];
      if (action) actions.add(action);
    });
  });
  return Array.from(actions);
};

/**
 * Get module actions from permissions registry
 * @param moduleKey - Module key (e.g., 'sales', 'stock', 'reports')
 * @returns Array of action strings (e.g., ['view', 'create', 'edit', 'delete'])
 */
export const getModuleActions = (moduleKey: string): string[] => {
  const modulePerms = permissionsRegistry.find(m => m.module === moduleKey);
  if (!modulePerms) {
    // Default actions for unknown modules
    return ['view', 'create', 'edit', 'delete'];
  }

  // Extract actions from permissions (e.g., 'sales:view' -> 'view')
  const actions = modulePerms.permissions
    .map(p => p.split(':')[1])
    .filter((a): a is string => !!a);

  // Reports only has view
  if (moduleKey === 'reports') return ['view'];

  // Always include delete if not already present (for backward compatibility)
  // Note: This should not be needed if permissionsRegistry has delete for all modules
  if (!actions.includes('delete') && moduleKey !== 'reports' && moduleKey !== 'settings') {
    actions.push('delete');
  }

  return Array.from(new Set(actions));
};

/**
 * Get owner's package allowed permissions
 * Filters available actions based on owner's package
 * @param ownerPackageId - Owner's package ID (e.g., 'free', 'premium', 'premium+', 'gold')
 * @returns Array of allowed permission strings (e.g., ['sales:view', 'sales:create', ...])
 */
export const getOwnerPackagePermissions = (ownerPackageId: string): string[] => {
  const pkg = (packages as any[]).find((p: any) => p.id === ownerPackageId);
  return pkg?.allowedPermissions || [];
};

/**
 * Filter module actions based on owner's package permissions
 * Owner can only grant permissions that are allowed by their package
 * @param moduleKey - Module key (e.g., 'sales', 'stock')
 * @param ownerPackageId - Owner's package ID
 * @returns Array of allowed actions for this module based on owner's package
 */
export const getModuleActionsFilteredByOwnerPackage = (
  moduleKey: string,
  ownerPackageId: string
): string[] => {
  // Get all possible actions for this module
  const allActions = getModuleActions(moduleKey);
  
  // Get owner's package allowed permissions
  const ownerPackagePermissions = getOwnerPackagePermissions(ownerPackageId);
  
  // Filter actions to only include those allowed by owner's package
  const allowedActions = allActions.filter(action => {
    const permission = `${moduleKey}:${action}`;
    return ownerPackagePermissions.includes(permission);
  });
  
  return allowedActions;
};

/**
 * Check if a permission is allowed by owner's package
 * @param permission - Permission string (e.g., 'sales:edit')
 * @param ownerPackageId - Owner's package ID
 * @returns boolean
 */
export const isPermissionAllowedByOwnerPackage = (
  permission: string,
  ownerPackageId: string
): boolean => {
  const ownerPackagePermissions = getOwnerPackagePermissions(ownerPackageId);
  return ownerPackagePermissions.includes(permission);
};

