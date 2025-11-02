/**
 * Custom Fields Utilities
 * Shared utilities for handling custom fields in forms
 */

import { BaseCustomField } from '../types/customFields';
import { DynamicField } from '../components/DynamicForm';
import i18n from '../../i18n';

/**
 * Enhanced validator that includes validation for required global custom fields and template fields
 */
export function createEnhancedValidator<T extends { customFields?: BaseCustomField[] }>(
  baseValidator: (data: Partial<T>) => Record<string, string>,
  globalFields: BaseCustomField[],
  namespace: string,
  templateFields?: DynamicField[] // Template fields (baseFields + customFields from template)
): (data: Partial<T>) => Record<string, string> {
  return (data: Partial<T>): Record<string, string> => {
    const errors = baseValidator(data);
    
    // Validate required fields from template (base fields + template custom fields)
    if (templateFields) {
      templateFields.forEach(field => {
        if (field.required && field.isActive !== false) {
          const fieldValue = (data as any)[field.name];
          const isEmpty = fieldValue === undefined || 
                         fieldValue === null || 
                         fieldValue === '' ||
                         (typeof fieldValue === 'string' && fieldValue.trim() === '');
          
          if (isEmpty) {
            // Get field label: try translation first, fallback to labelKey as display text
            let fieldLabel = field.labelKey;
            try {
              const translated = i18n.t(`${namespace}:${field.labelKey}`);
              // If translation found (different from key), use it; otherwise use labelKey as-is
              if (translated !== `${namespace}:${field.labelKey}`) {
                fieldLabel = translated;
              }
            } catch {
              // If translation fails, use labelKey as display text
              fieldLabel = field.labelKey;
            }
            
            // Try namespace-specific validation.required, fallback to common
            const errorMessage = i18n.t(`${namespace}:validation.required`, { 
              field: fieldLabel,
              defaultValue: undefined
            });
            if (errorMessage === `${namespace}:validation.required`) {
              // Fallback to common validation message
              errors[field.name] = i18n.t('common:errors.validation.required', { 
                field: fieldLabel,
                defaultValue: `${fieldLabel} gereklidir`
              });
            } else {
              errors[field.name] = errorMessage;
            }
          }
        }
      });
    }
    
    // Validate required global custom fields
    // Only validate fields that are:
    // 1. Required
    // 2. Active in the current form (present in data.customFields)
    if (data.customFields && globalFields) {
      const activeGlobalFields = data.customFields.filter(f => f.isGlobal);
      globalFields.forEach(globalField => {
        if (globalField.required) {
          // Check if field is active (exists in customFields)
          const activeField = activeGlobalFields.find(f => f.key === globalField.key);
          
          // If field is not active (not added to form), skip validation
          if (!activeField) {
            return; // Skip validation for inactive fields
          }
          
          // For boolean fields, false is a valid value, only check if field doesn't exist
          if (globalField.type === 'boolean') {
            if (!activeField || activeField.value === null || activeField.value === undefined) {
              // Try namespace-specific validation.required, fallback to common
              const errorMessage = i18n.t(`${namespace}:validation.required`, { 
                field: globalField.label,
                defaultValue: undefined
              });
              if (errorMessage === `${namespace}:validation.required`) {
                // Fallback to common validation message
                errors[`customField_${globalField.key}`] = i18n.t('common:errors.validation.required', { 
                  field: globalField.label,
                  defaultValue: `${globalField.label} gereklidir`
                });
              } else {
                errors[`customField_${globalField.key}`] = errorMessage;
              }
            }
          } else {
            // For other field types, check if value is empty
            const isEmpty = !activeField || 
              activeField.value === null || 
              activeField.value === undefined ||
              (typeof activeField.value === 'string' && activeField.value.trim() === '') ||
              (globalField.type === 'select' && (!activeField.value || activeField.value === '')) ||
              (Array.isArray(activeField.value) && activeField.value.length === 0);
            
            // For number fields, 0 is a valid value, only check if field is null/undefined/empty string
            if (globalField.type === 'number') {
              const isEmpty = !activeField || 
                activeField.value === null || 
                activeField.value === undefined ||
                activeField.value === '' ||
                isNaN(Number(activeField.value));
              
              if (isEmpty) {
                // Try namespace-specific validation.required, fallback to common
                const errorMessage = i18n.t(`${namespace}:validation.required`, { 
                  field: globalField.label,
                  defaultValue: undefined
                });
                if (errorMessage === `${namespace}:validation.required`) {
                  // Fallback to common validation message
                  errors[`customField_${globalField.key}`] = i18n.t('common:errors.validation.required', { 
                    field: globalField.label,
                    defaultValue: `${globalField.label} gereklidir`
                  });
                } else {
                  errors[`customField_${globalField.key}`] = errorMessage;
                }
              }
            } else if (isEmpty) {
              // For other types (text, date, select, textarea), check isEmpty
              // Try namespace-specific validation.required, fallback to common
              const errorMessage = i18n.t(`${namespace}:validation.required`, { 
                field: globalField.label,
                defaultValue: undefined
              });
              if (errorMessage === `${namespace}:validation.required`) {
                // Fallback to common validation message
                errors[`customField_${globalField.key}`] = i18n.t('common:errors.validation.required', { 
                  field: globalField.label,
                  defaultValue: `${globalField.label} gereklidir`
                });
              } else {
                errors[`customField_${globalField.key}`] = errorMessage;
              }
            }
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

