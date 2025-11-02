/**
 * Form Template Management Screen for Revenue
 */

import { createFormTemplateManagementScreen } from '../../../shared/utils/createFormTemplateManagementScreen';
import * as hooks from '../hooks/useFormTemplatesQuery';
import { baseRevenueFormFields } from '../config/revenueFormConfig';

export default createFormTemplateManagementScreen({
  module: 'revenue',
  translationNamespace: 'revenue',
  baseFields: baseRevenueFormFields,
  hooks,
  defaultBackRoute: 'RevenueDashboard',
});

