// Import Role for use in this file
import { Role } from './appConstants';

export type Permission = string;

export interface ModulePermissionConfig {
  module: string;
  permissions: Permission[];
}

export type RolePermissionsMap = {
  [role in Role]: Permission[];
};

// Base permission registry – extend per module
export const permissionsRegistry: ModulePermissionConfig[] = [
  { module: 'sales', permissions: ['sales:view', 'sales:create', 'sales:edit'] },
  { module: 'customers', permissions: ['customers:view', 'customers:create', 'customers:edit'] },
  { module: 'expenses', permissions: ['expenses:view', 'expenses:create', 'expenses:edit'] },
  { module: 'reports', permissions: ['reports:view'] },
  { module: 'employees', permissions: ['employees:view', 'employees:create', 'employees:edit'] },
  { module: 'stock', permissions: ['stock:view', 'stock:create', 'stock:edit'] },
  { module: 'purchases', permissions: ['purchases:view', 'purchases:create', 'purchases:edit'] },
  { module: 'settings', permissions: ['settings:view', 'settings:manage'] },
];

export const rolePermissions: RolePermissionsMap = {
  [Role.ADMIN]: permissionsRegistry.flatMap((m) => m.permissions),
  [Role.OWNER]: [
    'sales:view', 'sales:create', 'sales:edit',
    'customers:view', 'customers:create', 'customers:edit',
    'expenses:view', 'expenses:create', 'expenses:edit',
    'employees:view', 'employees:create', 'employees:edit',
    'reports:view',
    'stock:view', 'stock:create', 'stock:edit',
    'purchases:view', 'purchases:create', 'purchases:edit',
    'settings:view', 'settings:manage',
  ],
  [Role.STAFF]: [
    'sales:view', 'sales:create',
    'customers:view', 'customers:create',
    'expenses:view', 'expenses:create',
    'reports:view',
    'stock:view',
    'purchases:view', 'purchases:create',
  ],
  [Role.GUEST]: [],
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  const list = rolePermissions[role] || [];
  return list.includes(permission);
};
