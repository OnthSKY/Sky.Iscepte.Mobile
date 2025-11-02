/**
 * Form Template Management Screen for Purchases
 */

import { createFormTemplateManagementScreen } from '../../../shared/utils/createFormTemplateManagementScreen';
import * as hooks from '../hooks/useFormTemplatesQuery';
import { basePurchaseFormFields } from '../config/purchaseFormConfig';

export default createFormTemplateManagementScreen({
  module: 'purchases',
  translationNamespace: 'purchases',
  baseFields: basePurchaseFormFields,
  hooks,
  defaultBackRoute: 'PurchasesDashboard',
});

