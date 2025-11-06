import appConfig from '../../core/config/appConfig';
import {
  createApiErrorFromStatus,
  createNetworkError,
  createTimeoutError,
  isApiError,
} from '../../core/types/apiErrors';
import { BaseControllerResponse } from '../types/apiResponse';
import networkService from '../../core/services/networkService';
import { requestManager } from '../../core/services/requestManager';

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
  signal?: AbortSignal; // NEDEN: External AbortSignal support (for request cancellation)
  skipDeduplication?: boolean; // NEDEN: Deduplication'ı atlamak için
};

type RequestInterceptor = (input: {
  method: HttpMethod;
  url: string;
  body?: any;
  config: RequestConfig;
}) => Promise<void> | void;
type ResponseInterceptor = (input: {
  method: HttpMethod;
  url: string;
  response: Response;
}) => Promise<void> | void;

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

async function request<T>(
  method: HttpMethod,
  url: string,
  body?: any,
  config: RequestConfig = {}
): Promise<T> {
  for (const i of requestInterceptors) {
    await i({ method, url, body, config });
  }

  // Request cancellation and deduplication
  const requestId = requestManager.generateId(method, url, body);
  let abortController: AbortController | null = null;

  // Create or get existing controller (for deduplication)
  if (!config.signal && !config.skipDeduplication) {
    abortController = requestManager.createController(requestId, url, method);
  }

  // Use provided signal or create new one
  const signal = config.signal || abortController?.signal;

  // Handle mock mode - extract token from headers and pass to mock service
  if (appConfig.mode === 'mock') {
    const mod = await import('../services/mockService');
    // Extract token from Authorization header
    const authHeader = config.headers?.Authorization || config.headers?.authorization;
    const token = authHeader?.replace('Bearer ', '') || null;
    try {
      // Mock service returns BaseControllerResponse<T>, need to parse it
      const mockResponse = await mod.mockRequest<BaseControllerResponse<T>>(
        method,
        url,
        body,
        token ?? ''
      );

      // Check if response is BaseControllerResponse format
      if (mockResponse && typeof mockResponse === 'object' && 'message' in mockResponse) {
        const apiResponse = mockResponse as BaseControllerResponse<T>;

        // For mock mode, assume success (status 200) if message is OperationSuccessful
        const isSuccess = apiResponse.message === 'OperationSuccessful' || !apiResponse.errorMeta;

        if (isSuccess) {
          // Success: return data (can be undefined for NoContent responses like 204)
          if (apiResponse.data === undefined || apiResponse.data === null) {
            return undefined as T;
          }
          return apiResponse.data;
        }

        // Error response: extract error information
        const errorMessage = apiResponse.message || 'Request failed';
        const { errorMeta } = apiResponse;

        // For mock mode, use 400 as default error status
        const apiError = createApiErrorFromStatus(
          400,
          errorMessage,
          mockResponse, // Full response as details
          errorMeta
        );

        throw apiError;
      }

      // If not BaseControllerResponse format, return as-is (backward compatibility)
      return mockResponse as T;
    } catch (error: any) {
      throw error;
    }
  }

  // Create timeout controller if no signal provided
  const timeoutController = signal ? null : new AbortController();
  const timeout = timeoutController
    ? setTimeout(() => timeoutController.abort(), config.timeoutMs ?? 15000)
    : null;

  // Combine signals: external signal + timeout signal
  const combinedSignal = signal
    ? timeoutController
      ? combineSignals([signal, timeoutController.signal])
      : signal
    : timeoutController?.signal;

  try {
    // NEDEN: API versioning için base URL'i kullan
    // URL zaten version içeriyorsa olduğu gibi kullan
    const apiUrl = url.startsWith('/api/')
      ? `${appConfig.apiBaseUrl}${url}`
      : `${appConfig.apiBaseUrl}${url}`;
    const res = await fetch(apiUrl, {
      method,
      headers: { 'Content-Type': 'application/json', ...(config.headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: combinedSignal,
    });

    for (const i of responseInterceptors) {
      await i({ method, url, response: res });
    }

    // Handle empty body first to avoid consuming the stream twice
    const text = await res.text();
    const parsedResponse = text ? JSON.parse(text) : undefined;
    const httpStatus = res.status;

    // Check if response is BaseControllerResponse format
    // BaseControllerResponse has 'message' field (statusCode is JsonIgnore in backend, not in response)
    if (parsedResponse && typeof parsedResponse === 'object' && 'message' in parsedResponse) {
      const apiResponse = parsedResponse as BaseControllerResponse<T>;

      // Check if HTTP response is successful (200-299)
      if (httpStatus >= 200 && httpStatus < 300) {
        // Success: return data (can be undefined for NoContent responses like 204)
        if (apiResponse.data === undefined || apiResponse.data === null) {
          return undefined as T;
        }
        return apiResponse.data;
      }

      // Error response: extract error information
      const errorMessage = apiResponse.message || `HTTP ${httpStatus}`;
      const { errorMeta } = apiResponse; // Dynamic error metadata from API

      // Create appropriate error based on HTTP status code
      const apiError = createApiErrorFromStatus(
        httpStatus,
        errorMessage,
        parsedResponse, // Full response as details
        errorMeta
      );

      throw apiError;
    }

    // Handle non-BaseControllerResponse format
    if (!res.ok) {
      // Try to parse error details from response
      const errorDetails: any = parsedResponse || undefined;
      let errorMessage: string | undefined = undefined;
      let errorMeta: any = undefined;

      if (errorDetails) {
        // Extract message from common error response formats
        errorMessage =
          errorDetails?.message ||
          errorDetails?.error?.message ||
          errorDetails?.errors?.[0]?.message ||
          undefined;

        // Extract errorMeta if present
        errorMeta = errorDetails?.errorMeta;
      } else {
        // If no JSON, use text as message
        errorMessage = text || `HTTP ${res.status}`;
      }

      // Create appropriate error based on HTTP status
      const apiError = createApiErrorFromStatus(
        res.status,
        errorMessage || `HTTP ${res.status}`,
        errorDetails,
        errorMeta
      );

      throw apiError;
    }

    // Success response (not BaseControllerResponse format) - return as-is
    return parsedResponse as T;
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
      // If offline and it's a mutation (POST, PUT, DELETE), add to queue
      if (
        !networkService.isOnline() &&
        (method === 'POST' || method === 'PUT' || method === 'DELETE')
      ) {
        try {
          await networkService.addToQueue(method, url, body, config.headers);
          // Return a promise that will resolve when queue is processed
          // For now, throw error but user knows it's queued
          const networkError = createNetworkError(
            new Error('Request queued for offline processing')
          );
          throw networkError;
        } catch (queueError) {
          // If queue fails, throw original error
          throw createNetworkError(e);
        }
      } else {
        throw createNetworkError(e);
      }
    }

    // Unknown error - wrap in ApiError
    const networkError = createNetworkError(e);
    throw networkError;
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
    // Remove request from tracking when completed
    if (!config.skipDeduplication) {
      requestManager.removeRequest(requestId);
    }
  }
}

/**
 * Combine multiple AbortSignals
 *
 * NEDEN: Hem external signal hem timeout signal'i birleştirmek için
 */
function combineSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  signals.forEach((signal) => {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', () => controller.abort());
    }
  });

  return controller.signal;
}

export const httpService: HttpClient = {
  get: (url, config) => request('GET', url, undefined, config),
  post: (url, body, config) => request('POST', url, body, config),
  put: (url, body, config) => request('PUT', url, body, config),
  delete: (url, config) => request('DELETE', url, undefined, config),
};

export default httpService;
