/**
 * FormTemplateService - Service for managing form templates for revenue
 */

import { createFormTemplateService } from '../../../shared/utils/createFormTemplateService';

const MODULE = 'revenue';

export const formTemplateService = createFormTemplateService(MODULE);
export default formTemplateService;

