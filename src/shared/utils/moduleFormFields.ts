/**
 * Module Form Fields Helper
 * Provides base form fields for each module
 */

import { DynamicField } from '../components/DynamicForm';
import { customerFormFields } from '../../modules/customers/config/customerFormConfig';
import { productFormFields } from '../../modules/products/config/productFormConfig';
import { supplierFormFields } from '../../modules/suppliers/config/supplierFormConfig';
import { salesFormFields } from '../../modules/sales/config/salesFormConfig';
import { basePurchaseFormFields } from '../../modules/purchases/config/purchaseFormConfig';
import { baseExpenseFormFields } from '../../modules/expenses/config/expenseFormConfig';
import { baseRevenueFormFields } from '../../modules/revenue/config/revenueFormConfig';
import { employeeFormFields } from '../../modules/employees/config/employeeFormConfig';

/**
 * Module form fields mapping
 */
export const moduleFormFields: Record<string, DynamicField[]> = {
  stock: productFormFields,
  customers: customerFormFields,
  suppliers: supplierFormFields,
  sales: salesFormFields,
  purchases: basePurchaseFormFields,
  expenses: baseExpenseFormFields,
  revenue: baseRevenueFormFields,
  employees: employeeFormFields,
};

/**
 * Get base form fields for a module
 */
export function getModuleBaseFields(module: string): DynamicField[] {
  return moduleFormFields[module] || [];
}

/**
 * Get all modules that support form templates
 */
export function getSupportedModules(): string[] {
  return Object.keys(moduleFormFields);
}

