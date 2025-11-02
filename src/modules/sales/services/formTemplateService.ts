/**
 * FormTemplateService - Service for managing form templates for sales
 */

import { createFormTemplateService } from '../../../shared/utils/createFormTemplateService';

const MODULE = 'sales';

export const formTemplateService = createFormTemplateService(MODULE);
export default formTemplateService;

