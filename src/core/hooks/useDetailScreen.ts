import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { usePermissions } from './usePermissions';
import { useAppStore } from '../../store/useAppStore';
import { BaseEntityService } from '../services/baseEntityService.types';
import { DetailScreenConfig, BaseEntity } from '../types/screen.types';
import { useNavigation } from '@react-navigation/native';

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

  // State management
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Permission checks
  const permissions = useMemo(() => ({
    canView: can(`${config.entityName}:view`),
    canEdit: can(`${config.entityName}:edit`),
    canDelete: can(`${config.entityName}:delete`),
  }), [can, config.entityName]);

  // Fetch entity data
  useEffect(() => {
    if (!entityId) {
      setError(new Error('ID parameter is required'));
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const entity = await service.get(entityId);
        if (entity) {
          setData(entity);
        } else {
          setError(new Error('Entity not found'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [entityId, service]);

  // Action handlers
  const handleEdit = useCallback(() => {
    if (!entityId) return;
    const routeName = `${config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1)}Edit`;
    navigation.navigate(routeName as never, { [idParamKey]: entityId });
  }, [navigation, config.entityName, entityId, idParamKey]);

  const handleDelete = useCallback(async () => {
    if (!entityId) return;
    try {
      setLoading(true);
      await service.delete(entityId);
      // Navigate back after successful delete - navigation is handled by container
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete'));
    } finally {
      setLoading(false);
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
    refresh: () => {
      if (entityId) {
        service.get(entityId).then(setData).catch(setError);
      }
    },

    // Translation
    t,
  };
}

