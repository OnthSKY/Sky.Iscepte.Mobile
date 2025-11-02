/**
 * Custom Fields Utilities
 * Shared utilities for handling custom fields in forms
 */

import { BaseCustomField } from '../types/customFields';
import i18n from '../../i18n';

/**
 * Enhanced validator that includes validation for required global custom fields
 */
export function createEnhancedValidator<T extends { customFields?: BaseCustomField[] }>(
  baseValidator: (data: Partial<T>) => Record<string, string>,
  globalFields: BaseCustomField[],
  namespace: string
): (data: Partial<T>) => Record<string, string> {
  return (data: Partial<T>): Record<string, string> => {
    const errors = baseValidator(data);
    
    // Validate required global custom fields
    if (data.customFields && globalFields) {
      const activeGlobalFields = data.customFields.filter(f => f.isGlobal);
      globalFields.forEach(globalField => {
        if (globalField.required) {
          const activeField = activeGlobalFields.find(f => f.key === globalField.key);
          if (!activeField || !activeField.value || 
              (typeof activeField.value === 'string' && activeField.value.trim() === '') ||
              activeField.value === null || activeField.value === undefined) {
            errors[`customField_${globalField.key}`] = i18n.t(`${namespace}:validation.required`, { 
              field: globalField.label,
              defaultValue: `${globalField.label} is required`
            });
          }
        }
      });
    }
    
    return errors;
  };
}

/**
 * Get initial data for create mode with customFields
 */
export function getInitialDataWithCustomFields<T extends { customFields?: BaseCustomField[] }>(
  formMode: 'create' | 'edit',
  additionalDefaults?: Partial<T>
): Partial<T> {
  if (formMode === 'edit') {
    return {};
  }
  return {
    customFields: [],
    ...additionalDefaults,
  } as Partial<T>;
}

