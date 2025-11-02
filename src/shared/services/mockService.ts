import customersSeed from '../../mocks/customers.json';
import expensesSeed from '../../mocks/expenses.json';
import productsSeed from '../../mocks/products.json'; // Keep import for backward compatibility, but treat as stock
import salesSeed from '../../mocks/sales.json';
import employeesSeed from '../../mocks/employees.json';
import expenseTypesSeed from '../../mocks/expenseTypes.json';
import suppliersSeed from '../../mocks/suppliers.json';
import purchasesSeed from '../../mocks/purchases.json';
import revenueSeed from '../../mocks/revenue.json';
import modules from '../../mocks/modules.json';
import roles from '../../mocks/roles.json';
import usersSeed from '../../mocks/users.json';
import { BaseControllerResponse, PaginatedData } from '../types/apiResponse';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type Entity = { id: number | string; [k: string]: any };

type Currency = 'TRY' | 'USD' | 'EUR';

// Mock currency conversion rates (to TRY)
const CURRENCY_RATES: Record<Currency, number> = {
  TRY: 1,
  USD: 35, // 1 USD = 35 TRY
  EUR: 38, // 1 EUR = 38 TRY
};

// Convert any currency amount to TRY
function convertToTRY(amount: number, currency: Currency = 'TRY'): number {
  return amount * CURRENCY_RATES[currency];
}

function createStore(seed: Entity[]) {
  let data: Entity[] = Array.isArray(seed) ? [...seed] : [];
  // Calculate next ID - handle both string and number IDs
  const maxId = data.reduce((m, x) => {
    if (typeof x.id === 'number') {
      return Math.max(m, x.id);
    } else if (typeof x.id === 'string') {
      const numId = parseInt(x.id, 10);
      return isNaN(numId) ? m : Math.max(m, numId);
    }
    return m;
  }, 0);
  let nextId = maxId + 1;
  
  return {
    list: () => data,
    get: (id: string) => data.find((x) => String(x.id) === id),
    create: (input: any) => {
      // Use string ID if existing data uses strings, otherwise use number
      const useStringId = data.length > 0 && typeof data[0].id === 'string';
      const entity = { 
        id: useStringId ? String(nextId++) : nextId++, 
        ...input 
      } as Entity;
      data.push(entity);
      return entity;
    },
    update: (id: string, input: any) => {
      const idx = data.findIndex((x) => String(x.id) === id);
      if (idx === -1) return null;
      data[idx] = { ...data[idx], ...input, id: data[idx].id };
      return data[idx];
    },
    remove: (id: string) => {
      const idx = data.findIndex((x) => String(x.id) === id);
      if (idx === -1) return false;
      data.splice(idx, 1);
      return true;
    },
  };
}

// Default permission groups seed
const defaultPermissionGroupsSeed = [
  {
    id: 'mobile-seller',
    name: 'Arabalı Satıcı',
    description: 'Seyyar satış yapabilen personel için yetki grubu',
    permissions: {
      sales: { actions: ['view', 'create'] },
      customers: { actions: ['view', 'create'] },
      products: { actions: ['view'] },
      reports: { actions: ['view'] },
    },
  },
  {
    id: 'store-seller',
    name: 'Dükkan Satıcısı',
    description: 'Dükkanda satış yapabilen personel için yetki grubu',
    permissions: {
      sales: { actions: ['view', 'create', 'edit'] },
      customers: { actions: ['view', 'create', 'edit'] },
      products: { actions: ['view'] },
      purchases: { actions: ['view'] },
      reports: { actions: ['view'] },
    },
  },
  {
    id: 'cashier',
    name: 'Kasa',
    description: 'Kasa işlemlerini yönetebilen personel için yetki grubu',
    permissions: {
      sales: { actions: ['view', 'create', 'edit'] },
      purchases: { actions: ['view', 'create', 'edit'] },
      expenses: { actions: ['view', 'create'] },
      revenue: { actions: ['view', 'create'] },
      customers: { actions: ['view'] },
      suppliers: { actions: ['view'] },
      products: { actions: ['view'] },
      reports: { actions: ['view'] },
    },
  },
  {
    id: 'warehouse',
    name: 'Depo',
    description: 'Depo işlemlerini yönetebilen personel için yetki grubu',
    permissions: {
      products: { actions: ['view', 'create', 'edit'] },
      purchases: { actions: ['view', 'create', 'edit'] },
      suppliers: { actions: ['view', 'create'] },
      stock: { actions: ['view', 'create', 'edit'] },
      reports: { actions: ['view'] },
    },
  },
  {
    id: 'sales-manager',
    name: 'Satış Müdürü',
    description: 'Satış işlemlerini tam olarak yönetebilen personel için yetki grubu',
    permissions: {
      sales: { actions: ['view', 'create', 'edit', 'delete'] },
      customers: { actions: ['view', 'create', 'edit', 'delete'] },
      products: { actions: ['view'] },
      reports: { actions: ['view'] },
    },
  },
];

// Default purchase types seed
const defaultPurchaseTypesSeed = [
  { id: '1', name: 'Elektronik Alışı' },
  { id: '2', name: 'Hammadde Alışı' },
  { id: '3', name: 'Aksesuar Alışı' },
];

