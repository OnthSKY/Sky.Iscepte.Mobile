/**
 * Form Template Management Screen for Expenses
 */

import { createFormTemplateManagementScreen } from '../../../shared/utils/createFormTemplateManagementScreen';
import * as hooks from '../hooks/useFormTemplatesQuery';
import { baseExpenseFormFields } from '../config/expenseFormConfig';

export default createFormTemplateManagementScreen({
  module: 'expenses',
  translationNamespace: 'expenses',
  baseFields: baseExpenseFormFields,
  hooks,
  defaultBackRoute: 'ExpensesDashboard',
});

