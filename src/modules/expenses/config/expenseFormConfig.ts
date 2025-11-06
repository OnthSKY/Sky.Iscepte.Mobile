/**
 * Expense Form Configuration
 * Centralized form fields and validation rules
 * Note: Expense type selection is handled dynamically in the component
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Expense } from '../store/expenseStore';

export const baseExpenseFormFields: DynamicField[] = [
  { name: 'title', labelKey: 'title', type: 'text', required: true, isLocked: true }, // Always required, cannot be removed
  { name: 'amount', labelKey: 'amount', type: 'number', required: true, isLocked: true }, // Always required, cannot be removed
  { name: 'date', labelKey: 'date', type: 'date' },
  { name: 'description', labelKey: 'description', type: 'textarea' },
  { name: 'photo', labelKey: 'photo', type: 'image', required: false },
];

export const expenseValidator = (data: Partial<Expense>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.title || (data.title as string).trim() === '') {
    errors.title = 'Title is required';
  }
  if (!data.amount || Number(data.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  // Ensure source is set for manual expenses
  if (!data.source) {
    // Auto-set source to manual if not provided
    (data as any).source = 'manual';
  }
  // Ensure type is always expense (income has separate module)
  (data as any).type = 'expense';
  return errors;
};

