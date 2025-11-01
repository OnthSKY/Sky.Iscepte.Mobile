/**
 * Product Form Configuration
 * Centralized form fields and validation rules
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Product } from '../services/productService';

export const productFormFields: DynamicField[] = [
  { name: 'name', labelKey: 'name', type: 'text', required: true },
  { name: 'sku', labelKey: 'sku', type: 'text' },
  { name: 'category', labelKey: 'category', type: 'text' },
  { name: 'price', labelKey: 'price', type: 'number' },
  { name: 'stock', labelKey: 'stock', type: 'number' },
];

export const productValidator = (data: Partial<Product>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.name || (data.name as string).trim() === '') {
    errors.name = 'Name is required';
  }
  return errors;
};

