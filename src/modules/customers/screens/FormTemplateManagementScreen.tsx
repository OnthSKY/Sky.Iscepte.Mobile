/**
 * Form Template Management Screen for Customers
 */

import { createFormTemplateManagementScreen } from '../../../shared/utils/createFormTemplateManagementScreen';
import * as hooks from '../hooks/useFormTemplatesQuery';
import { customerFormFields } from '../config/customerFormConfig';

export default createFormTemplateManagementScreen({
  module: 'customers',
  translationNamespace: 'customers',
  baseFields: customerFormFields,
  hooks,
  defaultBackRoute: 'CustomersDashboard',
});
