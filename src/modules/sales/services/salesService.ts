import httpService from '../../../shared/services/httpService';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  price?: number;
  total?: number;
  date?: string;
  status?: string;
}

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  monthlySales: number;
  averageOrderValue: number;
}

export const salesService = {
  list: (req: GridRequest) =>
    httpService.get<Paginated<Sale>>(`/sales${toQueryParams(req)}`),

  get: (id: string) => httpService.get<Sale>(`/sales/${id}`),

  stats: () => httpService.get<SalesStats>(`/sales/stats`),

  create: (payload: Partial<Sale>) =>
    httpService.post<Sale>('/sales', payload),

  update: (id: string, payload: Partial<Sale>) =>
    httpService.put<Sale>(`/sales/${id}`, payload),

  remove: (id: string) => httpService.delete<void>(`/sales/${id}`),
};

export default salesService;


