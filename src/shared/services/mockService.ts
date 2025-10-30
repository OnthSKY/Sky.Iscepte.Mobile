import customersSeed from '../../mocks/customers.json';
import expensesSeed from '../../mocks/expenses.json';
import productsSeed from '../../mocks/products.json';
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
  modules: { list: () => modules },
  roles: { list: () => roles },
  users: createStore(usersSeed as unknown as Entity[]),
} as const;

// Auth mock handler
function handleAuthRequest<T>(method: HttpMethod, url: string, body?: any): Promise<T> {
  // Simulate async delay
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url === '/auth/login' && method === 'POST') {
        const { username, password } = body || {};
        
        // Simple mock authentication for demo roles
        if (password === '1234') {
          const map: Record<string, { id: number; role: string }> = {
            admin: { id: 1, role: 'admin' },
            owner: { id: 2, role: 'owner' },
            staff: { id: 3, role: 'staff' },
          };
          const found = map[String(username).toLowerCase()];
          if (found) {
            const response = {
              accessToken: 'mock-access-token-' + Date.now(),
              refreshToken: 'mock-refresh-token-' + Date.now(),
              user: {
                id: found.id,
                username,
                role: found.role,
              },
            };
            resolve(response as T);
            return;
          }
        }
        reject({ status: 401, message: 'Invalid credentials' });
      } else if (url === '/auth/refresh' && method === 'POST') {
        const { refreshToken } = body || {};
        
        // Check if refresh token exists and is valid
        if (refreshToken && refreshToken.startsWith('mock-refresh-token')) {
          const response = {
            accessToken: 'mock-access-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now(),
          };
          resolve(response as T);
        } else {
          reject({ status: 401, message: 'Invalid refresh token' });
        }
      } else if (url === '/auth/logout' && method === 'POST') {
        // Just return success for logout
        resolve({ success: true } as T);
      } else {
        reject({ status: 404, message: 'Auth endpoint not found' });
      }
    }, 300); // Simulate network delay
  });
}

export async function mockRequest<T>(method: HttpMethod, url: string, body?: any): Promise<T> {
  // Handle auth endpoints
  if (url.startsWith('/auth/')) {
    return handleAuthRequest<T>(method, url, body);
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
  const [resource, id] = pathOnly.split('/');
  const store: any = (stores as any)[resource];
  if (!store) throw new Error(`Mock not found for ${url}`);

  if (method === 'GET') {
    if (id) {
      const item = store.get ? store.get(id) : null;
      if (!item) throw new Error('Not found');
      return item as T;
    }
    let all: any[] = store.list();
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
    return store.create(body) as T;
  }

  if (method === 'PUT') {
    if (!id || !store.update) throw new Error('Update not supported');
    const updated = store.update(id, body);
    if (!updated) throw new Error('Not found');
    return updated as T;
  }

  if (method === 'DELETE') {
    if (!id || !store.remove) throw new Error('Delete not supported');
    const ok = store.remove(id);
    return ({ success: ok } as unknown) as T;
  }

  throw new Error('Unsupported method');
}