const stores = {
  customers: createStore(customersSeed as unknown as Entity[]),
  expenses: createStore(expensesSeed as unknown as Entity[]),
  stock: createStore(productsSeed as unknown as Entity[]),
  products: createStore(productsSeed as unknown as Entity[]), // Keep for backward compatibility
  sales: createStore(salesSeed as unknown as Entity[]),
  employees: createStore(employeesSeed as unknown as Entity[]),
  expenseTypes: createStore(expenseTypesSeed as unknown as Entity[]),
  suppliers: createStore(suppliersSeed as unknown as Entity[]),
  purchases: createStore(purchasesSeed as unknown as Entity[]),
  revenue: createStore(revenueSeed as unknown as Entity[]),
  'purchase-types': createStore(defaultPurchaseTypesSeed as unknown as Entity[]),
  modules: { list: () => modules },
  roles: { list: () => roles },
  users: createStore(usersSeed as unknown as Entity[]),
  'staff-permission-groups': createStore(defaultPermissionGroupsSeed as unknown as Entity[]),
} as const;

// Extract user ID from token
function extractUserIdFromToken(token: string | null | undefined): number | null {
  if (!token) return null;
  
  // Token format: "mock-access-token-{userId}" or "mock-refresh-token-{userId}"
  const match = token.match(/(?:mock-access-token|mock-refresh-token)-(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  // Try to find user ID in token (for backward compatibility)
  const userIdMatch = token.match(/userId[=:](\d+)/);
  if (userIdMatch && userIdMatch[1]) {
    return parseInt(userIdMatch[1], 10);
  }
  
  return null;
}

// Get current user's owner ID from access token
async function getCurrentOwnerIdFromToken(token: string | null | undefined): Promise<number | null> {
  const userId = extractUserIdFromToken(token);
  
  if (!userId) {
    // If no user ID in token, return null (admin or not authenticated)
    return null;
  }
  
  // Find user by ID
  const user = (usersSeed as any[]).find((u: any) => u.id === userId);
  if (!user) {
    return null;
  }
  
  // Admin sees all data
  if (user.role === 'admin') {
    return null;
  }
  
  // If user is owner, use their own ID; if staff, use their ownerId
  const ownerId = user.role === 'owner' ? user.id : (user.ownerId || null);
  return ownerId;
}

// Auth mock handler
function handleAuthRequest<T>(method: HttpMethod, url: string, body?: any, authToken?: string): Promise<T> {
  // Simulate async delay
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url === '/auth/login' && method === 'POST') {
        const { username, password } = body || {};
        
        // Simple mock authentication for demo roles
        if (password === '1234') {
          // Find user by username
          const user = (usersSeed as any[]).find((u: any) => 
            u.username && u.username.toLowerCase() === String(username).toLowerCase()
          );
          
          if (user) {
            // Token format: mock-access-token-{userId}
            const accessToken = `mock-access-token-${user.id}`;
            const refreshToken = `mock-refresh-token-${user.id}`;
            
            const responseData = {
              accessToken,
              refreshToken,
              user: {
                id: user.id,
                username: user.username || username,
                role: user.role,
              },
            };
            
            resolve(wrapResponse(responseData, 200, 'OperationSuccessful') as T);
            return;
          }
        }
        reject(wrapErrorResponse('Invalid credentials', 401));
      } else if (url === '/auth/refresh' && method === 'POST') {
        // Get refresh token from body or Authorization header
        const { refreshToken: bodyRefreshToken } = body || {};
        const headerRefreshToken = authToken?.replace('Bearer ', '') || null;
        const refreshToken = bodyRefreshToken || headerRefreshToken;
        
        // Extract user ID from refresh token
        const userId = extractUserIdFromToken(refreshToken);
        
        if (userId) {
          const user = (usersSeed as any[]).find((u: any) => u.id === userId);
          if (user) {
            const newAccessToken = `mock-access-token-${user.id}`;
            const newRefreshToken = `mock-refresh-token-${user.id}`;
            const responseData = {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            };
            resolve(wrapResponse(responseData, 200, 'OperationSuccessful') as T);
            return;
          }
        }
        
        reject(wrapErrorResponse('Invalid refresh token', 401));
      } else if (url === '/auth/logout' && method === 'POST') {
        // Just return success for logout (NoContent response)
        resolve(wrapResponse(undefined, 204, 'OperationSuccessful') as T);
      } else {
        reject(wrapErrorResponse('Auth endpoint not found', 404));
      }
    }, 300); // Simulate network delay
  });
}

// Helper function to wrap response in BaseControllerResponse format
// Note: statusCode is JsonIgnore in backend, so it's not in response body
// HTTP response status code will be set separately if needed
function wrapResponse<T>(data: T, statusCode: number = 200, message: string = 'OperationSuccessful'): BaseControllerResponse<T> {
  return {
    message,
    data,
    // statusCode is not included (JsonIgnore in backend)
  };
}

