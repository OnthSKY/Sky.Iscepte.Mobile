import appConfig from '../../core/config/appConfig';
import {
  ApiError,
  NetworkError,
  TimeoutError,
  createApiErrorFromStatus,
  createNetworkError,
  createTimeoutError,
  isApiError,
} from '../../core/types/apiErrors';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Legacy HttpError interface for backward compatibility
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
      // Try to parse error details from response
      let errorDetails: any = undefined;
      let errorMessage: string | undefined = undefined;
      
      try {
        const errorBody = await res.json();
        errorDetails = errorBody;
        
        // Extract message from common error response formats
        errorMessage = errorBody?.message || 
                      errorBody?.error?.message || 
                      errorBody?.errors?.[0]?.message ||
                      undefined;
      } catch {
        // If JSON parse fails, try to get text
        try {
          const errorText = await res.text();
          if (errorText) {
            errorDetails = { message: errorText };
            errorMessage = errorText;
          }
        } catch {
          // Ignore body parse errors
        }
      }

      // Create appropriate error based on HTTP status
      const apiError = createApiErrorFromStatus(
        res.status,
        errorMessage || `HTTP ${res.status}`,
        errorDetails
      );
      
      throw apiError;
    }
    
    // Handle empty body
    const text = await res.text();
    return (text ? JSON.parse(text) : (undefined as any)) as T;
  } catch (e: any) {
    // Handle timeout
    if (e?.name === 'AbortError') {
      throw createTimeoutError('Request timeout. Please try again.');
    }
    
    // If it's already an ApiError, re-throw as-is
    if (isApiError(e)) {
      throw e;
    }
    
    // Handle network errors (no connection, DNS failure, etc.)
    if (
      e?.message?.includes('Network request failed') ||
      e?.message?.includes('Failed to fetch') ||
      e?.message?.includes('NetworkError') ||
      e?.message?.includes('network error') ||
      e?.code === 'NETWORK_ERROR'
    ) {
      throw createNetworkError(e);
    }
    
    // Unknown error - wrap in ApiError
    const networkError = createNetworkError(e);
    throw networkError;
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


