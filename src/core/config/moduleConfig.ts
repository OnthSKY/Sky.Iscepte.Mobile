/**
 * Module Configuration
 * Centralized configuration for all modules including routes, permissions, icons, and translations
 */

export interface ModuleConfig {
  key: string;
  routeName: string;
  dashboardRoute?: string;
  icon: string;
  requiredPermission: string;
  translationNamespace: string;
  translationKey: string; // Key for module name translation (e.g., 'module_name' or 'module')
  quickActions?: QuickActionConfig[];
  dependencies?: string[]; // Array of module keys that this module depends on (e.g., ['customers', 'suppliers'])
}

export interface QuickActionConfig {
  key: string;
  routeName: string;
  icon: string;
  requiredPermission: string;
  translationNamespace: string;
  translationKey: string; // Key for quick action label (e.g., 'new_sale')
  fallbackRoute?: string; // Fallback route if create route is not available
}

/**
 * All modules configuration
 */
export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    key: 'stock',
    routeName: 'Stock',
    dashboardRoute: 'StockDashboard',
    icon: 'cube-outline',
    requiredPermission: 'stock:view',
    translationNamespace: 'stock',
    translationKey: 'module_name',
    dependencies: ['purchases', 'sales'], // Stock production depends on purchases and sales
    quickActions: [
      {
        key: 'qa-stock',
        routeName: 'StockCreate',
        icon: 'cube-outline',
        requiredPermission: 'stock:create',
        translationNamespace: 'stock',
        translationKey: 'new_stock',
        fallbackRoute: 'Stock',
      },
    ],
  },
  {
    key: 'purchases',
    routeName: 'Purchases',
    dashboardRoute: 'PurchasesDashboard',
    icon: 'cart-outline',
    requiredPermission: 'purchases:view',
    translationNamespace: 'purchases',
    translationKey: 'module_name',
    dependencies: ['suppliers', 'stock'], // Purchases depends on suppliers and stock
    quickActions: [
      {
        key: 'qa-purchase',
        routeName: 'PurchaseCreate',
        icon: 'cart-outline',
        requiredPermission: 'purchases:create',
        translationNamespace: 'purchases',
        translationKey: 'new_purchase',
        fallbackRoute: 'Purchases',
      },
    ],
  },
  {
    key: 'sales',
    routeName: 'Sales',
    dashboardRoute: 'SalesDashboard',
    icon: 'pricetag-outline',
    requiredPermission: 'sales:view',
    translationNamespace: 'sales',
    translationKey: 'module_name',
    dependencies: ['customers', 'stock'], // Sales depends on customers and stock
    quickActions: [
      {
        key: 'qa-sale',
        routeName: 'SalesCreate',
        icon: 'pricetag-outline',
        requiredPermission: 'sales:create',
        translationNamespace: 'sales',
        translationKey: 'new_sale',
        fallbackRoute: 'Sales',
      },
    ],
  },
  {
    key: 'customers',
    routeName: 'Customers',
    dashboardRoute: 'CustomersDashboard',
    icon: 'people-outline',
    requiredPermission: 'customers:view',
    translationNamespace: 'customers',
    translationKey: 'module_name',
    quickActions: [
      {
        key: 'qa-customer',
        routeName: 'CustomerCreate',
        icon: 'person-add-outline',
        requiredPermission: 'customers:create',
        translationNamespace: 'customers',
        translationKey: 'new_customer',
        fallbackRoute: 'Customers',
      },
    ],
  },
  {
    key: 'suppliers',
    routeName: 'Suppliers',
    dashboardRoute: 'SuppliersDashboard',
    icon: 'storefront-outline',
    requiredPermission: 'suppliers:view',
    translationNamespace: 'suppliers',
    translationKey: 'module_name',
    quickActions: [
      {
        key: 'qa-supplier',
        routeName: 'SupplierCreate',
        icon: 'storefront-outline',
        requiredPermission: 'suppliers:create',
        translationNamespace: 'suppliers',
        translationKey: 'new_supplier',
        fallbackRoute: 'Suppliers',
      },
    ],
  },
  {
    key: 'expenses',
    routeName: 'Expenses',
    dashboardRoute: 'ExpensesDashboard',
    icon: 'wallet-outline',
    requiredPermission: 'expenses:view',
    translationNamespace: 'expenses',
    translationKey: 'module_name',
    quickActions: [
      {
        key: 'qa-expense',
        routeName: 'ExpenseCreate',
        icon: 'wallet-outline',
        requiredPermission: 'expenses:create',
        translationNamespace: 'expenses',
        translationKey: 'new_expense',
        fallbackRoute: 'Expenses',
      },
    ],
  },
  {
    key: 'revenue',
    routeName: 'Revenue',
    dashboardRoute: 'RevenueDashboard',
    icon: 'trending-up-outline',
    requiredPermission: 'revenue:view',
    translationNamespace: 'revenue',
    translationKey: 'module_name',
    quickActions: [
      {
        key: 'qa-revenue',
        routeName: 'RevenueCreate',
        icon: 'trending-up-outline',
        requiredPermission: 'revenue:create',
        translationNamespace: 'revenue',
        translationKey: 'new_revenue',
        fallbackRoute: 'Revenue',
      },
    ],
  },
  {
    key: 'employees',
    routeName: 'Employees',
    dashboardRoute: 'EmployeesDashboard',
    icon: 'person-outline',
    requiredPermission: 'employees:view',
    translationNamespace: 'employees',
    translationKey: 'module_name',
    quickActions: [
      {
        key: 'qa-employee',
        routeName: 'EmployeeCreate',
        icon: 'briefcase-outline',
        requiredPermission: 'employees:create',
        translationNamespace: 'settings',
        translationKey: 'new_employee',
        fallbackRoute: 'Employees',
      },
    ],
  },
  {
    key: 'reports',
    routeName: 'Reports',
    dashboardRoute: 'ReportsDashboard',
    icon: 'bar-chart-outline',
    requiredPermission: 'reports:view',
    translationNamespace: 'reports',
    translationKey: 'module_name',
    // Reports module doesn't have create quick action
  },
  {
    key: 'calendar',
    routeName: 'Calendar',
    dashboardRoute: 'Calendar',
    icon: 'calendar-outline',
    requiredPermission: 'calendar:view',
    translationNamespace: 'calendar',
    translationKey: 'module_name',
  },
];

