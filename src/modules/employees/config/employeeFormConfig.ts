/**
 * Employee Form Configuration
 * Centralized form fields and validation rules
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Employee } from '../store/employeeStore';
import i18n from '../../../i18n';

export const employeeFormFields: DynamicField[] = [
  // Basic Information
  { name: 'firstName', labelKey: 'first_name', type: 'text', required: true },
  { name: 'lastName', labelKey: 'last_name', type: 'text', required: true },
  { name: 'email', labelKey: 'email', type: 'text' },
  { name: 'phone', labelKey: 'phone', type: 'text' },
  { name: 'position', labelKey: 'position', type: 'text' },
  { name: 'salary', labelKey: 'salary', type: 'number' }, // Not required
  { name: 'hireDate', labelKey: 'hire_date', type: 'date' },
];

export const employeeUserAccountFields: DynamicField[] = [
  { name: 'username', labelKey: 'username', type: 'text', required: true },
  { name: 'password', labelKey: 'password', type: 'text', required: true },
];

export const employeeValidator = (data: Partial<Employee>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.firstName || (data.firstName as string).trim() === '') {
    errors.firstName = i18n.t('employees:errors.first_name_required', { defaultValue: 'First name is required' });
  }
  
  if (!data.lastName || (data.lastName as string).trim() === '') {
    errors.lastName = i18n.t('employees:errors.last_name_required', { defaultValue: 'Last name is required' });
  }
  
  return errors;
};

