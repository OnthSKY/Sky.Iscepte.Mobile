/**
 * Form Templates Query Hooks for Customers
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import formTemplateService from '../services/formTemplateService';
import { FormTemplate, FormTemplateConfig } from '../../../shared/types/formTemplate';

export const formTemplateKeys = {
  all: (module: string) => [module, 'form-templates'] as const,
  lists: (module: string) => [...formTemplateKeys.all(module), 'list'] as const,
  list: (module: string) => [...formTemplateKeys.lists(module)] as const,
  details: (module: string) => [...formTemplateKeys.all(module), 'detail'] as const,
  detail: (module: string, id: string | number) => [...formTemplateKeys.details(module), id] as const,
};

const MODULE = 'customers';

export function useFormTemplatesQuery() {
  return useQuery({
    queryKey: formTemplateKeys.list(MODULE),
    queryFn: () => formTemplateService.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFormTemplateQuery(id: string | number | null | undefined) {
  return useQuery({
    queryKey: formTemplateKeys.detail(MODULE, id!),
    queryFn: () => formTemplateService.get(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateFormTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: FormTemplateConfig) => formTemplateService.create(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formTemplateKeys.list(MODULE) });
    },
  });
}

export function useUpdateFormTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, config }: { id: string | number; config: Partial<FormTemplateConfig> }) =>
      formTemplateService.update(id, config),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: formTemplateKeys.list(MODULE) });
      queryClient.invalidateQueries({ queryKey: formTemplateKeys.detail(MODULE, data.id) });
    },
  });
}

export function useDeleteFormTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => formTemplateService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formTemplateKeys.list(MODULE) });
    },
  });
}

export function useCloneFormTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newName }: { id: string | number; newName: string }) =>
      formTemplateService.clone(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formTemplateKeys.list(MODULE) });
    },
  });
}

export function useSetDefaultFormTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => formTemplateService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formTemplateKeys.list(MODULE) });
    },
  });
}
