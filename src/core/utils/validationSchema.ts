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
 * Common validation schemas
 */
export const validationSchemas = {
  /**
   * Required string schema
   */
  requiredString: (message?: string) =>
    z.string().min(1, message || i18n.t('common:errors.required')),

  /**
   * Email schema
   */
  email: (message?: string) => z.string().email(message || i18n.t('common:errors.email')),

  /**
   * Phone number schema
   */
  phone: (message?: string) =>
    z
      .string()
      .regex(
        /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
        message || i18n.t('common:errors.invalid_phone', { defaultValue: 'Invalid phone number' })
      ),

  /**
   * URL schema
   */
  url: (message?: string) =>
    z.string().url(message || i18n.t('common:errors.invalid_url', { defaultValue: 'Invalid URL' })),

  /**
   * Positive number schema
   */
  positiveNumber: (message?: string) =>
    z
      .number()
      .positive(
        message ||
          i18n.t('common:errors.must_be_positive', { defaultValue: 'Must be greater than 0' })
      ),

  /**
   * Non-negative number schema
   */
  nonNegativeNumber: (message?: string) =>
    z
      .number()
      .min(
        0,
        message ||
          i18n.t('common:errors.must_be_non_negative', {
            defaultValue: 'Must be greater than or equal to 0',
          })
      ),

  /**
   * String length schema
   */
  stringLength: (min: number, max: number, minMessage?: string, maxMessage?: string) =>
    z
      .string()
      .min(min, minMessage || i18n.t('common:errors.min_length', { min }))
      .max(max, maxMessage || i18n.t('common:errors.max_length', { max })),

  /**
   * Number range schema
   */
  numberRange: (min: number, max: number, message?: string) =>
    z
      .number()
      .min(
        min,
        message ||
          i18n.t('common:errors.range', {
            min,
            max,
            defaultValue: `Must be between ${min} and ${max}`,
          })
      )
      .max(
        max,
        message ||
          i18n.t('common:errors.range', {
            min,
            max,
            defaultValue: `Must be between ${min} and ${max}`,
          })
      ),
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
      schema = z.number();
      if (field.min !== undefined) {
        schema = (schema as z.ZodNumber).min(field.min);
      }
      if (field.max !== undefined) {
        schema = (schema as z.ZodNumber).max(field.max);
      }
      break;
    case 'text':
    case 'textarea':
    default:
      schema = z.string();
      if (field.minLength !== undefined) {
        schema = (schema as z.ZodString).min(field.minLength);
      }
      if (field.maxLength !== undefined) {
        schema = (schema as z.ZodString).max(field.maxLength);
      }
      if (field.pattern) {
        schema = (schema as z.ZodString).regex(field.pattern);
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
        return issue || { message: 'Validation failed' };
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
    errors[path] = err.message;
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
