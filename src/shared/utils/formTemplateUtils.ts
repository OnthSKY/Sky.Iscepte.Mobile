/**
 * Form Template Utilities
 * 
 * Helper functions for form template management
 */

import { BaseCustomField, CustomFieldType } from '../types/customFields';
import { DynamicField } from '../components/DynamicForm';

/**
 * Convert BaseCustomField to DynamicField
 */
export function customFieldToDynamicField(customField: BaseCustomField): DynamicField {
  return {
    name: customField.key,
    labelKey: customField.label, // Use label as labelKey
    type: mapCustomFieldTypeToDynamicFieldType(customField.type),
    required: customField.required || false,
    defaultValue: customField.value,
    options: customField.options,
  };
}

/**
 * Convert DynamicField to BaseCustomField
 */
export function dynamicFieldToCustomField(dynamicField: DynamicField, value?: any): BaseCustomField {
  return {
    key: dynamicField.name,
    label: dynamicField.labelKey || dynamicField.name,
    type: mapDynamicFieldTypeToCustomFieldType(dynamicField.type),
    value: value ?? dynamicField.defaultValue ?? '',
    options: dynamicField.options,
    required: dynamicField.required || false,
    isGlobal: false, // Template custom fields are not global by default
  };
}

/**
 * Map CustomFieldType to DynamicFieldType
 */
function mapCustomFieldTypeToDynamicFieldType(type: CustomFieldType): DynamicField['type'] {
  const mapping: Record<CustomFieldType, DynamicField['type']> = {
    text: 'text',
    number: 'number',
    date: 'date',
    select: 'select',
    boolean: 'boolean',
    textarea: 'textarea',
  };
  return mapping[type] || 'text';
}

/**
 * Map DynamicFieldType to CustomFieldType
 */
function mapDynamicFieldTypeToCustomFieldType(type: DynamicField['type']): CustomFieldType {
  const mapping: Record<DynamicField['type'], CustomFieldType> = {
    text: 'text',
    number: 'number',
    date: 'date',
    select: 'select',
    custom: 'text', // Custom type defaults to text
    textarea: 'textarea',
  };
  return mapping[type] || 'text';
}

/**
 * Load global fields for a module dynamically
 */
export async function loadGlobalFieldsForModule(module: string): Promise<BaseCustomField[]> {
  try {
    // Dynamic import based on module
    const moduleMapping: Record<string, () => Promise<any>> = {
      stock: () => import('../../modules/products/services/globalFieldsService'),
      customers: () => import('../../modules/customers/services/globalFieldsService'),
      suppliers: () => import('../../modules/suppliers/services/globalFieldsService'),
      sales: () => import('../../modules/sales/services/globalFieldsService'),
      purchases: () => import('../../modules/purchases/services/globalFieldsService'),
      expenses: () => import('../../modules/expenses/services/globalFieldsService'),
      revenue: () => import('../../modules/revenue/services/globalFieldsService'),
      employees: () => import('../../modules/employees/services/globalFieldsService'),
    };

    const importFn = moduleMapping[module];
    if (!importFn) {
      return [];
    }

    const moduleService = await importFn();
    const service = moduleService.default || moduleService.globalFieldsService;
    
    if (service && typeof service.getAll === 'function') {
      return await service.getAll();
    }

    return [];
  } catch (error) {
    console.warn(`Failed to load global fields for module ${module}:`, error);
    return [];
  }
}

