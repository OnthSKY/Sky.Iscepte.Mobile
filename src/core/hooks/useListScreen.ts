import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { usePermissions } from './usePermissions';
import { useAppStore } from '../../store/useAppStore';
import { BaseEntityService } from '../services/baseEntityService.types';
import { ListQuery, ListResponse, ListScreenConfig, BaseEntity } from '../types/screen.types';
import { useNavigationHandler } from './useNavigationHandler';

/**
 * Single Responsibility: Handles list screen logic (data fetching, search, filters, pagination)
 * Dependency Inversion: Depends on service interface, not concrete implementation
 */
export function useListScreen<T extends BaseEntity>(
  service: BaseEntityService<T>,
  config: ListScreenConfig<T>
) {
  const { t } = useTranslation([config.translationNamespace, 'common']);
  const navigation = useNavigation<any>();
  const role = useAppStore((s) => s.role);
  const { can } = usePermissions(role);
  const navHandler = useNavigationHandler();

  // State management
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, any>>(config.defaultFilters || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Permission checks
  const screenPermissions = useMemo(() => ({
    canView: can(`${config.entityName}:view`),
    canCreate: can(`${config.entityName}:create`),
    canEdit: can(`${config.entityName}:edit`),
    canDelete: can(`${config.entityName}:delete`),
  }), [can, config.entityName]);

  // Navigation handlers
  const handleCreate = useCallback(() => {
    const routeName = `${config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1)}Create`;
    navHandler.navigate(routeName);
  }, [navHandler, config.entityName]);

  const handleViewDetail = useCallback((item: T) => {
    const routeName = `${config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1)}Detail`;
    navHandler.navigate(routeName, { id: item.id });
  }, [navHandler, config.entityName]);

  const handleEdit = useCallback((item: T) => {
    const routeName = `${config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1)}Edit`;
    navHandler.navigate(routeName, { id: item.id });
  }, [navHandler, config.entityName]);

  // Query builder
  const buildQuery = useCallback((page: number, pageSize: number): ListQuery => {
    return {
      page,
      pageSize,
      searchValue: query || undefined,
      orderColumn: 'CreatedAt',
      orderDirection: 'DESC',
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
  }, [query, filters]);

  // Fetch function for PaginatedList
  const fetchPage = useCallback(async ({ page, pageSize, query: listQuery }: any): Promise<ListResponse<T>> => {
    try {
      setLoading(true);
      setError(null);
      const finalQuery = listQuery || buildQuery(page, pageSize);
      const response = await service.list(finalQuery);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load data');
      setError(error);
      // Return empty result instead of throwing to prevent PaginatedList from breaking
      return {
        items: [],
        total: 0,
        page,
        pageSize,
      };
    } finally {
      setLoading(false);
    }
  }, [service, buildQuery]);

  return {
    // Data
    query,
    setQuery,
    filters,
    setFilters,
    loading,
    error,

    // Permissions
    permissions: screenPermissions,

    // Handlers
    handleCreate,
    handleViewDetail,
    handleEdit,
    fetchPage,
    buildQuery,

    // Translation
    t,
  };
}

