/**
 * Product Form Configuration
 * Centralized form fields and validation rules
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Product } from '../services/productService';

export const productFormFields: DynamicField[] = [
  { name: 'name', labelKey: 'name', type: 'text', required: true },
  { name: 'sku', labelKey: 'sku', type: 'text' },
  { name: 'category', labelKey: 'category', type: 'custom' }, // Will be rendered as CategorySelect in ProductFormScreen
  { name: 'price', labelKey: 'price', type: 'number' },
  { name: 'currency', labelKey: 'currency', type: 'custom' }, // Will be rendered as CurrencySelect in ProductFormScreen
  { name: 'stock', labelKey: 'stock', type: 'number', defaultValue: 1 },
];

export const productValidator = (data: Partial<Product>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.name || (data.name as string).trim() === '') {
    errors.name = 'Name is required';
  }
  if (data.stock !== undefined && data.stock < 0) {
    errors.stock = 'Stock cannot be negative';
  }
  if (data.price !== undefined && data.price < 0) {
    errors.price = 'Price cannot be negative';
  }
  return errors;
};

