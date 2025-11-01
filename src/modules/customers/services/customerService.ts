import httpService from '../../../shared/services/httpService';
import { Paginated } from '../../../shared/types/module';
import { GridRequest } from '../../../shared/types/grid';
import { toQueryParams } from '../../../shared/utils/query';

export interface Customer {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  totalOrders?: number;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  totalOrders: number;
}

export const customerService = {
  list: (req: GridRequest) =>
    httpService.get<Paginated<Customer>>(`/customers${toQueryParams(req)}`),

  get: (id: string) => httpService.get<Customer>(`/customers/${id}`),

  stats: () => httpService.get<CustomerStats>(`/customers/stats`),

  create: (payload: Partial<Customer>) =>
    httpService.post<Customer>('/customers', payload),

  update: (id: string, payload: Partial<Customer>) =>
    httpService.put<Customer>(`/customers/${id}`, payload),

  remove: (id: string) => httpService.delete<void>(`/customers/${id}`),
};

export default customerService;


