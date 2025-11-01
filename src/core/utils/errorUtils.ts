/**
 * Error Message Utilities
 * 
 * Single Responsibility: Provides standardized error messages
 * Dependency Inversion: Uses i18n for translations but provides fallbacks
 */

import i18n from '../../i18n';
import {
  ApiError,
  NetworkError,
  TimeoutError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ServerError,
  isApiError,
} from '../types/apiErrors';
import notificationService, { ErrorCategory, ErrorOptions } from '../../shared/services/notificationService';

/**
 * Get standard error message for common error scenarios
 * Handles both ApiError types and generic errors
 */
export const getErrorMessage = (error: Error | string | unknown, context?: string): string => {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // Handle ApiError types with specific translations
  if (isApiError(error)) {
    return getApiErrorMessage(error, context);
  }

  // If it's an Error object, try to extract meaningful message
  if (error instanceof Error) {
    const message = error.message;
    
    // Try to translate common error patterns
    const translationKey = getErrorTranslationKey(message, context);
    if (translationKey) {
      const translated = i18n.t(translationKey, { defaultValue: message });
      if (translated !== translationKey) {
        return translated;
      }
    }
    
    return message;
  }

  // Default fallback
  return i18n.t('common:errors.unknown', { defaultValue: 'An unknown error occurred' });
};

/**
 * Get error message for ApiError types
 */
function getApiErrorMessage(error: ApiError, context?: string): string {
  // Check for custom message in details
  if (error.details?.message) {
    return error.details.message;
  }

  // Type-specific messages
  if (error instanceof NetworkError) {
    return i18n.t('common:errors.network', { defaultValue: error.message });
  }

  if (error instanceof TimeoutError) {
    return i18n.t('common:errors.timeout', { defaultValue: error.message });
  }

  if (error instanceof UnauthorizedError) {
    return i18n.t('common:errors.unauthorized', { defaultValue: error.message });
  }

  if (error instanceof ForbiddenError) {
    return i18n.t('common:errors.forbidden', { defaultValue: error.message });
  }

  if (error instanceof NotFoundError) {
    return i18n.t('common:errors.not_found', { defaultValue: error.message });
  }

  if (error instanceof ValidationError) {
    // Try to extract validation errors
    if (error.validationErrors) {
      const firstError = Object.values(error.validationErrors)[0]?.[0];
      if (firstError) return firstError;
    }
    return i18n.t('common:errors.validation', { defaultValue: error.message });
  }

  if (error instanceof ServerError) {
    return i18n.t('common:errors.server', { defaultValue: error.message });
  }

  // Fallback to error message or translated generic message
  return error.message || i18n.t('common:errors.unknown', { defaultValue: 'An unknown error occurred' });
}

/**
 * Get translation key for common error patterns
 */
function getErrorTranslationKey(message: string, context?: string): string | undefined {
  const lowerMessage = message.toLowerCase();
  
  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'common:errors.network';
  }
  
  if (lowerMessage.includes('timeout')) {
    return 'common:errors.timeout';
  }
  
  // Not found errors
  if (lowerMessage.includes('not found') || lowerMessage.includes('entity not found')) {
    return 'common:errors.not_found';
  }
  
  // Validation errors
  if (lowerMessage.includes('required') || lowerMessage.includes('parameter is required')) {
    return 'common:errors.required';
  }
  
  // Permission errors
  if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden')) {
    return 'common:errors.unauthorized';
  }
  
  // Server errors
  if (lowerMessage.includes('server') || lowerMessage.includes('500')) {
    return 'common:errors.server';
  }
  
  // Context-specific errors
  if (context) {
    return `common:errors.${context}`;
  }
  
  return undefined;
}

/**
 * Common error message factory functions
 */
