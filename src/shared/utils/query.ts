import { GridRequest } from '../types/grid';

export function toQueryParams(req: GridRequest): string {
  const params = new URLSearchParams();
  params.set('page', String(req.page));
  params.set('pageSize', String(req.pageSize));
  if (req.searchValue) params.set('SearchValue', req.searchValue);
  if (req.orderColumn) params.set('OrderColumn', req.orderColumn);
  if (req.orderDirection) params.set('OrderDirection', req.orderDirection);
  if (req.filters) {
    Object.entries(req.filters).forEach(([k, v]) => {
      params.set(`Filters[${k}]`, v);
    });
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}


