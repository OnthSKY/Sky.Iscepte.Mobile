/**
 * Form Template Management Screen for Sales
 */

import { createFormTemplateManagementScreen } from '../../../shared/utils/createFormTemplateManagementScreen';
import * as hooks from '../hooks/useFormTemplatesQuery';
import { salesFormFields } from '../config/salesFormConfig';

export default createFormTemplateManagementScreen({
  module: 'sales',
  translationNamespace: 'sales',
  baseFields: salesFormFields,
  hooks,
  defaultBackRoute: 'SalesDashboard',
});

