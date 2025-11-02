/**
 * Render Fields From Template Utilities
 * 
 * Helper functions to render fields based on form template configuration
 */

import { DynamicField } from '../components/DynamicForm';
import { FormTemplate } from '../types/formTemplate';
import { getModuleBaseFields } from './moduleFormFields';

/**
 * Get all available fields from a template (base + custom)
 */
export function getTemplateFields(template: FormTemplate | null, module: string): DynamicField[] {
  if (!template) {
    // No template - use default base fields
    return getModuleBaseFields(module);
  }
  
  // Combine base and custom fields from template
  return [...(template.baseFields || []), ...(template.customFields || [])];
}

/**
 * Get list fields from template (for list view)
 * Returns fields that should be displayed in list view
 */
export function getListFields(
  template: FormTemplate | null,
  module: string,
  item: Record<string, any>
): Array<{ field: DynamicField; value: any; labelKey: string }> {
  const allFields = getTemplateFields(template, module);
  
  // If template has listFields defined, use those
  if (template?.listFields && template.listFields.length > 0) {
    return template.listFields
      .map(fieldName => {
        const field = allFields.find(f => f.name === fieldName);
        if (!field) return null;
        
        return {
          field,
          value: item[fieldName],
          labelKey: field.labelKey || field.name,
        };
      })
      .filter((item): item is { field: DynamicField; value: any; labelKey: string } => item !== null);
  }
  
  // Default: show name and a few common fields
  const defaultFields = ['name', 'price', 'stock', 'category', 'sku'];
  return defaultFields
    .map(fieldName => {
      const field = allFields.find(f => f.name === fieldName);
      if (!field) return null;
      
      return {
        field,
        value: item[fieldName],
        labelKey: field.labelKey || field.name,
      };
    })
    .filter((item): item is { field: DynamicField; value: any; labelKey: string } => item !== null);
}

/**
 * Get detail fields from template (for detail view)
 * Returns fields that should be displayed in detail view
 * Priority: listFields first, then detailFields
 */
export function getDetailFields(
  template: FormTemplate | null,
  module: string,
  item: Record<string, any>
): Array<{ field: DynamicField; value: any; labelKey: string; isFromList: boolean }> {
  const allFields = getTemplateFields(template, module);
  const listFieldNames = template?.listFields || [];
  const detailFieldNames = template?.detailFields || [];
  
  // Start with list fields (higher priority)
  const listFields = listFieldNames
    .map(fieldName => {
      const field = allFields.find(f => f.name === fieldName);
      if (!field) return null;
      
      return {
        field,
        value: item[fieldName],
        labelKey: field.labelKey || field.name,
        isFromList: true,
      };
    })
    .filter((item): item is { field: DynamicField; value: any; labelKey: string; isFromList: boolean } => item !== null);
  
  // Add detail fields (that are not in list fields)
  const detailFields = detailFieldNames
    .filter(fieldName => !listFieldNames.includes(fieldName))
    .map(fieldName => {
      const field = allFields.find(f => f.name === fieldName);
      if (!field) return null;
      
      return {
        field,
        value: item[fieldName],
        labelKey: field.labelKey || field.name,
        isFromList: false,
      };
    })
    .filter((item): item is { field: DynamicField; value: any; labelKey: string; isFromList: boolean } => item !== null);
  
  // If no template fields defined, show all fields
  if (listFields.length === 0 && detailFields.length === 0) {
    return allFields
      .map(field => ({
        field,
        value: item[field.name],
        labelKey: field.labelKey || field.name,
        isFromList: false,
      }))
      .filter(item => item.value !== undefined && item.value !== null && item.value !== '');
  }
  
  // Combine: list fields first, then detail fields
  return [...listFields, ...detailFields];
}

/**
 * Format field value based on field type
 */
export function formatFieldValue(
  field: DynamicField,
  value: any,
  t: (key: string) => string,
  namespace?: string
): string {
  if (value === undefined || value === null || value === '') {
    return '—';
  }
  
  const getTranslation = (key: string) => {
    return namespace ? t(`${namespace}:${key}`) : t(key);
  };
  
  switch (field.type) {
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value);
    case 'date':
      try {
        const date = new Date(value);
        return new Intl.DateTimeFormat('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(date);
      } catch {
        return String(value);
      }
    case 'select':
      if (field.options) {
        const option = field.options.find(opt => opt.value === value || String(opt.value) === String(value));
        return option?.label || String(value);
      }
      return String(value);
    case 'custom':
      // For custom fields, might be stored differently
      return String(value);
    case 'textarea':
    case 'text':
    default:
      return String(value);
  }
}

