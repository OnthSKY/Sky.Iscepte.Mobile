/**
 * FormTemplateService - Service for managing form templates for expenses
 */

import { createFormTemplateService } from '../../../shared/utils/createFormTemplateService';

const MODULE = 'expenses';

export const formTemplateService = createFormTemplateService(MODULE);
export default formTemplateService;

