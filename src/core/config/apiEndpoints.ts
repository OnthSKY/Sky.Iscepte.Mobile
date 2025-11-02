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
  modules: modulesEndpoints,
  dashboard: dashboardEndpoints,
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

