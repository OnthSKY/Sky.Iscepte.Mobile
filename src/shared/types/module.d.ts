export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  // Support for new PaginatedData structure
  totalCount?: number;
  page?: number;
  pageSize?: number;
  totalPage?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}


