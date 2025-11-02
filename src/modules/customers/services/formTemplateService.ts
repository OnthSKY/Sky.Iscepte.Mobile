/**
 * FormTemplateService - Service for managing form templates for customers
 */

import { createFormTemplateService } from '../../../shared/utils/createFormTemplateService';

const MODULE = 'customers';

export const formTemplateService = createFormTemplateService(MODULE);
export default formTemplateService;
