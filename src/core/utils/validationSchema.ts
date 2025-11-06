/**
 * Validation Schema Builder
 *
 * Single Responsibility: Provides utilities for building validation schemas with Zod
 * Open/Closed: Easy to extend with new schema builders
 *
 * Features:
 * - Schema-based validation with Zod
 * - Field-level validation schemas
 * - Custom validation rules
 * - Type-safe validation
 */

import { z } from 'zod';
import i18n from '../../i18n';

/**
 * Get translated validation message (lazy evaluation)
 * This ensures messages are always in the current language
 */
function getTranslatedMessage(
  key: string,
  defaultValue?: string,
  params?: Record<string, unknown>
): string {
  return i18n.t(key, { defaultValue, ...params });
}

/**
 * Common validation schemas with lazy i18n message evaluation
 * Messages are resolved at validation time, not at schema creation time
 */
export const validationSchemas = {
  /**
   * Required string schema
   */
  requiredString: (message?: string) =>
    z.string().min(1, {
      message: message || getTranslatedMessage('common:errors.required'),
    }),

  /**
   * Email schema
   */
  email: (message?: string) =>
    z.string().email({
      message: message || getTranslatedMessage('common:errors.email'),
    }),

  /**
   * Phone number schema
   */
  phone: (message?: string) =>
    z.string().regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, {
      message:
        message || getTranslatedMessage('common:errors.invalid_phone', 'Invalid phone number'),
    }),

  /**
   * URL schema
   */
  url: (message?: string) =>
    z.string().url({
      message: message || getTranslatedMessage('common:errors.invalid_url', 'Invalid URL'),
    }),

  /**
   * Positive number schema
   */
  positiveNumber: (message?: string) =>
    z.number().positive({
      message:
        message || getTranslatedMessage('common:errors.must_be_positive', 'Must be greater than 0'),
    }),

  /**
   * Non-negative number schema
   */
  nonNegativeNumber: (message?: string) =>
    z.number().min(0, {
      message:
        message ||
        getTranslatedMessage(
          'common:errors.must_be_non_negative',
          'Must be greater than or equal to 0'
        ),
    }),

  /**
   * String length schema
   */
  stringLength: (min: number, max: number, minMessage?: string, maxMessage?: string) =>
    z
      .string()
      .min(min, {
        message: minMessage || getTranslatedMessage('common:errors.min_length', undefined, { min }),
      })
      .max(max, {
        message: maxMessage || getTranslatedMessage('common:errors.max_length', undefined, { max }),
      }),

  /**
   * Number range schema
   */
  numberRange: (min: number, max: number, message?: string) =>
    z
      .number()
      .min(min, {
        message:
          message ||
          getTranslatedMessage('common:errors.range', `Must be between ${min} and ${max}`, {
            min,
            max,
          }),
      })
      .max(max, {
        message:
          message ||
          getTranslatedMessage('common:errors.range', `Must be between ${min} and ${max}`, {
            min,
            max,
          }),
      }),
};

/**
 * Create a validation schema from field configuration
 *
 * @param field - Field configuration
 * @param namespace - Translation namespace
 * @returns Zod schema
 *
 * @example
 * ```ts
 * const schema = createFieldSchema({
 *   name: 'email',
 *   type: 'text',
 *   required: true,
 * }, 'users');
 *
 * const result = schema.parse('test@example.com');
 * ```
 */
export function createFieldSchema(
  field: {
    name: string;
    type: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    customValidation?: (value: unknown) => z.ZodIssue | null;
  },
  _namespace: string = 'common'
): z.ZodSchema {
  let schema: z.ZodSchema;

  // Base schema based on field type
  switch (field.type) {
    case 'email':
      schema = validationSchemas.email();
      break;
    case 'phone':
      schema = validationSchemas.phone();
      break;
    case 'url':
      schema = validationSchemas.url();
      break;
    case 'number':
    case 'decimal':
      schema = z.number({
        required_error: getTranslatedMessage('common:errors.required'),
        invalid_type_error: getTranslatedMessage('common:errors.not_a_number', 'Must be a number'),
      });
      if (field.min !== undefined) {
        schema = (schema as z.ZodNumber).min(field.min, {
          message: getTranslatedMessage('common:errors.min', `Must be at least ${field.min}`, {
            min: field.min,
          }),
        });
      }
      if (field.max !== undefined) {
        schema = (schema as z.ZodNumber).max(field.max, {
          message: getTranslatedMessage('common:errors.max', `Must be at most ${field.max}`, {
            max: field.max,
          }),
        });
      }
      break;
    case 'text':
    case 'textarea':
    default:
      schema = z.string({
        required_error: getTranslatedMessage('common:errors.required'),
        invalid_type_error: getTranslatedMessage(
          'common:errors.invalid_string',
          'Must be a string'
        ),
      });
      if (field.minLength !== undefined) {
        schema = (schema as z.ZodString).min(field.minLength, {
          message: getTranslatedMessage('common:errors.min_length', undefined, {
            min: field.minLength,
          }),
        });
      }
      if (field.maxLength !== undefined) {
        schema = (schema as z.ZodString).max(field.maxLength, {
          message: getTranslatedMessage('common:errors.max_length', undefined, {
            max: field.maxLength,
          }),
        });
      }
      if (field.pattern) {
        schema = (schema as z.ZodString).regex(field.pattern, {
          message: getTranslatedMessage('common:errors.invalid_format', 'Invalid format'),
        });
      }
      break;
  }

  // Make optional if not required
  if (!field.required) {
    schema = schema.optional();
  }

  // Add custom validation if provided
  if (field.customValidation) {
    schema = schema.refine(
      (value) => {
        const issue = field.customValidation?.(value);
        return issue === null;
      },
      (value) => {
        const issue = field.customValidation?.(value);
        return (
          issue || {
            message: getTranslatedMessage('common:errors.validation_failed', 'Validation failed'),
          }
        );
      }
    );
  }

  return schema;
}