// Helper function to wrap error response
// Note: statusCode is JsonIgnore in backend, so it's not in response body
function wrapErrorResponse(message: string, statusCode: number = 400, errorMeta?: any): BaseControllerResponse {
  return {
    message,
    errorMeta,
    // statusCode is not included (JsonIgnore in backend)
  };
}

// Helper function to create paginated data
function createPaginatedData<T>(
  items: T[],
  totalCount: number,
  page: number,
  pageSize: number
): PaginatedData<T> {
  const totalPage = Math.ceil(totalCount / pageSize);
  return {
    items,
    totalCount,
    page,
    pageSize,
    totalPage,
    hasNextPage: page < totalPage,
    hasPreviousPage: page > 1,
  };
}

// Filter data by owner ID (admin sees all)
function filterByOwner<T extends Entity>(data: T[], ownerId: number | null): T[] {
  if (ownerId === null) {
    // Admin sees all data
    return data;
  }
  // Filter by ownerId - handle both string and number types
  return data.filter((item: any) => {
    const itemOwnerId = item.ownerId;
    if (itemOwnerId == null) return false;
    // Compare as numbers (handle both string "2" and number 2)
    return Number(itemOwnerId) === Number(ownerId);
  });
}

export async function mockRequest<T>(method: HttpMethod, url: string, body?: any, authToken?: string): Promise<T> {
  // Handle auth endpoints
  if (url.startsWith('/auth/')) {
    return handleAuthRequest<T>(method, url, body, authToken);
  }

  // Handle profile endpoint - GET /users/me or GET /profile
  if ((url === '/users/me' || url === '/profile') && method === 'GET') {
    const userId = extractUserIdFromToken(authToken || null);
    if (!userId) {
      throw wrapErrorResponse('Unauthorized', 401);
    }
    
    const user = (usersSeed as any[]).find((u: any) => u.id === userId);
    if (!user) {
      throw wrapErrorResponse('User not found', 404);
    }
    
    // Return user profile with all details wrapped in response
    return wrapResponse(user, 200, 'OperationSuccessful') as T;
  }

  // Get current owner ID from token
  const currentOwnerId = await getCurrentOwnerIdFromToken(authToken || null);

  // Handle dashboard endpoints
  if (url.startsWith('/dashboard/owner/')) {
    const summary = calculateOwnerDashboardSummary(url, currentOwnerId);
    return wrapResponse(summary, 200, 'OperationSuccessful') as T;
  }

  // Supports: /resource?page=1&pageSize=20, /resource/:id
  const withoutLeading = url.replace(/^\//, '');
  const [pathOnly, queryString] = withoutLeading.split('?');
  const params = new URLSearchParams(queryString || '');
  const page = Number(params.get('page') || '1');
  const pageSize = Number(params.get('pageSize') || '20');
  const q = (params.get('q') || params.get('SearchValue') || '').toLowerCase();
  const orderColumn = params.get('OrderColumn') || '';
  const orderDirection = (params.get('OrderDirection') || 'DESC').toUpperCase();
  const filters: Record<string, string> = {};
  params.forEach((value, key) => {
    const match = key.match(/^Filters\[(.+)\]$/);
    if (match) filters[match[1]] = value;
  });
  const parts = pathOnly.split('/');
  const resource = parts[0];
  const id = parts[1];
  const subResource = parts[2];
  
  // Handle /resource/stats endpoints (where stats is the second part, not third)
  if (id === 'stats') {
    try {
      const stats = calculateStats(resource, currentOwnerId);
      return wrapResponse(stats, 200, 'OperationSuccessful') as T;
    } catch (error: any) {
      // If stats calculation fails, return default empty stats instead of throwing
      // Return default empty stats structure based on resource
      const defaultStats: any = {
        sales: { totalSales: 0, totalRevenue: 0, monthlySales: 0, averageOrderValue: 0 },
        customers: { totalCustomers: 0, activeCustomers: 0, totalOrders: 0 },
        expenses: { totalExpenses: 0, monthlyExpenses: 0, expenseTypes: 0 },
        revenue: { totalRevenue: 0, monthlyRevenue: 0, revenueTypes: 0 },
        employees: { totalEmployees: 0, activeEmployees: 0, totalDepartments: 0 },
        stock: { totalStockItems: 0, totalCategories: 0, lowStock: 0 },
        products: { totalProducts: 0, totalCategories: 0, totalActive: 0 }, // Keep for backward compatibility
        reports: { totalReports: 0, monthlyReports: 0 },
      };
      
      const fallbackStats = defaultStats[resource] || { total: 0 };
      return wrapResponse(fallbackStats, 200, 'OperationSuccessful') as T;
    }
  }
  
  const store: any = (stores as any)[resource];
  if (!store) {
    // Instead of throwing, return empty array for list endpoints or null for detail endpoints
    if (!id) {
      const emptyPaginated = createPaginatedData([], 0, page, pageSize);
      return wrapResponse(emptyPaginated, 200, 'OperationSuccessful') as T;
    }
    throw wrapErrorResponse(`Mock not found for ${url}`, 404);
  }

  if (method === 'GET') {
    if (id) {
      const item = store.get ? store.get(id) : null;
      if (!item) throw wrapErrorResponse('Not found', 404);
      // Check owner access
      const filtered = filterByOwner([item], currentOwnerId);
      if (filtered.length === 0) throw wrapErrorResponse('Not found', 404);
      
      // Normalize all entities: ensure ID is string and handle resource-specific fields
      let result = filtered[0];
      if (resource === 'stock' || resource === 'products') {
        const normalized: any = {
          ...result,
          id: String(result.id), // Ensure ID is string
          moq: result.moq !== undefined && result.moq !== null ? result.moq : 1,
          // Map 'active' to 'isActive' if needed
          isActive: result.isActive !== undefined ? result.isActive : (result.active !== undefined ? result.active : true),
        };
        // Remove 'active' if it exists (keep only isActive)
        if ('active' in normalized && 'isActive' in normalized) {
          delete normalized.active;
        }
        result = normalized;
      } else {
        // Normalize all other entities: ensure ID is string
        result = {
          ...result,
          id: String(result.id),
        };
      }
      
      return wrapResponse(result, 200, 'OperationSuccessful') as T;
    }
    
    // Special handling for expenses and revenue: merge system-generated data with manual entries
    let all: any[] = [];
    if (resource === 'expenses') {
      // Get manual expenses (only expenses, no income)
      const manualExpenses = filterByOwner(store.list(), currentOwnerId);
      
      // Get system-generated data: Product purchases (expense), Employee salaries (expense)
      const productsStore: any = (stores as any).products;
      const employeesStore: any = (stores as any).employees;
      
      // Product purchases as expense (assume purchase cost is 70% of sale price)
      let productsData = productsStore ? productsStore.list() : [];
      productsData = filterByOwner(productsData, currentOwnerId);
      const expenseFromProducts = productsData
        .map((product: any) => {
          const purchaseCost = Math.round((product.price || 0) * 0.7);
          return {
            id: `expense_product_${product.id}`,
            title: `${product.name} Alış`,
            amount: purchaseCost,
            currency: product.currency || 'TRY',
            type: 'expense' as const,
            source: 'product_purchase' as const,
            date: new Date().toISOString().split('T')[0], // Use current date as default
            productId: String(product.id),
            ownerId: product.ownerId,
            isSystemGenerated: true,
            expenseTypeName: 'Ürün Alışı',
            description: `Ürün: ${product.name}`,
          };
        });
      
      // Employee salaries as expense
      let employeesData = employeesStore ? employeesStore.list() : [];
      employeesData = filterByOwner(employeesData, currentOwnerId);
      const expenseFromSalaries = employeesData
        .filter((e: any) => e.salary && e.salary > 0)
        .map((employee: any) => ({
          id: `expense_salary_${employee.id}`,
          title: `${employee.name || 'Çalışan'} Maaşı`,
          amount: employee.salary || 0,
          currency: employee.currency || 'TRY',
          type: 'expense' as const,
          source: 'employee_salary' as const,
          date: new Date().toISOString().split('T')[0], // Use current date as default
          employeeId: employee.id,
          ownerId: employee.ownerId,
          isSystemGenerated: true,
          expenseTypeName: 'Maaş',
          description: `Çalışan: ${employee.name || employee.email || ''}`,
        }));
      
      // Mark manual expenses (only expense type)
      const manualExpensesMarked = manualExpenses.map((exp: any) => ({
        ...exp,
        type: 'expense' as const, // Always expense for this module
        source: exp.source || 'manual' as const,
        isSystemGenerated: false,
      }));
      
      // Combine all expenses (no income)
      all = [
        ...expenseFromProducts,
        ...expenseFromSalaries,
        ...manualExpensesMarked,
      ];
    } else if (resource === 'revenue') {
      // Get manual revenue entries
      const manualRevenue = filterByOwner(store.list(), currentOwnerId);
      
      // Get system-generated data: Sales (revenue)
      const salesStore: any = (stores as any).sales;
      
      // Sales as revenue
      let salesData = salesStore ? salesStore.list() : [];
      salesData = filterByOwner(salesData, currentOwnerId);
      const revenueFromSales = salesData
        .filter((s: any) => s.status === 'completed')
        .map((sale: any) => ({
          id: `revenue_sale_${sale.id}`,
          title: `${sale.title || 'Satış'}`,
          amount: sale.amount || sale.total || 0,
          currency: sale.currency || 'TRY',
          source: 'sales' as const,
          date: sale.date,
          saleId: String(sale.id),
          employeeId: sale.employeeId,
          ownerId: sale.ownerId,
          isSystemGenerated: true,
          revenueTypeName: 'Satış',
          description: `Satış: ${sale.customerName || sale.customerId || ''}`,
        }));
      
      // Mark manual revenue entries
      const manualRevenueMarked = manualRevenue.map((rev: any) => ({
        ...rev,
        source: rev.source || 'manual' as const,
        isSystemGenerated: false,
      }));
      
      // Combine all revenue
      all = [
        ...revenueFromSales,
        ...manualRevenueMarked,
      ];
    } else {
      const allFromStore = store.list();
      all = filterByOwner(allFromStore, currentOwnerId);
    }
    if (q) {
      all = all.filter((x) => {
        // General search over all primitive fields (string/number/boolean)
        for (const key of Object.keys(x)) {
          const val = (x as any)[key];
          if (val === null || val === undefined) continue;
          if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
            if (String(val).toLowerCase().includes(q)) return true;
          }
        }
        return false;
      });
    }
    // apply filters (exact match)
    if (Object.keys(filters).length) {
      all = all.filter((x) => (
        Object.entries(filters).every(([k, v]) => String((x as any)[k] ?? '').toLowerCase() === String(v).toLowerCase())
      ));
    }
    // apply ordering
    if (orderColumn) {
      all = all.slice().sort((a: any, b: any) => {
        const av = a[orderColumn];
        const bv = b[orderColumn];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return av - bv;
        const as = String(av);
        const bs = String(bv);
        return as.localeCompare(bs);
      });
      if (orderDirection === 'DESC') all.reverse();
    }
    // If consumer expects paginated, return items/total
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    let items = all.slice(start, end);
    
    // Normalize all entities: ensure ID is string and handle resource-specific fields
    if (resource === 'stock' || resource === 'products') {
      items = items.map((item: any) => {
        const normalized: any = {
          ...item,
          id: String(item.id), // Ensure ID is string
          moq: item.moq !== undefined && item.moq !== null ? item.moq : 1,
          // Map 'active' to 'isActive' if needed
          isActive: item.isActive !== undefined ? item.isActive : (item.active !== undefined ? item.active : true),
        };
        // Remove 'active' if it exists (keep only isActive)
        if ('active' in normalized && 'isActive' in normalized) {
          delete normalized.active;
        }
        return normalized;
      });
    } else {
      // Normalize all other entities: ensure ID is string
      items = items.map((item: any) => ({
        ...item,
        id: String(item.id),
      }));
    }
    
    const paginatedData = createPaginatedData(items, all.length, page, pageSize);
    return wrapResponse(paginatedData, 200, 'OperationSuccessful') as T;
  }

  if (method === 'POST') {
    if (!store.create) throw wrapErrorResponse('Create not supported', 405);
    // Add ownerId to new items if not admin (but don't send ownerId in body)
    const itemToCreate = { ...body };
    if (currentOwnerId !== null) {
      itemToCreate.ownerId = currentOwnerId;
    }
    const created = store.create(itemToCreate);
    return wrapResponse(created, 201, 'OperationSuccessful') as T;
  }

  if (method === 'PUT') {
    if (!id || !store.update) throw wrapErrorResponse('Update not supported', 405);
    // Check owner access before update
    const item = store.get ? store.get(id) : null;
    if (!item) throw wrapErrorResponse('Not found', 404);
    const filtered = filterByOwner([item], currentOwnerId);
    if (filtered.length === 0) throw wrapErrorResponse('Not found', 404);
    const updated = store.update(id, body);
    if (!updated) throw wrapErrorResponse('Not found', 404);
    return wrapResponse(updated, 200, 'OperationSuccessful') as T;
  }

  if (method === 'DELETE') {
    if (!id || !store.remove) throw wrapErrorResponse('Delete not supported', 405);
    // Check owner access before delete
    const item = store.get ? store.get(id) : null;
    if (!item) throw wrapErrorResponse('Not found', 404);
    const filtered = filterByOwner([item], currentOwnerId);
    if (filtered.length === 0) throw wrapErrorResponse('Not found', 404);
    const ok = store.remove(id);
    // Return NoContent response for successful delete
    return wrapResponse(undefined, 204, 'OperationSuccessful') as T;
  }

  throw wrapErrorResponse('Unsupported method', 405);
}

