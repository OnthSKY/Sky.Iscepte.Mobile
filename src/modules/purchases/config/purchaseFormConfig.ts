/**
 * Purchase Form Configuration
 * Centralized form fields and validation rules
 * 
 * Base fields are always shown, type-specific fields are added dynamically
 */

import { DynamicField } from '../../../shared/components/DynamicForm';
import { Purchase } from '../store/purchaseStore';

// Base fields - Her zaman gösterilir
export const basePurchaseFormFields: DynamicField[] = [
  { name: 'isStockPurchase', labelKey: 'is_stock_purchase', type: 'boolean', defaultValue: true },
  { name: 'supplierId', labelKey: 'supplier', type: 'select' },
  { name: 'productId', labelKey: 'product', type: 'select', required: false },
  { name: 'price', labelKey: 'price', type: 'number', required: true },
  { name: 'quantity', labelKey: 'quantity', type: 'number', required: true },
  { name: 'total', labelKey: 'total_amount', type: 'number', required: true },
  { name: 'date', labelKey: 'date', type: 'date', required: true },
  { name: 'title', labelKey: 'notes', type: 'textarea' },
  { name: 'signature', labelKey: 'signature', type: 'custom', required: false },
  { name: 'photo', labelKey: 'photo', type: 'image', required: false },
];

// Legacy support - basePurchaseFormFields'e yönlendirir
export const purchaseFormFields = basePurchaseFormFields;

export const purchaseValidator = (data: Partial<Purchase>): Record<string, string> => {
  const errors: Record<string, string> = {};
  // ProductId is only required if it's a stock purchase
  const isStockPurchase = data.isStockPurchase !== false; // Default to true if not specified
  if (isStockPurchase && !data.productId) {
    errors.productId = 'Product is required for stock purchases';
  }
  if (!data.price || data.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }
  if (!data.quantity || data.quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  }
  if (!data.total || data.total <= 0) {
    errors.total = 'Total amount must be greater than 0';
  }
  return errors;
};

