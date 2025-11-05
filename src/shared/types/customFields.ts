/**
 * Shared Custom Fields Types
 * 
 * Base interface for custom fields used across all modules
 * (products, customers, purchases, etc.)
 */

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea' | 'signature' | 'image';

export interface BaseCustomField {
  key: string;
  label: string;
  type: CustomFieldType;
  value: any;
  options?: Array<{ label: string; value: any }>; // for select type
  isGlobal?: boolean; // Deprecated: Artık kullanılmıyor, backward compatibility için tutuluyor. Her zaman false olmalı.
  required?: boolean; // true: zorunlu alan, false/undefined: opsiyonel
}

/**
 * Type alias for backward compatibility
 * All modules can now use BaseCustomField directly
 */
export type CustomField = BaseCustomField;

