/**
 * FormTemplateService - Service for managing form templates for purchases
 */

import { createFormTemplateService } from '../../../shared/utils/createFormTemplateService';

const MODULE = 'purchases';

export const formTemplateService = createFormTemplateService(MODULE);
export default formTemplateService;

