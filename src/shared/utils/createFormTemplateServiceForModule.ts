/**
 * Create form template service for a specific module dynamically
 */

import { createFormTemplateService } from './createFormTemplateService';

/**
 * Creates and returns form template service hooks for a given module
 */
export function createFormTemplateServiceForModule(module: string) {
  const formTemplateService = createFormTemplateService(module);

  return {
    service: formTemplateService,
    // Return hooks factory that can be used in components
    getHooks: () => {
      // This will be used dynamically in the component
      return {
        list: () => formTemplateService.list(),
        get: (id: string | number) => formTemplateService.get(id),
        create: (config: any) => formTemplateService.create(config),
        update: (id: string | number, config: any) => formTemplateService.update(id, config),
        remove: (id: string | number) => formTemplateService.remove(id),
        clone: (id: string | number, newName: string) => formTemplateService.clone(id, newName),
        setDefault: (id: string | number) => formTemplateService.setDefault(id),
      };
    },
  };
}

