/**
 * Employee Form Configuration
 * Centralized form fields and validation rules
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Employee } from '../store/employeeStore';

export const employeeFormFields: DynamicField[] = [
  { name: 'name', labelKey: 'name', type: 'text', required: true },
  { name: 'email', labelKey: 'email', type: 'text' },
  { name: 'phone', labelKey: 'phone', type: 'text' },
  { name: 'role', labelKey: 'role', type: 'text' },
];

export const employeeValidator = (data: Partial<Employee>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.name || (data.name as string).trim() === '') {
    errors.name = 'Name is required';
  }
  return errors;
};

