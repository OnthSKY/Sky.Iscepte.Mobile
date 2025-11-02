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
  { 
    module: 'sales', 
    permissions: ['sales:view', 'sales:create', 'sales:edit', 'sales:delete', 'sales:custom_fields', 'sales:custom_form', 'sales:custom_value']
  },
  { 
    module: 'customers', 
    permissions: ['customers:view', 'customers:create', 'customers:edit', 'customers:delete', 'customers:custom_fields', 'customers:custom_form', 'customers:custom_value']
  },
  { 
    module: 'suppliers', 
    permissions: ['suppliers:view', 'suppliers:create', 'suppliers:edit', 'suppliers:delete', 'suppliers:custom_fields', 'suppliers:custom_form', 'suppliers:custom_value']
  },
  { 
    module: 'expenses', 
    permissions: ['expenses:view', 'expenses:create', 'expenses:edit', 'expenses:delete', 'expenses:custom_fields', 'expenses:custom_form', 'expenses:custom_value']
  },
  { 
    module: 'revenue', 
    permissions: ['revenue:view', 'revenue:create', 'revenue:edit', 'revenue:delete', 'revenue:custom_fields', 'revenue:custom_form', 'revenue:custom_value']
  },
  { 
    module: 'reports', 
    permissions: ['reports:view']
  }, // Reports doesn't have create/edit/delete
  { 
    module: 'employees', 
    permissions: ['employees:view', 'employees:create', 'employees:edit', 'employees:delete', 'employees:custom_fields', 'employees:custom_form', 'employees:custom_value']
  },
  { 
    module: 'stock', 
    permissions: ['stock:view', 'stock:create', 'stock:edit', 'stock:delete', 'stock:custom_fields', 'stock:custom_form', 'stock:custom_value']
  },
  { 
    module: 'purchases', 
    permissions: ['purchases:view', 'purchases:create', 'purchases:edit', 'purchases:delete', 'purchases:custom_fields', 'purchases:custom_form', 'purchases:custom_value']
  },
  { 
    module: 'income', 
    permissions: ['income:view', 'income:create', 'income:edit', 'income:delete', 'income:custom_fields', 'income:custom_form', 'income:custom_value']
  },
  { 
    module: 'settings', 
    permissions: ['settings:view', 'settings:manage']
  },
];

export const rolePermissions: RolePermissionsMap = {
  [Role.ADMIN]: permissionsRegistry.flatMap((m) => m.permissions),
  [Role.OWNER]: [
    'sales:view', 'sales:create', 'sales:edit', 'sales:delete', 'sales:custom_fields', 'sales:custom_form', 'sales:custom_value',
    'customers:view', 'customers:create', 'customers:edit', 'customers:delete', 'customers:custom_fields', 'customers:custom_form', 'customers:custom_value',
    'suppliers:view', 'suppliers:create', 'suppliers:edit', 'suppliers:delete', 'suppliers:custom_fields', 'suppliers:custom_form', 'suppliers:custom_value',
    'expenses:view', 'expenses:create', 'expenses:edit', 'expenses:delete', 'expenses:custom_fields', 'expenses:custom_form', 'expenses:custom_value',
    'revenue:view', 'revenue:create', 'revenue:edit', 'revenue:delete', 'revenue:custom_fields', 'revenue:custom_form', 'revenue:custom_value',
    'employees:view', 'employees:create', 'employees:edit', 'employees:delete', 'employees:custom_fields', 'employees:custom_form', 'employees:custom_value',
    'reports:view',
    'stock:view', 'stock:create', 'stock:edit', 'stock:delete', 'stock:custom_fields', 'stock:custom_form', 'stock:custom_value',
    'purchases:view', 'purchases:create', 'purchases:edit', 'purchases:delete', 'purchases:custom_fields', 'purchases:custom_form', 'purchases:custom_value',
    'income:view', 'income:create', 'income:edit', 'income:delete', 'income:custom_fields', 'income:custom_form', 'income:custom_value',
    'settings:view', 'settings:manage',
  ],
  [Role.STAFF]: [
    'sales:view', 'sales:create', 'sales:custom_value',
    'customers:view', 'customers:create', 'customers:custom_value',
    'suppliers:view', 'suppliers:create', 'suppliers:custom_value',
    'expenses:view', 'expenses:create', 'expenses:custom_value',
    'revenue:view', 'revenue:create', 'revenue:custom_value', // STAFF can also create revenue
    'reports:view',
    'stock:view', 'stock:custom_value',
    'purchases:view', 'purchases:create', 'purchases:custom_value',
    'income:view', 'income:create', 'income:custom_value',
  ],
  [Role.GUEST]: [],
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  const list = rolePermissions[role] || [];
  return list.includes(permission);
};
