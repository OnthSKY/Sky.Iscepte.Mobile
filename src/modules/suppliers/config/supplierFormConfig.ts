/**
 * Supplier Form Configuration
 * Centralized form fields and validation rules
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Supplier } from '../store/supplierStore';

export const supplierFormFields: DynamicField[] = [
  { name: 'name', labelKey: 'name', type: 'text', required: true, isLocked: true }, // Always required, cannot be removed
  { name: 'phone', labelKey: 'phone', type: 'text' },
  { name: 'email', labelKey: 'email', type: 'text' },
  { name: 'address', labelKey: 'address', type: 'textarea' },
];

export const supplierValidator = (data: Partial<Supplier>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.name || (data.name as string).trim() === '') {
    errors.name = 'Name is required';
  }
  return errors;
};

