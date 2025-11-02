/**
 * Service Adapter
 * Adapter Pattern: Adapts existing service structure to BaseEntityService interface
 */

import { BaseEntityService } from './baseEntityService.types';
import { BaseEntity, ListQuery, ListResponse } from '../types/screen.types';
import { GridRequest } from '../../shared/types/grid';
import { Paginated } from '../../shared/types/module';
import { PaginatedData } from '../../shared/types/apiResponse';
import { toQueryParams } from '../../shared/utils/query';

/**
 * Adapts existing GridRequest-based service to BaseEntityService
 */
export function createBaseServiceAdapter<T extends BaseEntity>(
  baseUrl: string,
  gridService: {
    list: (req: GridRequest) => Promise<Paginated<T>>;
    get?: (id: string | number) => Promise<T | null>;
    create?: (data: Partial<T>) => Promise<T>;
    update?: (id: string | number, data: Partial<T>) => Promise<T>;
    delete?: (id: string | number) => Promise<boolean>;
  }
): BaseEntityService<T> {
  return {
    async list(query: ListQuery): Promise<ListResponse<T>> {
      const gridRequest: GridRequest = {
        page: query.page,
        pageSize: query.pageSize,
        orderColumn: query.orderColumn,
        orderDirection: query.orderDirection,
        searchValue: query.searchValue,
        filters: query.filters,
      };
      
      const response = await gridService.list(gridRequest);
      
      // Handle different response formats
      // Check if response is PaginatedData format (from new API)
      if ('totalCount' in response && 'totalPage' in response) {
        const paginatedData = response as PaginatedData<T>;
        return {
          items: paginatedData.items,
          total: paginatedData.totalCount,
          page: paginatedData.page,
          pageSize: paginatedData.pageSize,
        };
      }
      
      // Handle legacy Paginated format
      const items = response.items || (response as any).data || [];
      const total = response.total || (response as any).totalCount || 0;
      
      return {
        items,
        total,
        page: query.page,
        pageSize: query.pageSize,
      };
    },

    async get(id: string | number): Promise<T | null> {
      if (!gridService.get) {
        throw new Error('get method not implemented');
      }
      return gridService.get(id);
    },

    async create(data: Partial<T>): Promise<T> {
      if (!gridService.create) {
        throw new Error('create method not implemented');
      }
      return gridService.create(data);
    },

    async update(id: string | number, data: Partial<T>): Promise<T> {
      if (!gridService.update) {
        throw new Error('update method not implemented');
      }
      return gridService.update(id, data);
    },

    async delete(id: string | number): Promise<boolean> {
      if (!gridService.delete) {
        throw new Error('delete method not implemented');
      }
      return gridService.delete(id);
    },
  };
}

