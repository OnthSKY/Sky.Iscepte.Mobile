/**
 * Shared Custom Fields Types
 * 
 * Base interface for custom fields used across all modules
 * (products, customers, purchases, etc.)
 */

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea';

export interface BaseCustomField {
  key: string;
  label: string;
  type: CustomFieldType;
  value: any;
  options?: Array<{ label: string; value: any }>; // for select type
  isGlobal?: boolean; // true: tüm entity'lerde kullanılabilir, false/undefined: sadece bu entity'ye özel
  required?: boolean; // true: zorunlu alan, false/undefined: opsiyonel
}

/**
 * Type alias for backward compatibility
 * All modules can now use BaseCustomField directly
 */
export type CustomField = BaseCustomField;

