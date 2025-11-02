/**
 * Customer Form Configuration
 * Centralized form fields and validation rules
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Customer } from '../services/customerService';
import i18n from '../../../i18n';

export const customerFormFields: DynamicField[] = [
  { name: 'name', labelKey: 'name', type: 'text', required: true, isLocked: true }, // Always required, cannot be removed
  { name: 'phone', labelKey: 'phone', type: 'text' },
  { name: 'email', labelKey: 'email', type: 'text' },
  { name: 'address', labelKey: 'address', type: 'text' },
  // Note: 'group' field removed from form - still exists in Customer interface for backward compatibility
  { name: 'debtLimit', labelKey: 'debt_limit', type: 'number', defaultValue: 0 },
];

export const customerValidator = (data: Partial<Customer>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.name || (data.name as string).trim() === '') {
    errors.name = i18n.t('customers:validation.name_required');
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = i18n.t('customers:validation.email_invalid');
  }
  if (data.phone && data.phone.length < 10) {
    errors.phone = i18n.t('customers:validation.phone_invalid');
  }
  if (data.debtLimit !== undefined && data.debtLimit < 0) {
    errors.debtLimit = i18n.t('customers:validation.debt_limit_negative');
  }
  return errors;
};

