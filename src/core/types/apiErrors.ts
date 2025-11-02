/**
 * API Error Types
 * 
 * Single Responsibility: Defines structured error types for API calls
 * Open/Closed: Extensible error types for different scenarios
 */

/**
 * Base API Error interface
 */
export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
  errorMeta?: any; // Dynamic error metadata from API (BaseControllerResponse.errorMeta)
  timestamp?: number;
}

/**
 * Network Error - No internet connection
 */
export class NetworkError extends Error implements ApiError {
  code = 'NETWORK_ERROR';
  status = 0;
  details?: any;
  errorMeta?: any;
  timestamp = Date.now();

  constructor(message: string = 'Network error. Please check your connection.', details?: any, errorMeta?: any) {
    super(message);
    this.name = 'NetworkError';
    this.details = details;
    this.errorMeta = errorMeta;
  }
}

/**
 * Timeout Error - Request timeout
 */
export class TimeoutError extends Error implements ApiError {
  code = 'TIMEOUT';
  status = 408;
  details?: any;
  errorMeta?: any;
  timestamp = Date.now();

  constructor(message: string = 'Request timeout. Please try again.', details?: any, errorMeta?: any) {
    super(message);
    this.name = 'TimeoutError';
    this.details = details;
    this.errorMeta = errorMeta;
  }
}

/**
 * Unauthorized Error - 401
 */
export class UnauthorizedError extends Error implements ApiError {
  code = 'UNAUTHORIZED';
  status = 401;
  details?: any;
  errorMeta?: any;
  timestamp = Date.now();

  constructor(message: string = 'Unauthorized. Please login again.', details?: any, errorMeta?: any) {
    super(message);
    this.name = 'UnauthorizedError';
    this.details = details;
    this.errorMeta = errorMeta;
  }
}

/**
 * Forbidden Error - 403
 */
export class ForbiddenError extends Error implements ApiError {
  code = 'FORBIDDEN';
  status = 403;
  details?: any;
  errorMeta?: any;
  timestamp = Date.now();

  constructor(message: string = 'Access forbidden. You do not have permission.', details?: any, errorMeta?: any) {
    super(message);
    this.name = 'ForbiddenError';
    this.details = details;
    this.errorMeta = errorMeta;
  }
}

/**
 * NotFound Error - 404
 */
export class NotFoundError extends Error implements ApiError {
  code = 'NOT_FOUND';
  status = 404;
  details?: any;
  errorMeta?: any;
  timestamp = Date.now();

  constructor(message: string = 'Resource not found.', details?: any, errorMeta?: any) {
    super(message);
    this.name = 'NotFoundError';
    this.details = details;
    this.errorMeta = errorMeta;
  }
}

/**
 * Validation Error - 400, 422
 */
export class ValidationError extends Error implements ApiError {
  code = 'VALIDATION_ERROR';
  status = 400;
  details?: any;
  errorMeta?: any;
  timestamp = Date.now();
  validationErrors?: Record<string, string[]>;

  constructor(
    message: string = 'Validation failed. Please check your input.',
    details?: any,
    validationErrors?: Record<string, string[]>,
    errorMeta?: any
  ) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.validationErrors = validationErrors;
    this.errorMeta = errorMeta;
  }
}

/**
 * Server Error - 500+
 */
export class ServerError extends Error implements ApiError {
  code = 'SERVER_ERROR';
  status = 500;
  details?: any;
  errorMeta?: any;
  timestamp = Date.now();

  constructor(message: string = 'Server error. Please try again later.', details?: any, errorMeta?: any) {
    super(message);
    this.name = 'ServerError';
    this.details = details;
    this.errorMeta = errorMeta;
  }
}

/**
 * Unknown Error - Catch-all for unexpected errors
 */
export class UnknownApiError extends Error implements ApiError {
  code = 'UNKNOWN_ERROR';
  status?: number;
  details?: any;
  errorMeta?: any;
  timestamp = Date.now();

  constructor(message: string = 'An unknown error occurred.', details?: any, status?: number, errorMeta?: any) {
    super(message);
    this.name = 'UnknownApiError';
    this.details = details;
    this.status = status;
    this.errorMeta = errorMeta;
  }
}

/**
 * Error type enum for type-safe error handling
 */
export enum ApiErrorType {
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION_ERROR',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'status' in error
  );
}

/**
 * Create appropriate error instance from HTTP status
 */
export function createApiErrorFromStatus(
  status: number,
  message?: string,
  details?: any,
  errorMeta?: any
): ApiError {
  const defaultMessage = message || `HTTP ${status}`;

  switch (status) {
    case 401:
      return new UnauthorizedError(message || 'Unauthorized. Please login again.', details, errorMeta);
    case 403:
      return new ForbiddenError(message || 'Access forbidden.', details, errorMeta);
    case 404:
      return new NotFoundError(message || 'Resource not found.', details, errorMeta);
    case 408:
      return new TimeoutError(message || 'Request timeout.', details, errorMeta);
    case 400:
    case 422:
      return new ValidationError(message || 'Validation failed.', details, undefined, errorMeta);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message || 'Server error.', details, errorMeta);
    default:
      if (status >= 500) {
        return new ServerError(message || 'Server error.', details, errorMeta);
      }
      if (status >= 400) {
        return new ValidationError(message || 'Client error.', details, undefined, errorMeta);
      }
      return new UnknownApiError(defaultMessage, details, status, errorMeta);
  }
}

/**
 * Check if status code indicates success (200-299)
 */
export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Check if status code indicates client error (400-499)
 */
export function isClientError(status: number): boolean {
  return status >= 400 && status < 500;
}

/**
 * Check if status code indicates server error (500+)
 */
export function isServerError(status: number): boolean {
  return status >= 500;
}

/**
 * Create error from network failure
 */
export function createNetworkError(error: Error | unknown, details?: any): NetworkError {
  if (error instanceof NetworkError) {
    return error;
  }
  
  const message = error instanceof Error 
    ? error.message 
    : 'Network error. Please check your connection.';
  
  return new NetworkError(message, details);
}

/**
 * Create error from timeout
 */
export function createTimeoutError(message?: string, details?: any): TimeoutError {
  return new TimeoutError(message, details);
}

