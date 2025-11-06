/**
 * Async Validation Utilities
 *
 * Single Responsibility: Provides async validation functions for server-side validation
 * Open/Closed: Easy to extend with new async validators
 *
 * Features:
 * - Async field validation
 * - Server-side validation support
 * - Debounced validation
 * - Validation caching
 */

import { z } from 'zod';

/**
 * Async validation result
 */
export interface AsyncValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Async validator function type
 */
export type AsyncValidator<T = unknown> = (value: T) => Promise<AsyncValidationResult>;

/**
 * Create an async validator from a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param errorMessage - Custom error message (optional)
 * @returns Async validator function
 *
 * @example
 * ```ts
 * const emailSchema = z.string().email();
 * const validateEmail = createAsyncZodValidator(emailSchema);
 *
 * const result = await validateEmail('test@example.com');
 * // { isValid: true }
 * ```
 */
export function createAsyncZodValidator<T>(
  schema: z.ZodSchema<T>,
  errorMessage?: string
): AsyncValidator<T> {
  return async (value: T): Promise<AsyncValidationResult> => {
    try {
      await schema.parseAsync(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return {
          isValid: false,
          error: errorMessage || firstError.message,
        };
      }
      return {
        isValid: false,
        error: errorMessage || 'Validation failed',
      };
    }
  };
}

/**
 * Create an async validator that calls an API endpoint
 *
 * @param url - API endpoint URL
 * @param fieldName - Field name to validate
 * @param transformValue - Transform value before sending (optional)
 * @returns Async validator function
 *
 * @example
 * ```ts
 * const validateUniqueEmail = createAsyncApiValidator(
 *   '/api/users/check-email',
 *   'email'
 * );
 *
 * const result = await validateUniqueEmail('test@example.com');
 * // { isValid: true } or { isValid: false, error: 'Email already exists' }
 * ```
 */
export function createAsyncApiValidator<T = string>(
  url: string,
  fieldName: string,
  transformValue?: (value: T) => unknown
): AsyncValidator<T> {
  return async (value: T): Promise<AsyncValidationResult> => {
    try {
      const transformedValue = transformValue ? transformValue(value) : value;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [fieldName]: transformedValue }),
      });

      const data = await response.json();

      if (response.ok && data.isValid !== false) {
        return { isValid: true };
      }

      return {
        isValid: false,
        error: data.error || data.message || `${fieldName} is invalid`,
      };
    } catch (error) {
      // Network errors should not block validation
      console.warn('Async validation error:', error);
      return { isValid: true }; // Assume valid on network error
    }
  };
}

/**
 * Combine multiple async validators
 * Returns first error found, or valid if all pass
 *
 * @param validators - Array of async validators
 * @returns Combined async validator
 *
 * @example
 * ```ts
 * const validateEmail = createAsyncZodValidator(z.string().email());
 * const validateUnique = createAsyncApiValidator('/api/users/check-email', 'email');
 *
 * const combined = combineAsyncValidators(validateEmail, validateUnique);
 * const result = await combined('test@example.com');
 * ```
 */
export function combineAsyncValidators<T>(...validators: AsyncValidator<T>[]): AsyncValidator<T> {
  return async (value: T): Promise<AsyncValidationResult> => {
    for (const validator of validators) {
      const result = await validator(value);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  };
}

/**
 * Debounce an async validator
 * Useful for real-time validation to avoid too many API calls
 *
 * @param validator - Async validator function
 * @param delay - Debounce delay in milliseconds (default: 500ms)
 * @returns Debounced async validator
 *
 * @example
 * ```ts
 * const validateEmail = createAsyncApiValidator('/api/users/check-email', 'email');
 * const debouncedValidate = debounceAsyncValidator(validateEmail, 500);
 *
 * // Multiple calls within 500ms will only execute the last one
 * await debouncedValidate('test@example.com');
 * ```
 */
export function debounceAsyncValidator<T>(
  validator: AsyncValidator<T>,
  delay: number = 500
): AsyncValidator<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastValue: T | null = null;
  let lastResult: Promise<AsyncValidationResult> | null = null;

  return async (value: T): Promise<AsyncValidationResult> => {
    lastValue = value;

    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        // Only validate if value hasn't changed
        if (lastValue === value) {
          lastResult = validator(value);
          const result = await lastResult;
          resolve(result);
        } else {
          // Value changed, resolve with last result if available
          if (lastResult) {
            const result = await lastResult;
            resolve(result);
          } else {
            resolve({ isValid: true }); // Default to valid if no result yet
          }
        }
      }, delay);
    });
  };
}

/**
 * Cache async validation results
 * Useful to avoid duplicate API calls for the same value
 *
 * @param validator - Async validator function
 * @param cacheTTL - Cache TTL in milliseconds (default: 5 minutes)
 * @returns Cached async validator
 *
 * @example
 * ```ts
 * const validateEmail = createAsyncApiValidator('/api/users/check-email', 'email');
 * const cachedValidate = cacheAsyncValidator(validateEmail, 5 * 60 * 1000);
 *
 * // First call: API request
 * await cachedValidate('test@example.com');
 * // Second call (within TTL): Returns cached result
 * await cachedValidate('test@example.com');
 * ```
 */
export function cacheAsyncValidator<T>(
  validator: AsyncValidator<T>,
  cacheTTL: number = 5 * 60 * 1000 // 5 minutes
): AsyncValidator<T> {
  const cache = new Map<T, { result: AsyncValidationResult; timestamp: number }>();

  return async (value: T): Promise<AsyncValidationResult> => {
    const cached = cache.get(value);
    const now = Date.now();

    // Return cached result if still valid
    if (cached && now - cached.timestamp < cacheTTL) {
      return cached.result;
    }

    // Validate and cache result
    const result = await validator(value);
    cache.set(value, { result, timestamp: now });

    // Cleanup old cache entries
    if (cache.size > 100) {
      // Remove entries older than TTL
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp >= cacheTTL) {
          cache.delete(key);
        }
      }
    }

    return result;
  };
}
