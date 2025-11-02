/**
 * Generic Form Template Service Factory
 * Creates form template service for any module
 */

import httpService from '../services/httpService';
import { apiEndpoints } from '../../core/config/apiEndpoints';
import { FormTemplate, FormTemplateConfig } from '../types/formTemplate';

export function createFormTemplateService(module: string) {
  return {
    list: async (): Promise<FormTemplate[]> => {
      return httpService.get<FormTemplate[]>(apiEndpoints.formTemplates.list(module));
    },
    get: async (id: string | number): Promise<FormTemplate> => {
      return httpService.get<FormTemplate>(apiEndpoints.formTemplates.get(module, id));
    },
    create: async (config: FormTemplateConfig): Promise<FormTemplate> => {
      return httpService.post<FormTemplate>(apiEndpoints.formTemplates.create(module), config);
    },
    update: async (id: string | number, config: Partial<FormTemplateConfig>): Promise<FormTemplate> => {
      return httpService.put<FormTemplate>(apiEndpoints.formTemplates.update(module, id), config);
    },
    remove: async (id: string | number): Promise<void> => {
      return httpService.delete<void>(apiEndpoints.formTemplates.remove(module, id));
    },
    clone: async (id: string | number, newName: string): Promise<FormTemplate> => {
      return httpService.post<FormTemplate>(apiEndpoints.formTemplates.clone(module, id), { newName });
    },
    setDefault: async (id: string | number): Promise<FormTemplate> => {
      return httpService.post<FormTemplate>(apiEndpoints.formTemplates.setDefault(module, id));
    },
  };
}
