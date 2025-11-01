/**
 * Error Message Utilities
 * 
 * Single Responsibility: Provides standardized error messages
 * Dependency Inversion: Uses i18n for translations but provides fallbacks
 */

import i18n from '../../i18n';

/**
 * Get standard error message for common error scenarios
 */
export const getErrorMessage = (error: Error | string | unknown, context?: string): string => {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
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
  if (error instanceof Error) {
    return (error as any).code || (error as any).status;
  }
  return undefined;
}

