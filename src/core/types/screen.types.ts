/**
 * Screen type definitions
 * Interface Segregation: Separate type definitions for different screen concerns
 */

export interface BaseEntity {
  id: string | number;
  [key: string]: any;
}

export interface ListQuery {
  page: number;
  pageSize: number;
  searchValue?: string;
  orderColumn?: string;
  orderDirection?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
  [key: string]: any; // Allow additional query parameters
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: Array<{ label: string; value: any }>;
}

export interface ListScreenConfig<T extends BaseEntity> {
  entityName: string;
  translationNamespace: string;
  defaultPageSize?: number;
  defaultFilters?: Record<string, any>;
  filterOptions?: FilterOption[];
  // Optional route name overrides (if not provided, will be generated from entityName)
  routeNames?: {
    create?: string;
    edit?: string;
    detail?: string;
  };
}

export interface DetailScreenConfig {
  entityName: string;
  translationNamespace: string;
  idParamKey?: string;
}

export interface FormScreenConfig {
  entityName: string;
  translationNamespace: string;
  mode: 'create' | 'edit';
  idParamKey?: string;
}

