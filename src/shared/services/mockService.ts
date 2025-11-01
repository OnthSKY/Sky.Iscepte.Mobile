import customersSeed from '../../mocks/customers.json';
import expensesSeed from '../../mocks/expenses.json';
import productsSeed from '../../mocks/products.json'; // Keep import for backward compatibility, but treat as stock
import salesSeed from '../../mocks/sales.json';
import employeesSeed from '../../mocks/employees.json';
import expenseTypesSeed from '../../mocks/expenseTypes.json';
import modules from '../../mocks/modules.json';
import roles from '../../mocks/roles.json';
import usersSeed from '../../mocks/users.json';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type Entity = { id: number | string; [k: string]: any };

function createStore(seed: Entity[]) {
  let data: Entity[] = Array.isArray(seed) ? [...seed] : [];
  let nextId = (data.reduce((m, x) => (typeof x.id === 'number' ? Math.max(m, x.id) : m), 0) || 0) + 1;
  return {
    list: () => data,
    get: (id: string) => data.find((x) => String(x.id) === id),
    create: (input: any) => {
      const entity = { id: nextId++, ...input } as Entity;
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

const stores = {
  customers: createStore(customersSeed as unknown as Entity[]),
  expenses: createStore(expensesSeed as unknown as Entity[]),
  stock: createStore(productsSeed as unknown as Entity[]),
  products: createStore(productsSeed as unknown as Entity[]), // Keep for backward compatibility
  sales: createStore(salesSeed as unknown as Entity[]),
  employees: createStore(employeesSeed as unknown as Entity[]),
  expenseTypes: createStore(expenseTypesSeed as unknown as Entity[]),
  modules: { list: () => modules },
  roles: { list: () => roles },
  users: createStore(usersSeed as unknown as Entity[]),
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
            
            const response = {
              accessToken,
              refreshToken,
              user: {
                id: user.id,
                username: user.username || username,
                role: user.role,
              },
            };
            
            resolve(response as T);
            return;
          }
        }
        reject({ status: 401, message: 'Invalid credentials' });
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
            const response = {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            };
            resolve(response as T);
            return;
          }
        }
        
        reject({ status: 401, message: 'Invalid refresh token' });
      } else if (url === '/auth/logout' && method === 'POST') {
        // Just return success for logout
        resolve({ success: true } as T);
      } else {
        reject({ status: 404, message: 'Auth endpoint not found' });
      }
    }, 300); // Simulate network delay
  });
}