// Calculate owner dashboard summary
function calculateOwnerDashboardSummary(url: string, ownerId: number | null): any {
  // Get today's date in YYYY-MM-DD format
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Get all sales and expenses filtered by owner
  const salesStore: any = (stores as any).sales;
  const expensesStore: any = (stores as any).expenses;
  
  let allSales: any[] = salesStore ? salesStore.list() : [];
  let allExpenses: any[] = expensesStore ? expensesStore.list() : [];
  
  // Filter by owner ID
  allSales = filterByOwner(allSales, ownerId);
  allExpenses = filterByOwner(allExpenses, ownerId);

  // Parse URL to determine which summary to return
  const urlParts = url.replace(/^\//, '').split('/');
  const endpoint = urlParts[urlParts.length - 1].split('?')[0]; // Remove query string
  
  // Parse period and other params from query string
  const urlParts2 = url.split('?');
  const queryParams = new URLSearchParams(urlParts2[1] || '');
  const period = queryParams.get('period') || 'all';

  // Helper function to get week number
  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
  
  // Helper function to filter data by period
  function filterByPeriod(data: any[], period: string, checkStatus: boolean = true): any[] {
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentWeek = getWeekNumber(now);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return data.filter((item: any) => {
      if (checkStatus && item.status !== 'completed') return false;
      if (!item.date) return false;
      
      const itemDate = new Date(item.date);
      
      switch (period) {
        case 'day':
          return itemDate.toDateString() === currentDate.toDateString();
        case 'week':
          return getWeekNumber(itemDate) === currentWeek && itemDate.getFullYear() === currentYear;
        case 'month':
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        case 'year':
          return itemDate.getFullYear() === currentYear;
        case 'all':
        default:
          return true;
      }
    });
  }

  if (endpoint === 'store-summary') {
    const filteredSales = filterByPeriod(allSales, period, true);
    const filteredExpenses = filterByPeriod(allExpenses, period, false);
    
    // Group sales by currency (no conversion)
    const salesByCurrency = new Map<string, number>();
    filteredSales.forEach((s: any) => {
      const amount = s.amount || s.total || 0;
      const currency = s.currency || 'TRY';
      const existing = salesByCurrency.get(currency) || 0;
      salesByCurrency.set(currency, existing + amount);
    });
    
    // Group expenses by currency (no conversion)
    const expensesByCurrency = new Map<string, number>();
    filteredExpenses.forEach((e: any) => {
      const amount = e.amount || 0;
      const currency = e.currency || 'TRY';
      const existing = expensesByCurrency.get(currency) || 0;
      expensesByCurrency.set(currency, existing + amount);
    });
    
    // Calculate total by currency
    const totalByCurrency = new Map<string, number>();
    const allCurrencies = new Set([...salesByCurrency.keys(), ...expensesByCurrency.keys()]);
    
    allCurrencies.forEach((currency) => {
      const salesAmount = salesByCurrency.get(currency) || 0;
      const expensesAmount = expensesByCurrency.get(currency) || 0;
      totalByCurrency.set(currency, salesAmount - expensesAmount);
    });
    
    const sales = Array.from(salesByCurrency.entries()).map(([currency, amount]) => ({ amount, currency }));
    const expenses = Array.from(expensesByCurrency.entries()).map(([currency, amount]) => ({ amount, currency }));
    const total = Array.from(totalByCurrency.entries()).map(([currency, amount]) => ({ amount, currency }));
    
    return { sales, expenses, total };
  }

  if (endpoint === 'top-products') {
    const limit = parseInt(queryParams.get('limit') || '10', 10);
    const filteredSales = filterByPeriod(allSales, period, true);
    
    const productsStore: any = (stores as any).products;
    const allProducts: any[] = productsStore ? productsStore.list() : [];
    
    const productSalesMap = new Map();
    filteredSales.forEach((sale: any) => {
      if (!sale.productId) return;
      // Compare as strings to handle both string and number IDs
      const product = allProducts.find((p: any) => String(p.id) === String(sale.productId));
      if (product) {
        const existing = productSalesMap.get(sale.productId) || { productId: sale.productId, productName: product.name, quantity: 0, totalAmount: 0, currency: product.currency || 'TRY' };
        existing.quantity += sale.quantity || 1;
        existing.totalAmount += sale.amount || sale.total || 0;
        productSalesMap.set(sale.productId, existing);
      }
    });
    
    const products = Array.from(productSalesMap.values()).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, limit);
    
    return { products, totalCount: productSalesMap.size };
  }

  if (endpoint === 'employee-summary') {
    const employeeIdParam = queryParams.get('employeeId');
    const employeeId = employeeIdParam ? parseInt(employeeIdParam, 10) : null;

    let filteredSales: any[] = [];

    // First filter by period
    const periodFilteredSales = filterByPeriod(allSales, period, true);
    const periodFilteredExpenses = filterByPeriod(allExpenses, period, false);
    
    let salesByCurrency: Map<string, number>;
    let expensesByCurrency: Map<string, number>;
    
    if (employeeId) {
      // Filter by specific employee
      filteredSales = periodFilteredSales.filter((s: any) => {
        const saleEmployeeId = s.employeeId ? parseInt(String(s.employeeId), 10) : null;
        return saleEmployeeId === employeeId;
      });
      
      const filteredExpenses = periodFilteredExpenses.filter((e: any) => {
        const expEmployeeId = e.employeeId ? parseInt(String(e.employeeId), 10) : null;
        return expEmployeeId === employeeId;
      });
      
      // Group employee sales by currency
      salesByCurrency = new Map<string, number>();
      filteredSales.forEach((s: any) => {
        const amount = s.amount || s.total || 0;
        const currency = s.currency || 'TRY';
        const existing = salesByCurrency.get(currency) || 0;
        salesByCurrency.set(currency, existing + amount);
      });
      
      // Group employee expenses by currency
      expensesByCurrency = new Map<string, number>();
      filteredExpenses.forEach((e: any) => {
        const amount = e.amount || 0;
        const currency = e.currency || 'TRY';
        const existing = expensesByCurrency.get(currency) || 0;
        expensesByCurrency.set(currency, existing + amount);
      });
    } else {
      // All employees summary - group by currency
      filteredSales = periodFilteredSales;
      
      salesByCurrency = new Map<string, number>();
      filteredSales.forEach((s: any) => {
        const amount = s.amount || s.total || 0;
        const currency = s.currency || 'TRY';
        const existing = salesByCurrency.get(currency) || 0;
        salesByCurrency.set(currency, existing + amount);
      });
      
      expensesByCurrency = new Map<string, number>();
      periodFilteredExpenses.forEach((e: any) => {
        const amount = e.amount || 0;
        const currency = e.currency || 'TRY';
        const existing = expensesByCurrency.get(currency) || 0;
        expensesByCurrency.set(currency, existing + amount);
      });
    }
    
    // Calculate total by currency
    const totalByCurrency = new Map<string, number>();
    const allCurrencies = new Set([...salesByCurrency.keys(), ...expensesByCurrency.keys()]);
    
    allCurrencies.forEach((currency) => {
      const salesAmount = salesByCurrency.get(currency) || 0;
      const expensesAmount = expensesByCurrency.get(currency) || 0;
      totalByCurrency.set(currency, salesAmount - expensesAmount);
    });
    
    const employeeSales = Array.from(salesByCurrency.entries()).map(([currency, amount]) => ({ amount, currency }));
    const employeeExpenses = Array.from(expensesByCurrency.entries()).map(([currency, amount]) => ({ amount, currency }));
    const employeeTotal = Array.from(totalByCurrency.entries()).map(([currency, amount]) => ({ amount, currency }));

    // Calculate product sales details
    const productsStore: any = (stores as any).products;
    const allProducts: any[] = productsStore ? productsStore.list() : [];
    
    const productSalesMap = new Map();
    filteredSales.forEach((sale: any) => {
      if (!sale.productId) return;
      // Compare as strings to handle both string and number IDs
      const product = allProducts.find((p: any) => String(p.id) === String(sale.productId));
      if (product) {
        const existing = productSalesMap.get(sale.productId) || { productId: sale.productId, productName: product.name, quantity: 0, totalAmount: 0, currency: product.currency || 'TRY' };
        existing.quantity += sale.quantity || 1;
        existing.totalAmount += sale.amount || sale.total || 0;
        productSalesMap.set(sale.productId, existing);
      }
    });
    
    const productSales = Array.from(productSalesMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      sales: employeeSales,
      expenses: employeeExpenses,
      total: employeeTotal,
      employeeId: employeeId || undefined,
      productSales,
      productCount: productSales.length,
    };
  }

  throw wrapErrorResponse(`Unknown dashboard endpoint: ${endpoint}`, 404);
}

