/**
 * API Endpoints Configuration
 * 
 * Centralized endpoint management for all modules
 * Each module defines its own endpoints, allowing for easy expansion
 * 
 * Structure:
 * - Module-based organization
 * - Each module can have role-specific endpoints if needed
 * - Functions for dynamic endpoints (with IDs)
 * - Consistent naming across modules
 */

/**
 * Authentication endpoints
 */
export const authEndpoints = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
} as const;

/**
 * User endpoints
 */
export const userEndpoints = {
  profile: '/users/me',
  updateProfile: '/users/me',
} as const;

/**
 * Sales module endpoints
 */
export const salesEndpoints = {
  list: '/sales',
  get: (id: string | number) => `/sales/${id}`,
  stats: '/sales/stats',
  create: '/sales',
  update: (id: string | number) => `/sales/${id}`,
  remove: (id: string | number) => `/sales/${id}`,
  report: '/sales/report',
  debtList: '/sales/debt', // Borçlu satışlar listesi
  markAsPaid: (id: string | number) => `/sales/${id}/mark-paid`, // Ödeme alındı işaretle
} as const;

/**
 * Customers module endpoints
 */
export const customersEndpoints = {
  list: '/customers',
  get: (id: string | number) => `/customers/${id}`,
  stats: '/customers/stats',
  create: '/customers',
  update: (id: string | number) => `/customers/${id}`,
  remove: (id: string | number) => `/customers/${id}`,
  report: '/customers/report',
} as const;

/**
 * Stock module endpoints
 */
export const stockEndpoints = {
  list: '/stock',
  get: (id: string | number) => `/stock/${id}`,
  stats: '/stock/stats',
  create: '/stock',
  update: (id: string | number) => `/stock/${id}`,
  remove: (id: string | number) => `/stock/${id}`,
  history: (id: string | number) => `/stock/${id}/history`,
  alertSettings: '/stock/alert-settings',
  report: '/stock/report',
} as const;

/**
 * Purchases module endpoints
 */
export const purchasesEndpoints = {
  list: '/purchases',
  get: (id: string | number) => `/purchases/${id}`,
  stats: '/purchases/stats',
  create: '/purchases',
  update: (id: string | number) => `/purchases/${id}`,
  remove: (id: string | number) => `/purchases/${id}`,
  report: '/purchases/report',
} as const;

/**
 * Expenses module endpoints
 */
export const expensesEndpoints = {
  list: '/expenses',
  get: (id: string | number) => `/expenses/${id}`,
  stats: '/expenses/stats',
  create: '/expenses',
  update: (id: string | number) => `/expenses/${id}`,
  remove: (id: string | number) => `/expenses/${id}`,
  report: '/expenses/report',
} as const;

/**
 * Revenue module endpoints
 */
export const revenueEndpoints = {
  list: '/revenue',
  get: (id: string | number) => `/revenue/${id}`,
  stats: '/revenue/stats',
  create: '/revenue',
  update: (id: string | number) => `/revenue/${id}`,
  remove: (id: string | number) => `/revenue/${id}`,
  report: '/revenue/report',
} as const;

/**
 * Employees module endpoints
 */
export const employeesEndpoints = {
  list: '/employees',
  get: (id: string | number) => `/employees/${id}`,
  stats: '/employees/stats',
  create: '/employees',
  update: (id: string | number) => `/employees/${id}`,
  remove: (id: string | number) => `/employees/${id}`,
  report: '/employees/report',
} as const;

/**
 * Staff Permission Groups endpoints
 */
export const permissionGroupsEndpoints = {
  list: '/staff-permission-groups',
  get: (id: string | number) => `/staff-permission-groups/${id}`,
  create: '/staff-permission-groups',
  update: (id: string | number) => `/staff-permission-groups/${id}`,
  remove: (id: string | number) => `/staff-permission-groups/${id}`,
} as const;

/**
 * Reports module endpoints
 */
export const reportsEndpoints = {
  list: '/reports',
  get: (id: string | number) => `/reports/${id}`,
  stats: '/reports/stats',
  create: '/reports',
  update: (id: string | number) => `/reports/${id}`,
  remove: (id: string | number) => `/reports/${id}`,
} as const;

