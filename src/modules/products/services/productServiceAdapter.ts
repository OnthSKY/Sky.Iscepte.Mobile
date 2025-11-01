/**
 * Product Service Adapter
 * Adapts productService to BaseEntityService interface
 */

import { createBaseServiceAdapter } from '../../../core/services/baseServiceAdapter';
import { productService, Product } from './productService';

// Product service already has all methods, just adapt it
export const productEntityService = createBaseServiceAdapter<Product>(
  '/stock',
  {
    list: productService.list,
    get: productService.get,
    create: productService.create,
    update: productService.update,
    delete: async (id: string): Promise<boolean> => {
      try {
        await productService.remove(id);
        return true;
      } catch {
        return false;
      }
    },
  }
);

