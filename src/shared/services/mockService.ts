import customersSeed from '../../mocks/customers.json';
import expensesSeed from '../../mocks/expenses.json';
import productsSeed from '../../mocks/products.json';
import salesSeed from '../../mocks/sales.json';
import employeesSeed from '../../mocks/employees.json';
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
  products: createStore(productsSeed as unknown as Entity[]),
  sales: createStore(salesSeed as unknown as Entity[]),
  employees: createStore(employeesSeed as unknown as Entity[]),
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
  if (!user) return null;
  
  // Admin sees all data
  if (user.role === 'admin') {
    return null;
  }
  
  // If user is owner, use their own ID; if staff, use their ownerId
  return user.role === 'owner' ? user.id : (user.ownerId || null);
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
  const [resource, id, subResource] = pathOnly.split('/');
  
  // Handle /resource/stats endpoints
  if (subResource === 'stats') {
    return calculateStats(resource, currentOwnerId) as T;
  }
  
  const store: any = (stores as any)[resource];
  if (!store) throw new Error(`Mock not found for ${url}`);

  if (method === 'GET') {
    if (id) {
      const item = store.get ? store.get(id) : null;
      if (!item) throw new Error('Not found');
      // Check owner access
      const filtered = filterByOwner([item], currentOwnerId);
      if (filtered.length === 0) throw new Error('Not found');
      return filtered[0] as T;
    }
    let all: any[] = filterByOwner(store.list(), currentOwnerId);
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

// Calculate stats for modules
function calculateStats(resource: string, ownerId: number | null): any {
  const store: any = (stores as any)[resource];
  if (!store) {
    throw new Error(`Stats not found for ${resource}`);
  }

  let data: Entity[] = store.list();
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
      const totalExpenses = data.length;
      const totalAmount = data.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      const monthlyExpenses = data.filter((e: any) => {
        if (!e.date) return false;
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      }).length;
      
      // Count unique expense types
      const uniqueTypes = new Set(data.map((e: any) => e.type).filter(Boolean));
      const expenseTypes = uniqueTypes.size;

      return {
        totalExpenses,
        totalAmount,
        monthlyExpenses,
        expenseTypes,
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

    case 'products': {
      const activeProducts = data.filter((p: any) => p.active !== false);
      const totalProducts = data.length;
      
      // Count unique categories
      const uniqueCategories = new Set(data.map((p: any) => p.category).filter(Boolean));
      const totalCategories = uniqueCategories.size;

      return {
        totalProducts,
        totalCategories,
        totalActive: activeProducts.length,
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


