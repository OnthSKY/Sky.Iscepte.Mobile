/**
 * Type Helpers
 *
 * NEDEN: Type safety için utility type'lar
 * - any kullanımını azaltmak için
 * - Type-safe utility functions
 * - Common type patterns
 */

/**
 * Unknown type guard
 *
 * NEDEN: any yerine unknown kullanmak için
 * - Type-safe type checking
 * - Runtime type validation
 */
export function isUnknown(value: unknown): value is unknown {
  return value !== undefined && value !== null;
}

/**
 * Type-safe object key access
 *
 * NEDEN: any kullanmadan object key'lere erişmek için
 * - Type-safe property access
 * - Runtime validation
 */
export function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
  return obj[key];
}

/**
 * Type-safe object property check
 *
 * NEDEN: any kullanmadan property kontrolü için
 * - Type-safe property checking
 * - Runtime validation
 */
export function hasProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

/**
 * Type-safe array filter
 *
 * NEDEN: any kullanmadan array filter için
 * - Type-safe filtering
 * - Type narrowing
 */
export function filterDefined<T>(items: (T | null | undefined)[]): T[] {
  return items.filter((item): item is T => item !== null && item !== undefined);
}

/**
 * Type-safe JSON parse
 *
 * NEDEN: any kullanmadan JSON parse için
 * - Type-safe parsing
 * - Runtime validation
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json);
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Type-safe error handling
 *
 * NEDEN: any kullanmadan error handling için
 * - Type-safe error checking
 * - Error type narrowing
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Get error message safely
 *
 * NEDEN: any kullanmadan error message almak için
 * - Type-safe error message extraction
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}
