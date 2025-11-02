/**
 * Form Template Types
 * 
 * Types for form template system that allows cloning and customization of forms
 * across different modules and sectors
 */

import { DynamicField } from '../../shared/components/DynamicForm';

/**
 * Base form template structure
 * Contains standard fields + customizable fields
 */
export interface FormTemplate {
  id: string;
  module: string; // e.g., 'stock', 'customers', 'sales'
  name: string; // Template name (e.g., 'Hızlı Satış Formu', 'Detaylı Ürün Formu')
  description?: string;
  
  // Standard/base fields that every form template includes
  baseFields: DynamicField[];
  
  // Additional custom fields specific to this template
  customFields: DynamicField[];
  
  // Fields to display in list view (subset of baseFields + customFields)
  listFields?: string[]; // Array of field names (e.g., ['name', 'price', 'stock'])
  
  // Fields to display in detail view (subset of baseFields + customFields)
  // Priority order: listFields come first, then these additional fields
  detailFields?: string[]; // Array of field names for detail page
  
  // Whether this template is active and can be used
  isActive: boolean;
  
  // Whether this is the default template for the module
  isDefault: boolean;
  
  // Order/priority for display
  order: number;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Form template configuration for creating/updating templates
 */
export interface FormTemplateConfig {
  module: string;
  name: string;
  description?: string;
  baseFields: DynamicField[];
  customFields: DynamicField[];
  listFields?: string[]; // Fields to display in list view
  detailFields?: string[]; // Additional fields for detail view (after listFields)
  isActive?: boolean;
  isDefault?: boolean;
  order?: number;
}

/**
 * Response from API when listing templates
 */
export interface FormTemplateListResponse {
  items: FormTemplate[];
  total: number;
  page: number;
  pageSize: number;
}

