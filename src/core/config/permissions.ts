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
    permissions: ['sales:view', 'sales:create', 'sales:edit', 'sales:delete', 'sales:custom_fields', 'sales:custom_form', 'sales:custom_value', 'sales:calendar']
  },
  { 
    module: 'customers', 
    permissions: ['customers:view', 'customers:create', 'customers:edit', 'customers:delete', 'customers:custom_fields', 'customers:custom_form', 'customers:custom_value', 'customers:calendar']
  },
  { 
    module: 'suppliers', 
    permissions: ['suppliers:view', 'suppliers:create', 'suppliers:edit', 'suppliers:delete', 'suppliers:custom_fields', 'suppliers:custom_form', 'suppliers:custom_value', 'suppliers:calendar']
  },
  { 
    module: 'expenses', 
    permissions: ['expenses:view', 'expenses:create', 'expenses:edit', 'expenses:delete', 'expenses:custom_fields', 'expenses:custom_form', 'expenses:custom_value', 'expenses:calendar']
  },
  { 
    module: 'revenue', 
    permissions: ['revenue:view', 'revenue:create', 'revenue:edit', 'revenue:delete', 'revenue:custom_fields', 'revenue:custom_form', 'revenue:custom_value', 'revenue:calendar']
  },
  { 
    module: 'reports', 
    permissions: ['reports:view', 'reports:calendar']
  }, // Reports doesn't have create/edit/delete
  { 
    module: 'employees', 
    permissions: ['employees:view', 'employees:create', 'employees:edit', 'employees:delete', 'employees:custom_fields', 'employees:custom_form', 'employees:custom_value', 'employees:calendar']
  },
  { 
    module: 'stock', 
    permissions: ['stock:view', 'stock:create', 'stock:edit', 'stock:delete', 'stock:custom_fields', 'stock:custom_form', 'stock:custom_value', 'stock:calendar']
  },
  { 
    module: 'purchases', 
    permissions: ['purchases:view', 'purchases:create', 'purchases:edit', 'purchases:delete', 'purchases:custom_fields', 'purchases:custom_form', 'purchases:custom_value', 'purchases:calendar']
  },
  { 
    module: 'settings', 
    permissions: ['settings:view', 'settings:manage']
  },
  { 
    module: 'calendar', 
    permissions: ['calendar:view']
  },
];

export const rolePermissions: RolePermissionsMap = {
  [Role.ADMIN]: permissionsRegistry.flatMap((m) => m.permissions),
  [Role.OWNER]: [
    'sales:view', 'sales:create', 'sales:edit', 'sales:delete',
    'sales:custom_fields', 'sales:custom_form', 'sales:custom_value', 'sales:calendar',
    'customers:view', 'customers:create', 'customers:edit', 'customers:delete',
    'customers:custom_fields', 'customers:custom_form', 'customers:custom_value', 'customers:calendar',
    'suppliers:view', 'suppliers:create', 'suppliers:edit', 'suppliers:delete',
    'suppliers:custom_fields', 'suppliers:custom_form', 'suppliers:custom_value', 'suppliers:calendar',
    'expenses:view', 'expenses:create', 'expenses:edit', 'expenses:delete',
    'expenses:custom_fields', 'expenses:custom_form', 'expenses:custom_value', 'expenses:calendar',
    'revenue:view', 'revenue:create', 'revenue:edit', 'revenue:delete',
    'revenue:custom_fields', 'revenue:custom_form', 'revenue:custom_value', 'revenue:calendar',
    'employees:view', 'employees:create', 'employees:edit', 'employees:delete',
    'employees:custom_fields', 'employees:custom_form', 'employees:custom_value', 'employees:calendar',
    'reports:view', 'reports:calendar',
    'stock:view', 'stock:create', 'stock:edit', 'stock:delete',
    'stock:custom_fields', 'stock:custom_form', 'stock:custom_value', 'stock:calendar',
    'purchases:view', 'purchases:create', 'purchases:edit', 'purchases:delete',
    'purchases:custom_fields', 'purchases:custom_form', 'purchases:custom_value', 'purchases:calendar',
    'settings:view', 'settings:manage',
    'calendar:view',
  ],
  [Role.STAFF]: [
    'sales:view', 'sales:create', 'sales:custom_value', 'sales:calendar',
    'customers:view', 'customers:create', 'customers:custom_value', 'customers:calendar',
    'suppliers:view', 'suppliers:create', 'suppliers:custom_value', 'suppliers:calendar',
    'expenses:view', 'expenses:create', 'expenses:custom_value', 'expenses:calendar',
    'revenue:view', 'revenue:create', 'revenue:custom_value', 'revenue:calendar', // STAFF can also create revenue
    'reports:view', 'reports:calendar',
    'stock:view', 'stock:custom_value', 'stock:calendar',
    'purchases:view', 'purchases:create', 'purchases:custom_value', 'purchases:calendar',
    'calendar:view',
  ],
  [Role.GUEST]: [],
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  const list = rolePermissions[role] || [];
  return list.includes(permission);
};
