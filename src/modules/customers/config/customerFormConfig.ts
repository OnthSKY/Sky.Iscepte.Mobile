/**
 * Customer Form Configuration
 * Centralized form fields and validation rules
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Customer } from '../store/customerStore';

export const customerFormFields: DynamicField[] = [
  { name: 'name', labelKey: 'name', type: 'text', required: true },
  { name: 'phone', labelKey: 'phone', type: 'text' },
  { name: 'email', labelKey: 'email', type: 'text' },
  { name: 'debtLimit', labelKey: 'debt_limit', type: 'number' },
  { name: 'group', labelKey: 'group', type: 'text' },
];

export const customerValidator = (data: Partial<Customer>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.name || (data.name as string).trim() === '') {
    errors.name = 'Name is required';
  }
  return errors;
};