/**
 * Get all quick actions from all modules
 */
export const ALL_QUICK_ACTIONS: QuickActionConfig[] = MODULE_CONFIGS.flatMap(
  (module) => module.quickActions || []
);

/**
 * Get module config by key
 */
export const getModuleConfig = (key: string): ModuleConfig | undefined => {
  return MODULE_CONFIGS.find((module) => module.key === key);
};

/**
 * Get module config by route name
 */
export const getModuleConfigByRoute = (routeName: string): ModuleConfig | undefined => {
  return MODULE_CONFIGS.find(
    (module) => module.routeName === routeName || module.dashboardRoute === routeName
  );
};

/**
 * Get quick action config by route name
 */
export const getQuickActionConfig = (routeName: string): QuickActionConfig | undefined => {
  return ALL_QUICK_ACTIONS.find((qa) => qa.routeName === routeName);
};

/**
 * Get fallback route for a quick action
 */
export const getQuickActionFallback = (routeName: string): string | undefined => {
  const qa = getQuickActionConfig(routeName);
  return qa?.fallbackRoute || getModuleConfigByRoute(routeName)?.routeName;
};

/**
 * Get missing dependencies for a module
 * Returns array of module keys that are required but not available
 */
export const getMissingDependencies = (
  moduleKey: string,
  availableModules: string[],
  permissions: { can: (permission: string) => boolean }
): string[] => {
  const moduleConfig = getModuleConfig(moduleKey);
  if (!moduleConfig || !moduleConfig.dependencies || moduleConfig.dependencies.length === 0) {
    return [];
  }

  const missing: string[] = [];
  
  for (const depKey of moduleConfig.dependencies) {
    const depConfig = getModuleConfig(depKey);
    if (!depConfig) continue; // Skip if dependency module doesn't exist in config
    
    // Check if module is available in routes
    const isAvailable = availableModules.includes(depConfig.routeName) || 
                       availableModules.includes(depConfig.dashboardRoute || '');
    
    // Check if user has permission
    const hasPermission = permissions.can(depConfig.requiredPermission);
    
    // If module is not available or user doesn't have permission, it's missing
    if (!isAvailable || !hasPermission) {
      missing.push(depKey);
    }
  }
  
  return missing;
};