/**
 * Create a form validation schema from field configurations
 *
 * @param fields - Array of field configurations
 * @param namespace - Translation namespace
 * @returns Zod object schema
 *
 * @example
 * ```ts
 * const schema = createFormSchema([
 *   { name: 'email', type: 'email', required: true },
 *   { name: 'name', type: 'text', required: true, minLength: 2 },
 * ], 'users');
 *
 * const result = schema.parse({ email: 'test@example.com', name: 'John' });
 * ```
 */
export function createFormSchema(
  fields: {
    name: string;
    type: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    customValidation?: (value: unknown) => z.ZodIssue | null;
  }[],
  namespace: string = 'common'
): z.ZodObject<Record<string, z.ZodSchema>> {
  const shape: Record<string, z.ZodSchema> = {};

  fields.forEach((field) => {
    shape[field.name] = createFieldSchema(field, namespace);
  });

  return z.object(shape);
}

/**
 * Convert Zod error to validation errors object
 * Translates error messages to current language if needed
 *
 * @param error - Zod error
 * @returns Validation errors object (field name -> error message)
 *
 * @example
 * ```ts
 * try {
 *   schema.parse(data);
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     const errors = zodErrorToValidationErrors(error);
 *     // { email: 'Invalid email', name: 'Required' }
 *   }
 * }
 * ```
 */
export function zodErrorToValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    // Error message is already translated (lazy evaluation at schema creation)
    // But we re-translate at validation time to ensure current language
    let { message } = err;

    // Re-translate common error patterns to ensure current language
    if (err.code === 'too_small') {
      if (err.type === 'string') {
        message = getTranslatedMessage('common:errors.min_length', message, {
          min: err.minimum || 0,
        });
      } else if (err.type === 'number') {
        message = getTranslatedMessage('common:errors.min', message, {
          min: err.minimum || 0,
        });
      }
    } else if (err.code === 'too_big') {
      if (err.type === 'string') {
        message = getTranslatedMessage('common:errors.max_length', message, {
          max: err.maximum || 0,
        });
      } else if (err.type === 'number') {
        message = getTranslatedMessage('common:errors.max', message, {
          max: err.maximum || 0,
        });
      }
    } else if (err.code === 'invalid_type' && err.received === 'undefined') {
      message = getTranslatedMessage('common:errors.required', message);
    } else if (err.code === 'invalid_string' && err.validation === 'email') {
      message = getTranslatedMessage('common:errors.email', message);
    } else if (err.code === 'invalid_string' && err.validation === 'url') {
      message = getTranslatedMessage('common:errors.invalid_url', message);
    } else if (err.code === 'invalid_string' && err.validation === 'regex') {
      message = getTranslatedMessage('common:errors.invalid_format', message);
    }

    errors[path] = message;
  });

  return errors;
}

/**
 * Validate data against a schema
 *
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Validation result with errors
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   email: z.string().email(),
 *   name: z.string().min(2),
 * });
 *
 * const result = validateSchema(schema, { email: 'test@example.com', name: 'J' });
 * // { isValid: false, errors: { name: 'String must contain at least 2 character(s)' } }
 * ```
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { isValid: boolean; errors: Record<string, string>; data?: T } {
  try {
    const parsed = schema.parse(data);
    return { isValid: true, errors: {}, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: zodErrorToValidationErrors(error),
      };
    }
    return {
      isValid: false,
      errors: { _general: 'Validation failed' },
    };
  }
}
