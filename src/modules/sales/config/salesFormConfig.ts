/**
 * Sales Form Configuration
 * Centralized form fields and validation rules
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Sale } from '../store/salesStore';
import { formatDate } from '../../../core/utils/dateUtils';

export const salesFormFields: DynamicField[] = [
  { name: 'productId', labelKey: 'product', type: 'select', required: true },
  { name: 'price', labelKey: 'price', type: 'number', required: true },
  { name: 'quantity', labelKey: 'quantity', type: 'number', required: true },
  { name: 'amount', labelKey: 'total_amount', type: 'number', required: true },
  { name: 'customerId', labelKey: 'customer', type: 'select' },
  { name: 'date', labelKey: 'date', type: 'date', required: true, defaultValue: formatDate(new Date()) },
  { name: 'debtCollectionDate', labelKey: 'debt_collection_date', type: 'date', required: false },
  // Note: 'title' (notes) field is rendered separately in SalesFormScreen for better visibility
  { name: 'photo', labelKey: 'photo', type: 'image', required: false },
];

export const salesValidator = (data: Partial<Sale>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // If bulk sale (has items array)
  if (data.items && data.items.length > 0) {
    // Validate items
    data.items.forEach((item, index) => {
      if (!item.productId) {
        errors[`items[${index}].productId`] = 'Product is required';
      }
      if (!item.price || item.price <= 0) {
        errors[`items[${index}].price`] = 'Price must be greater than 0';
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`items[${index}].quantity`] = 'Quantity must be greater than 0';
      }
    });
    
    if (!data.amount || data.amount <= 0) {
      errors.amount = 'Total amount must be greater than 0';
    }
  } else {
    // Single product sale validation
    if (!data.productId) {
      errors.productId = 'Product is required';
    }
    if (!data.price || data.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    if (!data.quantity || data.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    if (!data.amount || data.amount <= 0) {
      errors.amount = 'Total amount must be greater than 0';
    }
  }
  
  return errors;
};

