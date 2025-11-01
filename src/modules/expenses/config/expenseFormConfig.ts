/**
 * Expense Form Configuration
 * Centralized form fields and validation rules
 * Note: Expense type selection is handled dynamically in the component
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Expense } from '../store/expenseStore';

export const baseExpenseFormFields: DynamicField[] = [
  { name: 'amount', labelKey: 'amount', type: 'number', required: true },
  { name: 'title', labelKey: 'title', type: 'text', required: true },
];

export const expenseValidator = (data: Partial<Expense>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.title || (data.title as string).trim() === '') {
    errors.title = 'Title is required';
  }
  if (!data.amount || Number(data.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  return errors;
};

