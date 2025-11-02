/**
 * FormTemplateService - Service for managing form templates for employees
 */

import { createFormTemplateService } from '../../../shared/utils/createFormTemplateService';

const MODULE = 'employees';

export const formTemplateService = createFormTemplateService(MODULE);
export default formTemplateService;

