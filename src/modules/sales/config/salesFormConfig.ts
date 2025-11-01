/**
 * Sales Form Configuration
 * Centralized form fields and validation rules
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Sale } from '../store/salesStore';

export const salesFormFields: DynamicField[] = [
  { name: 'productId', labelKey: 'product', type: 'select', required: true },
  { name: 'price', labelKey: 'price', type: 'number', required: true },
  { name: 'quantity', labelKey: 'quantity', type: 'number', required: true },
  { name: 'amount', labelKey: 'total_amount', type: 'number', required: true },
  { name: 'customerId', labelKey: 'customer', type: 'select' },
  { name: 'title', labelKey: 'notes', type: 'textarea' },
];

export const salesValidator = (data: Partial<Sale>): Record<string, string> => {
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
  if (!data.amount || data.amount <= 0) {
    errors.amount = 'Total amount must be greater than 0';
  }
  return errors;
};

