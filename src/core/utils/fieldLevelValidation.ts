/**
 * Field-Level Validation Utilities
 *
 * Single Responsibility: Provides field-level real-time validation
 * Open/Closed: Easy to extend with new field-level validators
 *
 * Features:
 * - Real-time field validation
 * - Debounced validation
 * - Field validation state management
 * - Integration with form validation
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import { AsyncValidator, debounceAsyncValidator, cacheAsyncValidator } from './asyncValidators';
import { z } from 'zod';

/**
 * Field validation state
 */
export interface FieldValidationState {
  isValidating: boolean;
  isValid: boolean | null; // null = not validated yet
  error?: string;
}

/**
 * Field-level validation options
 */
export interface FieldValidationOptions {
  /**
   * Async validator function
   */
  asyncValidator?: AsyncValidator<unknown>;

  /**
   * Zod schema for validation
   */
  schema?: z.ZodSchema;

  /**
   * Debounce delay in milliseconds (default: 500ms)
   */
  debounceDelay?: number;

  /**
   * Enable caching (default: true)
   */
  enableCache?: boolean;

  /**
   * Cache TTL in milliseconds (default: 5 minutes)
   */
  cacheTTL?: number;

  /**
   * Validate on blur (default: true)
   */
  validateOnBlur?: boolean;

  /**
   * Validate on change (default: false)
   */
  validateOnChange?: boolean;
}

/**
 * Field-level validation result
 */
export interface FieldValidationResult {
  state: FieldValidationState;
  validate: () => Promise<void>;
  clear: () => void;
}

/**
 * useFieldValidation hook
 * Provides field-level real-time validation
 *
 * @param value - Field value
 * @param options - Validation options
 * @returns Field validation result
 *
 * @example
 * ```tsx
 * const { state, validate, clear } = useFieldValidation(
 *   email,
 *   {
 *     schema: z.string().email(),
 *     validateOnChange: true,
 *     debounceDelay: 500,
 *   }
 * );
 *
 * return (
 *   <TextInput
 *     value={email}
 *     onChangeText={(text) => {
 *       setEmail(text);
 *       validate();
 *     }}
 *     error={state.error}
 *   />
 * );
 * ```
 */
export function useFieldValidation(
  value: unknown,
  options: FieldValidationOptions = {}
): FieldValidationResult {
  const {
    asyncValidator,
    schema,
    debounceDelay = 500,
    enableCache = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    validateOnBlur: _validateOnBlur = true,
    validateOnChange = false,
  } = options;

  const [state, setState] = useState<FieldValidationState>({
    isValidating: false,
    isValid: null,
  });

  const validatorRef = useRef<AsyncValidator<unknown> | null>(null);

  // Setup validator
  useEffect(() => {
    let validator: AsyncValidator<unknown> | null = null;

    if (asyncValidator) {
      validator = asyncValidator;
    } else if (schema) {
      validator = async (val: unknown) => {
        try {
          await schema.parseAsync(val);
          return { isValid: true };
        } catch (error) {
          if (error instanceof z.ZodError) {
            const firstError = error.errors[0];
            return {
              isValid: false,
              error: firstError.message,
            };
          }
          return {
            isValid: false,
            error: 'Validation failed',
          };
        }
      };
    }

    if (validator) {
      // Apply debounce
      let debouncedValidator = debounceAsyncValidator(validator, debounceDelay);

      // Apply cache if enabled
      if (enableCache) {
        debouncedValidator = cacheAsyncValidator(debouncedValidator, cacheTTL);
      }

      validatorRef.current = debouncedValidator;
    } else {
      validatorRef.current = null;
    }
  }, [asyncValidator, schema, debounceDelay, enableCache, cacheTTL]);

  // Validate function
  const validate = useCallback(async () => {
    if (!validatorRef.current) {
      return;
    }

    setState((prev) => ({ ...prev, isValidating: true }));

    try {
      const result = await validatorRef.current(value);
      setState({
        isValidating: false,
        isValid: result.isValid,
        error: result.error,
      });
    } catch (error) {
      setState({
        isValidating: false,
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      });
    }
  }, [value]);

  // Clear validation state
  const clear = useCallback(() => {
    setState({
      isValidating: false,
      isValid: null,
    });
  }, []);

  // Auto-validate on change if enabled
  useEffect(() => {
    if (validateOnChange && validatorRef.current) {
      validate();
    }
  }, [value, validateOnChange, validate]);

  return {
    state,
    validate,
    clear,
  };
}

/**
 * useFormFieldValidation hook
 * Provides field-level validation for form fields
 *
 * @param fieldName - Field name
 * @param value - Field value
 * @param options - Validation options
 * @returns Field validation result
 *
 * @example
 * ```tsx
 * const { state, validate, clear } = useFormFieldValidation(
 *   'email',
 *   email,
 *   {
 *     schema: z.string().email(),
 *     validateOnChange: true,
 *   }
 * );
 * ```
 */
export function useFormFieldValidation(
  fieldName: string,
  value: unknown,
  options: FieldValidationOptions = {}
): FieldValidationResult {
  return useFieldValidation(value, options);
}