/**
 * Suppliers module endpoints
 */
export const suppliersEndpoints = {
  list: '/suppliers',
  get: (id: string | number) => `/suppliers/${id}`,
  stats: '/suppliers/stats',
  create: '/suppliers',
  update: (id: string | number) => `/suppliers/${id}`,
  remove: (id: string | number) => `/suppliers/${id}`,
  report: '/suppliers/report',
} as const;

/**
 * Modules endpoint (for navigation/config)
 */
export const modulesEndpoints = {
  list: '/modules',
  get: (id: string | number) => `/modules/${id}`,
} as const;

/**
 * Dashboard endpoints
 */
export const dashboardEndpoints = {
  owner: {
    storeSummary: (period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all') => `/dashboard/owner/store-summary?period=${period}`,
    employeeSummary: (employeeId?: string | number, period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all') => {
      const params = new URLSearchParams();
      if (employeeId) params.append('employeeId', String(employeeId));
      params.append('period', period);
      return `/dashboard/owner/employee-summary?${params.toString()}`;
    },
    topProducts: (period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all', limit: number = 10) => `/dashboard/owner/top-products?period=${period}&limit=${limit}`,
  },
} as const;

/**
 * Accounting endpoints
 */
export const accountingEndpoints = {
  summary: (period: 'day' | 'week' | 'month' | 'year' = 'month') => `/accounting/summary?period=${period}`,
  detailedReport: (period: 'day' | 'week' | 'month' | 'year' | 'all' = 'month') => `/accounting/detailed-report?period=${period}`,
  balanceSheet: (date?: string) => date ? `/accounting/balance-sheet?date=${date}` : `/accounting/balance-sheet`,
  profitLoss: (period: 'day' | 'week' | 'month' | 'year' | 'all' = 'month') => `/accounting/profit-loss?period=${period}`,
} as const;

/**
 * Form Templates endpoints
 */
export const formTemplateEndpoints = {
  list: (module: string) => `/form-templates/${module}`,
  get: (module: string, id: string | number) => `/form-templates/${module}/${id}`,
  create: (module: string) => `/form-templates/${module}`,
  update: (module: string, id: string | number) => `/form-templates/${module}/${id}`,
  remove: (module: string, id: string | number) => `/form-templates/${module}/${id}`,
  clone: (module: string, id: string | number) => `/form-templates/${module}/${id}/clone`,
  setDefault: (module: string, id: string | number) => `/form-templates/${module}/${id}/set-default`,
} as const;

/**
 * Verification endpoints (TC Kimlik, IMEI)
 */
export const verificationEndpoints = {
  verifyTC: '/verification/tc/verify',
  verifyIMEI: '/verification/imei/verify',
} as const;

/**
 * All endpoints grouped by module
 * 
 * Usage:
 * ```typescript
 * import { apiEndpoints } from '@/core/config/apiEndpoints';
 * const url = apiEndpoints.sales.get(saleId);
 * ```
 */
export const apiEndpoints = {
  auth: authEndpoints,
  user: userEndpoints,
  sales: salesEndpoints,
  customers: customersEndpoints,
  stock: stockEndpoints,
  purchases: purchasesEndpoints,
  expenses: expensesEndpoints,
  revenue: revenueEndpoints,
  employees: employeesEndpoints,
  reports: reportsEndpoints,
  suppliers: suppliersEndpoints,
  modules: modulesEndpoints,
  dashboard: dashboardEndpoints,
  accounting: accountingEndpoints,
  permissionGroups: permissionGroupsEndpoints,
  formTemplates: formTemplateEndpoints,
  verification: verificationEndpoints,
} as const;

/**
 * Type helper for endpoint functions
 */
export type EndpointFunction = (id: string | number) => string;

/**
 * Get endpoint with role-specific logic if needed
 * 
 * Example usage for role-specific endpoints:
 * ```typescript
 * export const salesEndpointsByRole = {
 *   admin: { ...salesEndpoints },
 *   owner: { 
 *     ...salesEndpoints,
 *     customAction: '/sales/custom-action' // owner-only endpoint
 *   }
 * }
 * ```
 */
export type ApiEndpoints = typeof apiEndpoints;
