/**
 * Form Template Management Screen for Employees
 */

import { createFormTemplateManagementScreen } from '../../../shared/utils/createFormTemplateManagementScreen';
import * as hooks from '../hooks/useFormTemplatesQuery';
import { employeeFormFields } from '../config/employeeFormConfig';

export default createFormTemplateManagementScreen({
  module: 'employees',
  translationNamespace: 'employees',
  baseFields: employeeFormFields,
  hooks,
  defaultBackRoute: 'EmployeesModuleSettings',
});

