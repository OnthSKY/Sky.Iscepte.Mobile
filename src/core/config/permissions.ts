export type Permission = string;

export type Role = 'admin' | 'manager' | 'user' | 'guest';

export interface ModulePermissionConfig {
  module: string;
  permissions: Permission[];
}

export interface RolePermissionsMap {
  [role in Role]?: Permission[];
}

// Base permission registry – extend per module
export const permissionsRegistry: ModulePermissionConfig[] = [
  { module: 'sales', permissions: ['sales:view', 'sales:create', 'sales:edit'] },
  { module: 'customers', permissions: ['customers:view', 'customers:create', 'customers:edit'] },
  { module: 'expenses', permissions: ['expenses:view', 'expenses:create', 'expenses:edit'] },
  { module: 'reports', permissions: ['reports:view'] },
  { module: 'employees', permissions: ['employees:view', 'employees:create', 'employees:edit'] },
];

export const rolePermissions: RolePermissionsMap = {
  admin: permissionsRegistry.flatMap((m) => m.permissions),
  manager: ['sales:view', 'sales:create', 'customers:view', 'customers:create', 'expenses:view', 'expenses:create', 'reports:view'],
  user: ['sales:view', 'customers:view', 'expenses:view'],
  guest: [],
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  const list = rolePermissions[role] || [];
  return list.includes(permission);
};


