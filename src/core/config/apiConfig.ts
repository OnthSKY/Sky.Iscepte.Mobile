/**
 * API Configuration
 *
 * NEDEN: API versioning ve configuration için
 * - API version management
 * - Base URL configuration
 * - API endpoint helpers
 */

import appConfig from './appConfig';

/**
 * API Version
 *
 * NEDEN: API versioning stratejisi için
 * - URL-based versioning: /api/v1/...
 * - Header-based versioning: X-API-Version header
 */
export const API_VERSION = 'v1';

/**
 * API Base URL with version
 *
 * NEDEN: API versioning için base URL
 * - URL-based versioning kullanılıyor
 */
export const getApiBaseUrl = (): string => {
  const baseUrl = appConfig.apiBaseUrl;
  // Remove trailing slash if exists
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}/api/${API_VERSION}`;
};

/**
 * Build API endpoint URL
 *
 * NEDEN: API endpoint'lerini build etmek için
 * - Version prefix otomatik eklenir
 * - Consistent URL structure
 *
 * @example
 * ```typescript
 * buildApiUrl('/products') // /api/v1/products
 * buildApiUrl('/products', { id: '123' }) // /api/v1/products/123
 * ```
 */
export function buildApiUrl(endpoint: string, params?: Record<string, string | number>): string {
  const baseUrl = getApiBaseUrl();
  let url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Replace path parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
      url = url.replace(`{${key}}`, String(value));
    });
  }

  return url;
}

/**
 * Build API endpoint URL with query parameters
 *
 * NEDEN: Query parameters ile API endpoint build etmek için
 *
 * @example
 * ```typescript
 * buildApiUrlWithQuery('/products', { page: 1, limit: 10 })
 * // /api/v1/products?page=1&limit=10
 * ```
 */
export function buildApiUrlWithQuery(
  endpoint: string,
  queryParams?: Record<string, string | number | boolean | null | undefined>
): string {
  let url = buildApiUrl(endpoint);

  if (queryParams) {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
}

/**
 * API Version Header
 *
 * NEDEN: Header-based versioning için (opsiyonel)
 */
export const getApiVersionHeader = (): Record<string, string> => {
  return {
    'X-API-Version': API_VERSION,
  };
};
