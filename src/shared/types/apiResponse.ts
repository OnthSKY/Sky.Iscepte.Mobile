/**
 * API Response Types
 * Matches backend BaseControllerResponse structure
 * Note: statusCode is JsonIgnore in backend, so it's not in the response body
 * We use HTTP response status code instead
 */

// Base response structure (without data)
export interface BaseControllerResponse {
  message: string;
  errorMeta?: any; // Dynamic error metadata
}

// Generic response structure with data
export interface BaseControllerResponse<T = any> extends BaseControllerResponse {
  data?: T;
}

export interface PaginatedData<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

