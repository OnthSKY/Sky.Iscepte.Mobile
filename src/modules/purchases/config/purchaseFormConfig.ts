/**
 * Purchase Form Configuration
 * Centralized form fields and validation rules
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Purchase } from '../store/purchaseStore';

export const purchaseFormFields: DynamicField[] = [
  { name: 'productId', labelKey: 'product', type: 'select', required: true },
  { name: 'price', labelKey: 'price', type: 'number', required: true },
  { name: 'quantity', labelKey: 'quantity', type: 'number', required: true },
  { name: 'total', labelKey: 'total_amount', type: 'number', required: true },
  { name: 'supplierId', labelKey: 'supplier', type: 'select' },
  { name: 'date', labelKey: 'date', type: 'date', required: true },
  { name: 'title', labelKey: 'notes', type: 'textarea' },
];

export const purchaseValidator = (data: Partial<Purchase>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.productId) {
    errors.productId = 'Product is required';
  }
  if (!data.price || data.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }
  if (!data.quantity || data.quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  }
  if (!data.total || data.total <= 0) {
    errors.total = 'Total amount must be greater than 0';
  }
  return errors;
};

