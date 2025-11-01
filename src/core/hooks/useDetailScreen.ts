import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { usePermissions } from './usePermissions';
import { useAppStore } from '../../store/useAppStore';
import { BaseEntityService } from '../services/baseEntityService.types';
import { DetailScreenConfig, BaseEntity } from '../types/screen.types';
import { useNavigation } from '@react-navigation/native';
import { useAsyncData } from './useAsyncData';
import { createError, errorMessages } from '../utils/errorUtils';
import { log } from '../utils/logger';

/**
 * Single Responsibility: Handles detail screen logic (data fetching, actions)
 * Dependency Inversion: Depends on service interface, not concrete implementation
 */
export function useDetailScreen<T extends BaseEntity>(
  service: BaseEntityService<T>,
  config: DetailScreenConfig
) {
  const { t } = useTranslation([config.translationNamespace, 'common']);
  const route = useRoute<any>();
  const navigation = useNavigation();
  const role = useAppStore((s) => s.role);
  const { can } = usePermissions(role);

  const idParamKey = config.idParamKey || 'id';
  const entityId = route.params?.[idParamKey];

  // Permission checks
  const permissions = useMemo(() => ({
    canView: can(`${config.entityName}:view`),
    canEdit: can(`${config.entityName}:edit`),
    canDelete: can(`${config.entityName}:delete`),
  }), [can, config.entityName]);

  // Fetch entity data using useAsyncData
  const { data, loading, error, refetch } = useAsyncData<T | null>(
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
      immediate: !!entityId,
      onError: (err) => {
        log.error('Failed to load entity:', err);
      },
    }
  );

  // Action handlers
  const handleEdit = useCallback(() => {
    if (!entityId) return;
    const routeName = `${config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1)}Edit`;
    navigation.navigate(routeName as never, { [idParamKey]: entityId });
  }, [navigation, config.entityName, entityId, idParamKey]);

  const handleDelete = useCallback(async () => {
    if (!entityId) return;
    try {
      await service.delete(entityId);
      // Navigate back after successful delete - navigation is handled by container
      // Data will be refreshed by container if needed
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete');
    }
  }, [service, entityId]);

  return {
    // Data
    data,
    loading,
    error,
    entityId,

    // Permissions
    permissions,

    // Handlers
    handleEdit,
    handleDelete,
    refresh: refetch,

    // Translation
    t,
  };
}

