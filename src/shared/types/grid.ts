export type OrderDirection = 'ASC' | 'DESC';

export interface GridRequest {
  page: number; // 1-based
  pageSize: number;
  searchValue?: string;
  filters?: Record<string, string>;
  orderColumn?: string; // e.g., CreatedAt
  orderDirection?: OrderDirection; // ASC | DESC
}


