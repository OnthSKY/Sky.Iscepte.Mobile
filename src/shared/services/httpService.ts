import appConfig from '../../core/config/appConfig';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface HttpError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

type RequestConfig = {
  headers?: Record<string, string>;
  timeoutMs?: number;
};

type RequestInterceptor = (input: { method: HttpMethod; url: string; body?: any; config: RequestConfig }) => Promise<void> | void;
type ResponseInterceptor = (input: { method: HttpMethod; url: string; response: Response }) => Promise<void> | void;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

export const httpInterceptors = {
  useRequest: (fn: RequestInterceptor) => requestInterceptors.push(fn),
  useResponse: (fn: ResponseInterceptor) => responseInterceptors.push(fn),
};

export interface HttpClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, body?: any, config?: RequestConfig): Promise<T>;
  put<T>(url: string, body?: any, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

async function request<T>(method: HttpMethod, url: string, body?: any, config: RequestConfig = {}): Promise<T> {
  if (appConfig.mode === 'mock') {
    const mod = await import('../services/mockService');
    return mod.mockRequest<T>(method, url, body);
  }

  for (const i of requestInterceptors) await i({ method, url, body, config });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? 15000);
  try {
    const res = await fetch(`${appConfig.apiBaseUrl}${url}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(config.headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    for (const i of responseInterceptors) await i({ method, url, response: res });

    if (!res.ok) {
      const err: HttpError = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      try {
        err.details = await res.json();
      } catch {
        // ignore body parse error
      }
      throw err;
    }
    // handle empty body
    const text = await res.text();
    return (text ? JSON.parse(text) : (undefined as any)) as T;
  } catch (e: any) {
    const err: HttpError = e?.name === 'AbortError' ? Object.assign(new Error('Request timeout'), { code: 'TIMEOUT' }) : e;
    if (!err.code && !err.status) err.code = 'NETWORK_ERROR';
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export const httpService: HttpClient = {
  get: (url, config) => request('GET', url, undefined, config),
  post: (url, body, config) => request('POST', url, body, config),
  put: (url, body, config) => request('PUT', url, body, config),
  delete: (url, config) => request('DELETE', url, undefined, config),
};

export default httpService;


