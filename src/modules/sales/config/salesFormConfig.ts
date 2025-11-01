/**
 * Sales Form Configuration
 * Centralized form fields and validation rules
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Sale } from '../store/salesStore';

export const salesFormFields: DynamicField[] = [
  { name: 'title', labelKey: 'product_name', type: 'text', required: true },
  { name: 'amount', labelKey: 'total_amount', type: 'number' },
];

export const salesValidator = (data: Partial<Sale>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.title || (data.title as string).trim() === '') {
    errors.title = 'Title is required';
  }
  return errors;
};

