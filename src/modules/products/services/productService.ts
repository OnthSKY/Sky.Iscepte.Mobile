import httpService from '../../../shared/services/httpService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';

export interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
  hasSales?: boolean; // if true, cannot be deleted
}

export interface ProductStats {
  totalProducts: number;
  totalCategories: number;
  totalActive: number;
}

export const productService = {
  list: (req: GridRequest) =>
    httpService.get<Paginated<Product>>(`/products${toQueryParams(req)}`),

  get: (id: string) => httpService.get<Product>(`/products/${id}`),

  stats: () => httpService.get<ProductStats>(`/products/stats`),

  create: (payload: Partial<Product>) =>
    httpService.post<Product>('/products', payload),

  update: (id: string, payload: Partial<Product>) =>
    httpService.put<Product>(`/products/${id}`),

  remove: (id: string) => httpService.delete<void>(`/products/${id}`),
};

export default productService;


