/**
 * Revenue Form Configuration
 * Centralized form fields and validation rules
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Revenue } from '../store/revenueStore';

export const baseRevenueFormFields: DynamicField[] = [
  { name: 'title', labelKey: 'title', type: 'text', required: true },
  { name: 'amount', labelKey: 'amount', type: 'number', required: true },
  { name: 'date', labelKey: 'date', type: 'date' },
  { name: 'description', labelKey: 'description', type: 'textarea' },
  { name: 'photo', labelKey: 'photo', type: 'image', required: false },
];

export const revenueValidator = (data: Partial<Revenue>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.title || (data.title as string).trim() === '') {
    errors.title = 'Title is required';
  }
  if (!data.amount || Number(data.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  // Ensure source is set for manual revenue
  if (!data.source) {
    // Auto-set source to manual if not provided
    (data as any).source = 'manual';
  }
  return errors;
};