// Filter data by owner ID (admin sees all)
function filterByOwner<T extends Entity>(data: T[], ownerId: number | null): T[] {
  if (ownerId === null) {
    // Admin sees all data
    return data;
  }
  // Filter by ownerId
  return data.filter((item: any) => item.ownerId === ownerId);
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
      throw new Error('Unauthorized');
    }
    
    const user = (usersSeed as any[]).find((u: any) => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Return user profile with all details
    return user as T;
  }

  // Get current owner ID from token
  const currentOwnerId = await getCurrentOwnerIdFromToken(authToken || null);

  // Handle dashboard endpoints
  if (url.startsWith('/dashboard/owner/')) {
    return calculateOwnerDashboardSummary(url, currentOwnerId) as T;
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
      return stats as T;
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
      return fallbackStats as T;
    }
  }
  
  const store: any = (stores as any)[resource];
  if (!store) {
    // Instead of throwing, return empty array for list endpoints or null for detail endpoints
    if (!id) {
      return [] as T;
    }
    throw new Error(`Mock not found for ${url}`);
  }

  if (method === 'GET') {
    if (id) {
      const item = store.get ? store.get(id) : null;
      if (!item) throw new Error('Not found');
      // Check owner access
      const filtered = filterByOwner([item], currentOwnerId);
      if (filtered.length === 0) throw new Error('Not found');
      return filtered[0] as T;
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
      all = filterByOwner(store.list(), currentOwnerId);
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
    const items = all.slice(start, end);
    const payload: any = { items, total: all.length };
    return payload as T;
  }

  if (method === 'POST') {
    if (!store.create) throw new Error('Create not supported');
    // Add ownerId to new items if not admin (but don't send ownerId in body)
    const itemToCreate = { ...body };
    if (currentOwnerId !== null) {
      itemToCreate.ownerId = currentOwnerId;
    }
    return store.create(itemToCreate) as T;
  }

  if (method === 'PUT') {
    if (!id || !store.update) throw new Error('Update not supported');
    // Check owner access before update
    const item = store.get ? store.get(id) : null;
    if (!item) throw new Error('Not found');
    const filtered = filterByOwner([item], currentOwnerId);
    if (filtered.length === 0) throw new Error('Not found');
    const updated = store.update(id, body);
    if (!updated) throw new Error('Not found');
    return updated as T;
  }

  if (method === 'DELETE') {
    if (!id || !store.remove) throw new Error('Delete not supported');
    // Check owner access before delete
    const item = store.get ? store.get(id) : null;
    if (!item) throw new Error('Not found');
    const filtered = filterByOwner([item], currentOwnerId);
    if (filtered.length === 0) throw new Error('Not found');
    const ok = store.remove(id);
    return ({ success: ok } as unknown) as T;
  }

  throw new Error('Unsupported method');
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

  if (endpoint === 'today-summary') {
    // Calculate today's summary
    const todaySales = allSales
      .filter((s: any) => s.date === today && s.status === 'completed')
      .reduce((sum: number, s: any) => sum + (s.amount || s.total || 0), 0);
    
    const todayExpenses = allExpenses
      .filter((e: any) => e.date === today)
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    
    const todayTotal = todaySales - todayExpenses;

    return {
      sales: todaySales,
      expenses: todayExpenses,
      total: todayTotal,
    };
  }

  if (endpoint === 'total-summary') {
    // Calculate total summary
    const totalSales = allSales
      .filter((s: any) => s.status === 'completed')
      .reduce((sum: number, s: any) => sum + (s.amount || s.total || 0), 0);
    
    const totalExpenses = allExpenses
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    
    const totalTotal = totalSales - totalExpenses;

    return {
      sales: totalSales,
      expenses: totalExpenses,
      total: totalTotal,
    };
  }

  if (endpoint === 'employee-summary') {
    // Parse employeeId and period from query string
    const urlParts2 = url.split('?');
    const queryParams = new URLSearchParams(urlParts2[1] || '');
    const employeeIdParam = queryParams.get('employeeId');
    const period = queryParams.get('period') || 'today';
    const employeeId = employeeIdParam ? parseInt(employeeIdParam, 10) : null;

    let employeeSales = 0;
    let employeeExpenses = 0;

    if (employeeId) {
      // Filter by specific employee
      const filteredSales = allSales.filter((s: any) => {
        const saleEmployeeId = s.employeeId ? parseInt(String(s.employeeId), 10) : null;
        const matchesEmployee = saleEmployeeId === employeeId;
        const matchesDate = period === 'today' ? s.date === today : true;
        const matchesStatus = s.status === 'completed';
        return matchesEmployee && matchesDate && matchesStatus;
      });
      
      employeeSales = filteredSales.reduce((sum: number, s: any) => sum + (s.amount || s.total || 0), 0);
      
      const filteredExpenses = allExpenses.filter((e: any) => {
        const expEmployeeId = e.employeeId ? parseInt(String(e.employeeId), 10) : null;
        const matchesEmployee = expEmployeeId === employeeId;
        const matchesDate = period === 'today' ? e.date === today : true;
        return matchesEmployee && matchesDate;
      });
      
      employeeExpenses = filteredExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    } else {
      // All employees summary
      if (period === 'today') {
        employeeSales = allSales
          .filter((s: any) => s.date === today && s.status === 'completed')
          .reduce((sum: number, s: any) => sum + (s.amount || s.total || 0), 0);
        
        employeeExpenses = allExpenses
          .filter((e: any) => e.date === today)
          .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      } else {
        // All time
        employeeSales = allSales
          .filter((s: any) => s.status === 'completed')
          .reduce((sum: number, s: any) => sum + (s.amount || s.total || 0), 0);
        
        employeeExpenses = allExpenses
          .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      }
    }

    const employeeTotal = employeeSales - employeeExpenses;

    return {
      sales: employeeSales,
      expenses: employeeExpenses,
      total: employeeTotal,
      employeeId: employeeId || undefined,
    };
  }

  throw new Error(`Unknown dashboard endpoint: ${endpoint}`);
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
      const totalRevenue = completedSales.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
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
      const expenseFromProducts = productsData.reduce((sum: number, p: any) => 
        sum + Math.round((p.price || 0) * 0.7), 0);
      
      // Calculate expenses from employee salaries
      const expenseFromSalaries = employeesData
        .filter((e: any) => e.salary && e.salary > 0)
        .reduce((sum: number, e: any) => sum + (e.salary || 0), 0);
      
      // Calculate manual expenses
      const manualExpenses = data.filter((e: any) => !e.isSystemGenerated || e.source === 'manual');
      const expenseFromManual = manualExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      const monthlyExpenseFromManual = manualExpenses
        .filter((e: any) => {
          if (!e.date) return false;
          const expenseDate = new Date(e.date);
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      
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
      const revenueFromSales = completedSales.reduce((sum: number, s: any) => sum + (s.amount || s.total || 0), 0);
      const monthlyRevenueFromSales = completedSales
        .filter((s: any) => {
          if (!s.date) return false;
          const saleDate = new Date(s.date);
          return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        })
        .reduce((sum: number, s: any) => sum + (s.amount || s.total || 0), 0);
      
      // Calculate manual revenue
      const manualRevenue = data.filter((r: any) => !r.isSystemGenerated || r.source === 'manual');
      const revenueFromManual = manualRevenue.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
      const monthlyRevenueFromManual = manualRevenue
        .filter((r: any) => {
          if (!r.date) return false;
          const revenueDate = new Date(r.date);
          return revenueDate.getMonth() === currentMonth && revenueDate.getFullYear() === currentYear;
        })
        .reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
      
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


