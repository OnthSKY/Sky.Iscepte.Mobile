/**
 * Form Template Management Screen for Suppliers
 */

import { createFormTemplateManagementScreen } from '../../../shared/utils/createFormTemplateManagementScreen';
import * as hooks from '../hooks/useFormTemplatesQuery';
import { supplierFormFields } from '../config/supplierFormConfig';

export default createFormTemplateManagementScreen({
  module: 'suppliers',
  translationNamespace: 'suppliers',
  baseFields: supplierFormFields,
  hooks,
  defaultBackRoute: 'SuppliersDashboard',
});