export const errorMessages = {
  /**
   * Entity not found error
   */
  notFound: (entityName?: string): string => {
    if (entityName) {
      return i18n.t('common:errors.entity_not_found', { 
        entity: entityName, 
        defaultValue: `${entityName} not found` 
      });
    }
    return i18n.t('common:errors.not_found', { defaultValue: 'Not found' });
  },
  
  /**
   * Required parameter error
   */
  required: (paramName?: string): string => {
    if (paramName) {
      return i18n.t('common:errors.parameter_required', { 
        param: paramName, 
        defaultValue: `${paramName} is required` 
      });
    }
    return i18n.t('common:errors.required', { defaultValue: 'This field is required' });
  },
  
  /**
   * Failed to load error
   */
  failedToLoad: (entityName?: string): string => {
    if (entityName) {
      return i18n.t('common:errors.failed_to_load', { 
        entity: entityName, 
        defaultValue: `Failed to load ${entityName}` 
      });
    }
    return i18n.t('common:errors.failed_to_load_generic', { defaultValue: 'Failed to load data' });
  },
  
  /**
   * Failed to save error
   */
  failedToSave: (entityName?: string): string => {
    if (entityName) {
      return i18n.t('common:errors.failed_to_save', { 
        entity: entityName, 
        defaultValue: `Failed to save ${entityName}` 
      });
    }
    return i18n.t('common:errors.failed_to_save_generic', { defaultValue: 'Failed to save' });
  },
  
  /**
   * Failed to delete error
   */
  failedToDelete: (entityName?: string): string => {
    if (entityName) {
      return i18n.t('common:errors.failed_to_delete', { 
        entity: entityName, 
        defaultValue: `Failed to delete ${entityName}` 
      });
    }
    return i18n.t('common:errors.failed_to_delete_generic', { defaultValue: 'Failed to delete' });
  },
  
  /**
   * Network error
   */
  network: (): string => {
    return i18n.t('common:errors.network', { defaultValue: 'Network error. Please check your connection.' });
  },
  
  /**
   * Unauthorized error
   */
  unauthorized: (): string => {
    return i18n.t('common:errors.unauthorized', { defaultValue: 'You are not authorized to perform this action' });
  },
  
  /**
   * Unknown error
   */
  unknown: (): string => {
    return i18n.t('common:errors.unknown', { defaultValue: 'An unknown error occurred' });
  },
};

/**
 * Create standardized Error object with message
 */
export function createError(message: string, code?: string): Error {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  return error;
}

/**
 * Extract error code from Error object
 */
export function getErrorCode(error: Error | unknown): string | undefined {
  if (isApiError(error)) {
    return error.code;
  }
  if (error instanceof Error) {
    return (error as any).code || (error as any).status;
  }
  return undefined;
}

/**
 * Check if error is retryable
 * Network errors and 5xx errors are retryable
 */
export function isRetryableError(error: Error | unknown): boolean {
  if (isApiError(error)) {
    // Network and timeout errors are retryable
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return true;
    }
    
    // Server errors (5xx) are retryable
    if (error instanceof ServerError || (error.status && error.status >= 500)) {
      return true;
    }
    
    // Client errors (4xx) are generally not retryable
    // Exception: 401 can be retried after token refresh
    return false;
  }
  
  // Unknown errors - assume not retryable
  return false;
}

/**
 * Get error status code
 */
export function getErrorStatus(error: Error | unknown): number | undefined {
  if (isApiError(error)) {
    return error.status;
  }
  if (error instanceof Error && 'status' in error) {
    return (error as any).status;
  }
  return undefined;
}

/**
 * Get error category from ApiError
 */
export function getErrorCategory(error: Error | unknown): ErrorCategory {
  if (isApiError(error)) {
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return 'api';
    }
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return 'permission';
    }
    if (error instanceof ValidationError) {
      return 'validation';
    }
    if (error instanceof ServerError) {
      return 'system';
    }
    // Other API errors
    return 'api';
  }
  
  // Unknown errors
  return 'unknown';
}

/**
 * Show error notification with proper category and deduplication
 */
export function showErrorNotification(
  error: Error | string | unknown,
  context?: string,
  options?: Omit<ErrorOptions, 'category' | 'key'>
) {
  const message = getErrorMessage(error, context);
  const category = typeof error === 'string' ? 'unknown' : getErrorCategory(error);
  
  // Generate deduplication key from error message and context
  const key = typeof error === 'string' 
    ? `${context || 'error'}:${message}`
    : isApiError(error) && error.code
    ? `${context || 'error'}:${error.code}`
    : `${context || 'error'}:${message}`;
  
  notificationService.error(message, {
    ...options,
    category,
    key,
    details: isApiError(error) ? error.details : undefined,
  });
}

/**
 * Show API error notification (convenience function)
 */
export function showApiErrorNotification(
  error: Error | string | unknown,
  details?: any,
  options?: Omit<ErrorOptions, 'category'>
) {
  const message = getErrorMessage(error);
  const category = typeof error === 'string' ? 'api' : getErrorCategory(error);
  
  // Use error code or message as key for deduplication
  const key = isApiError(error) && error.code
    ? `api:${error.code}`
    : `api:${message}`;
  
  notificationService.apiError(message, details || (isApiError(error) ? error.details : undefined), {
    ...options,
    key,
  });
}

