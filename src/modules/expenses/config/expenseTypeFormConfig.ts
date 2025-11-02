/**
 * ExpenseType Form Configuration
 * Centralized form fields and validation rules
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { ExpenseType } from '../services/expenseTypeService';

export const expenseTypeFormFields: DynamicField[] = [
  { name: 'name', labelKey: 'expense_type_name', type: 'text', required: true, isLocked: true }, // Always required, cannot be removed
];

export const expenseTypeValidator = (data: Partial<ExpenseType>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.name || (data.name as string).trim() === '') {
    errors.name = 'Name is required';
  }
  return errors;
};

