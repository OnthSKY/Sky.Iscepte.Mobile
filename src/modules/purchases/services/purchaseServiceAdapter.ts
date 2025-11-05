/**
 * Purchase Service Adapter
 * Adapts purchaseService to BaseEntityService interface
 * 
 * If isStockPurchase is false, also creates an expense record
 */

import { createBaseServiceAdapter } from '../../../core/services/baseServiceAdapter';
import { purchaseService } from './purchaseService';
import { Purchase } from '../store/purchaseStore';
import httpService from '../../../shared/services/httpService';
import { apiEndpoints } from '../../../core/config/apiEndpoints';

// Extend purchase service with missing methods
const extendedPurchaseService = {
  list: purchaseService.list,
  get: async (id: string): Promise<Purchase | null> => {
    try {
      const response = await httpService.get<Purchase>(`/purchases/${id}`);
      return response;
    } catch {
      return null;
    }
  },
  create: async (data: Partial<Purchase>): Promise<Purchase> => {
    // Create purchase first
    const purchase = await httpService.post<Purchase>('/purchases', data);
    
    // If this is not a stock purchase, also create an expense record
    const isStockPurchase = data.isStockPurchase !== false; // Default to true if not specified
    if (!isStockPurchase) {
      try {
        // Create expense from purchase data
        const expenseTitle = data.title || 
          (data.productName ? `${data.productName} - ${data.supplierName || 'Alış'}` : 
           data.supplierName || 'Alış');
        
        await httpService.post(apiEndpoints.expenses.create, {
          title: expenseTitle,
          amount: data.total || data.amount || 0,
          currency: data.currency || 'TRY',
          source: 'product_purchase',
          date: data.date || new Date().toISOString().split('T')[0],
          description: data.title || expenseTitle,
          productId: data.productId,
          // Link to purchase for reference
          // purchaseId: purchase.id, // If expense model supports this
        });
      } catch (error) {
        // Log error but don't fail the purchase creation
        console.warn('Failed to create expense record for purchase:', error);
      }
    }
    
    return purchase;
  },
  update: async (id: string, data: Partial<Purchase>): Promise<Purchase> => {
    return httpService.put<Purchase>(`/purchases/${id}`, data);
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      await httpService.delete<void>(`/purchases/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

export const purchaseEntityService = createBaseServiceAdapter<Purchase>(
  '/purchases',
  extendedPurchaseService
);