// Calculate stats for modules
function calculateStats(resource: string, ownerId: number | null): any {
  const store: any = (stores as any)[resource];
  if (!store) {
    // Return default empty stats instead of throwing
    const defaultStats: any = {
      sales: { totalSales: 0, totalRevenue: 0, monthlySales: 0, averageOrderValue: 0 },
      customers: { totalCustomers: 0, activeCustomers: 0, totalOrders: 0 },
        expenses: { totalExpenses: 0, monthlyExpenses: 0, expenseTypes: 0 },
        revenue: { totalRevenue: 0, monthlyRevenue: 0, revenueTypes: 0 },
        employees: { totalEmployees: 0, activeEmployees: 0, totalDepartments: 0 },
      products: { totalProducts: 0, totalCategories: 0, totalActive: 0 },
      reports: { totalReports: 0, monthlyReports: 0 },
    };
    return defaultStats[resource] || { total: 0 };
  }

  let data: Entity[] = store.list() || [];
  // Filter by owner ID
  data = filterByOwner(data, ownerId);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  switch (resource) {
    case 'sales': {
      const completedSales = data.filter((s: any) => s.status === 'completed');
      const totalSales = completedSales.length;
      const totalRevenue = completedSales.reduce((sum: number, s: any) => {
        const amount = s.amount || s.total || 0;
        const currency = s.currency || 'TRY';
        return sum + convertToTRY(amount, currency);
      }, 0);
      const monthlySales = completedSales.filter((s: any) => {
        if (!s.date) return false;
        const saleDate = new Date(s.date);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      }).length;
      const averageOrderValue = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;

      return {
        totalSales,
        totalRevenue,
        monthlySales,
        averageOrderValue,
      };
    }

    case 'customers': {
      const activeCustomers = data.filter((c: any) => c.status === 'active');
      const totalCustomers = data.length;
      
      // Get total orders from sales store (filtered by owner)
      const salesStore: any = (stores as any).sales;
      let salesData = salesStore ? salesStore.list() : [];
      salesData = filterByOwner(salesData, ownerId);
      const totalOrders = salesData.filter((s: any) => s.status === 'completed').length;

      return {
        totalCustomers,
        activeCustomers: activeCustomers.length,
        totalOrders,
      };
    }

    case 'expenses': {
      // Calculate expenses stats (only expenses, no income)
      const productsStore: any = (stores as any).products;
      const employeesStore: any = (stores as any).employees;
      
      let productsData = productsStore ? productsStore.list() : [];
      productsData = filterByOwner(productsData, ownerId);
      
      let employeesData = employeesStore ? employeesStore.list() : [];
      employeesData = filterByOwner(employeesData, ownerId);
      
      // Calculate expenses from product purchases (70% of price)
      const expenseFromProducts = productsData.reduce((sum: number, p: any) => {
        const amount = Math.round((p.price || 0) * 0.7);
        const currency = p.currency || 'TRY';
        return sum + convertToTRY(amount, currency);
      }, 0);
      
      // Calculate expenses from employee salaries
      const expenseFromSalaries = employeesData
        .filter((e: any) => e.salary && e.salary > 0)
        .reduce((sum: number, e: any) => sum + (e.salary || 0), 0);
      
      // Calculate manual expenses
      const manualExpenses = data.filter((e: any) => !e.isSystemGenerated || e.source === 'manual');
      const expenseFromManual = manualExpenses.reduce((sum: number, e: any) => {
        const amount = e.amount || 0;
        const currency = e.currency || 'TRY';
        return sum + convertToTRY(amount, currency);
      }, 0);
      const monthlyExpenseFromManual = manualExpenses
        .filter((e: any) => {
          if (!e.date) return false;
          const expenseDate = new Date(e.date);
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum: number, e: any) => {
          const amount = e.amount || 0;
          const currency = e.currency || 'TRY';
          return sum + convertToTRY(amount, currency);
        }, 0);
      
      // Totals (only expenses)
      const totalExpenses = expenseFromProducts + expenseFromSalaries + expenseFromManual;
      const monthlyExpenses = expenseFromProducts + expenseFromSalaries + monthlyExpenseFromManual;
      
      // Counts
      const totalTransactions = productsData.length + 
        employeesData.filter((e: any) => e.salary && e.salary > 0).length + manualExpenses.length;
      
      // Count unique expense types from manual expenses
      const uniqueTypes = new Set(manualExpenses.map((e: any) => e.expenseTypeName || e.type).filter(Boolean));
      const expenseTypes = uniqueTypes.size;

      return {
        totalTransactions,
        totalExpenses,
        monthlyExpenses,
        expensesFromProducts: expenseFromProducts,
        expensesFromSalaries: expenseFromSalaries,
        expensesFromManual: expenseFromManual,
        expenseTypes,
      };
    }

    case 'revenue': {
      // Calculate revenue stats
      const salesStore: any = (stores as any).sales;
      
      let salesData = salesStore ? salesStore.list() : [];
      salesData = filterByOwner(salesData, ownerId);
      
      // Calculate revenue from sales
      const completedSales = salesData.filter((s: any) => s.status === 'completed');
      const revenueFromSales = completedSales.reduce((sum: number, s: any) => {
        const amount = s.amount || s.total || 0;
        const currency = s.currency || 'TRY';
        return sum + convertToTRY(amount, currency);
      }, 0);
      const monthlyRevenueFromSales = completedSales
        .filter((s: any) => {
          if (!s.date) return false;
          const saleDate = new Date(s.date);
          return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        })
        .reduce((sum: number, s: any) => {
          const amount = s.amount || s.total || 0;
          const currency = s.currency || 'TRY';
          return sum + convertToTRY(amount, currency);
        }, 0);
      
      // Calculate manual revenue
      const manualRevenue = data.filter((r: any) => !r.isSystemGenerated || r.source === 'manual');
      const revenueFromManual = manualRevenue.reduce((sum: number, r: any) => {
        const amount = r.amount || 0;
        const currency = r.currency || 'TRY';
        return sum + convertToTRY(amount, currency);
      }, 0);
      const monthlyRevenueFromManual = manualRevenue
        .filter((r: any) => {
          if (!r.date) return false;
          const revenueDate = new Date(r.date);
          return revenueDate.getMonth() === currentMonth && revenueDate.getFullYear() === currentYear;
        })
        .reduce((sum: number, r: any) => {
          const amount = r.amount || 0;
          const currency = r.currency || 'TRY';
          return sum + convertToTRY(amount, currency);
        }, 0);
      
      // Totals
      const totalRevenue = revenueFromSales + revenueFromManual;
      const monthlyRevenue = monthlyRevenueFromSales + monthlyRevenueFromManual;
      
      // Counts
      const totalTransactions = completedSales.length + manualRevenue.length;
      
      // Count unique revenue types from manual revenue
      const uniqueTypes = new Set(manualRevenue.map((r: any) => r.revenueTypeName || r.type).filter(Boolean));
      const revenueTypes = uniqueTypes.size;

      return {
        totalTransactions,
        totalRevenue,
        monthlyRevenue,
        revenueFromSales,
        revenueFromManual,
        revenueTypes,
      };
    }

    case 'employees': {
      const activeEmployees = data.filter((e: any) => e.status === 'active');
      const totalEmployees = data.length;
      
      // Count unique departments
      const uniqueDepartments = new Set(data.map((e: any) => e.department).filter(Boolean));
      const totalDepartments = uniqueDepartments.size;

      return {
        totalEmployees,
        activeEmployees: activeEmployees.length,
        totalDepartments,
      };
    }

    case 'stock':
    case 'products': { // Keep 'products' for backward compatibility
      const lowStockItems = data.filter((p: any) => (p.stock ?? 0) < 10);
      const totalStockItems = data.length;
      
      // Count unique categories
      const uniqueCategories = new Set(data.map((p: any) => p.category).filter(Boolean));
      const totalCategories = uniqueCategories.size;

      return {
        totalStockItems,
        totalCategories,
        lowStock: lowStockItems.length,
      };
    }

    case 'reports': {
      return {
        totalReports: 0,
        monthlyReports: 0,
      };
    }

    default:
      return {
        total: data.length,
      };
  }
}


