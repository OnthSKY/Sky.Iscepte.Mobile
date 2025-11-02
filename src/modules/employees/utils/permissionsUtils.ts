import { permissionsRegistry } from '../../../core/config/permissions';

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

