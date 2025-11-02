/**
 * FormTemplateService - Service for managing form templates for suppliers
 */

import { createFormTemplateService } from '../../../shared/utils/createFormTemplateService';

const MODULE = 'suppliers';

export const formTemplateService = createFormTemplateService(MODULE);
export default formTemplateService;

