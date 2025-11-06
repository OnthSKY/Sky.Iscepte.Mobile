import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BaseEntityService } from '../services/baseEntityService.types';
import { FormScreenConfig, BaseEntity } from '../types/screen.types';
import { useNavigationHandler } from './useNavigationHandler';
import { useAsyncData } from './useAsyncData';
import { createError, errorMessages } from '../utils/errorUtils';
import { log } from '../utils/logger';
import { getNavigationFallback } from '../config/navigationConfig';
import { usePermissions } from './usePermissions';
import { useAppStore } from '../../store/useAppStore';
import { showPermissionAlert } from '../../shared/utils/permissionUtils';
import { z } from 'zod';
import { validateSchema } from '../utils/validationSchema';

/**
 * Single Responsibility: Handles form screen logic (form state, validation, submission)
 * Dependency Inversion: Depends on service interface, not concrete implementation
 */
/**
 * Validator function type (sync or async)
 */
export type FormValidator<T> =
  | ((data: Partial<T>) => Record<string, string>)
  | ((data: Partial<T>) => Promise<Record<string, string>>)
  | z.ZodSchema<T>;

export function useFormScreen<T extends BaseEntity>(
  service: BaseEntityService<T>,
  config: FormScreenConfig,
  initialData?: Partial<T>,
  validator?: FormValidator<T>
) {
  const { t } = useTranslation([config.translationNamespace, 'common', 'packages']);
  const route = useRoute<any>();
  const navigation = useNavigation();
  const navHandler = useNavigationHandler();
  const role = useAppStore((s) => s.role);
  const permissions = usePermissions(role);

  const idParamKey = config.idParamKey || 'id';
  const entityId = config.mode === 'edit' ? route.params?.[idParamKey] : undefined;

  // Permission checks
  // Map entityName to module name for permissions (e.g., stock_item -> stock)
  const getPermissionModule = (entityName: string): string => {
    if (entityName === 'stock_item') {
      return 'stock';
    }
    return entityName;
  };

  const requiredPermission = useMemo(() => {
    const moduleName = getPermissionModule(config.entityName);
    return config.mode === 'create' ? `${moduleName}:create` : `${moduleName}:edit`;
  }, [config.mode, config.entityName]);

  const hasPermission = useMemo(() => {
    return permissions.can(requiredPermission);
  }, [permissions, requiredPermission]);

  // Check permission on mount and redirect if needed
  // Only check after permissions are loaded to avoid false negatives
  useEffect(() => {
    // Wait for permissions to load before checking
    if (!permissions.arePermissionsLoaded) {
      return;
    }

    if (!hasPermission) {
      showPermissionAlert(role, requiredPermission, navigation, t);
      // Navigate back if user doesn't have permission
      const entityRouteName =
        config.entityName === 'stock_item'
          ? 'Stock'
          : config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1);
      const fallbackRoute = getNavigationFallback(`${entityRouteName}Create`) || entityRouteName;
      if (navHandler.canNavigate(fallbackRoute)) {
        navHandler.navigate(fallbackRoute);
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [
    hasPermission,
    requiredPermission,
    role,
    navigation,
    t,
    navHandler,
    config.entityName,
    permissions.arePermissionsLoaded,
  ]);

  // Form state
  const [formData, setFormData] = useState<Partial<T>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load existing data for edit mode using useAsyncData
  const { loading } = useAsyncData<T>(
    async () => {
      if (!entityId) {
        throw createError(errorMessages.required('ID parameter'), 'MISSING_ID');
      }
      const entity = await service.get(entityId);
      if (!entity) {
        throw createError(errorMessages.notFound(config.entityName), 'NOT_FOUND');
      }
      return entity;
    },
    [entityId, service, config.entityName],
    {
      immediate: config.mode === 'edit' && !!entityId,
      onSuccess: (data) => {
        setFormData(data);
      },
      onError: (err) => {
        log.error('Failed to load entity:', err);
      },
    }
  );

  // Validation
  const validate = useCallback(async (): Promise<boolean> => {
    if (!validator) {
      return true;
    }

    try {
      let validationErrors: Record<string, string> = {};

      // Check if validator is a Zod schema
      if (validator instanceof z.ZodSchema) {
        const result = validateSchema(validator, formData);
        if (!result.isValid) {
          validationErrors = result.errors;
        }
      } else {
        // Check if validator is async
        const result = validator(formData);
        if (result instanceof Promise) {
          validationErrors = await result;
        } else {
          validationErrors = result;
        }
      }

      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setErrors({ _general: errorMessage });
      return false;
    }
  }, [formData, validator]);

  // Form handlers
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field and related customField errors
    const fieldKey = field as string;
    setErrors((prev) => {
      const next = { ...prev };
      // Clear direct field error
      if (next[fieldKey]) {
        delete next[fieldKey];
      }
      // If updating customFields, clear all customField errors (will be re-validated on submit)
      if (fieldKey === 'customFields' && Array.isArray(value)) {
        Object.keys(next).forEach((key) => {
          if (key.startsWith('customField_')) {
            // Check if this customField still exists and might still be invalid
            // We'll let validation handle this on next submit
            // For now, just clear the error so user can see updated validation
            delete next[key];
          }
        });
      }
      return next;
    });
  }, []);

  const updateFormData = useCallback((data: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!hasPermission) {
      showPermissionAlert(role, requiredPermission, navigation, t);
      return;
    }

    const isValid = await validate();
    if (!isValid) {
      return;
    }

    try {
      setSubmitting(true);
      if (config.mode === 'create') {
        await service.create(formData);
      } else if (config.mode === 'edit' && entityId) {
        await service.update(entityId, formData);
      }
      // Navigate back after successful submit
      const entityRouteName =
        config.entityName === 'stock_item'
          ? 'Stock'
          : config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1);
      const fallbackRoute = getNavigationFallback(`${entityRouteName}Create`) || entityRouteName;
      if (navHandler.canNavigate(fallbackRoute)) {
        navHandler.navigate(fallbackRoute);
      }
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : createError(errorMessages.failedToSave(config.entityName), 'SAVE_ERROR');
      setErrors({ _general: error.message });
    } finally {
      setSubmitting(false);
    }
  }, [
    formData,
    config.mode,
    entityId,
    validate,
    service,
    navigation,
    navHandler,
    config.entityName,
    hasPermission,
    requiredPermission,
    role,
    t,
  ]);

  const handleCancel = useCallback(() => {
    // Always navigate to fallback route directly to avoid tab history issues
    const entityRouteName =
      config.entityName === 'stock_item'
        ? 'Stock'
        : config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1);
    const fallbackRoute = getNavigationFallback(`${entityRouteName}Create`) || entityRouteName;

    if (navHandler.canNavigate(fallbackRoute)) {
      navHandler.navigate(fallbackRoute);
    }
  }, [navHandler, config.entityName]);

  return {
    // Form state
    formData,
    errors,
    loading,
    submitting,
    isEditMode: config.mode === 'edit',

    // Permissions
    hasPermission,

    // Handlers
    updateField,
    updateFormData,
    setFormData,
    handleSubmit,
    handleCancel,
    validate,

    // Translation
    t,
  };
}
