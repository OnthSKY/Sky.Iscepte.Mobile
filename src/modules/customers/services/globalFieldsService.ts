/**
 * GlobalFieldsService - Service for managing global customer fields
 * 
 * Stores global fields (available for all customers) in AsyncStorage
 */

import storageService from '../../../shared/services/storageService';
import { CustomerCustomField } from './customerService';

const GLOBAL_FIELDS_STORAGE_KEY = 'customer_global_fields';

export const globalFieldsService = {
  /**
   * Get all global fields
   */
  getAll: async (): Promise<CustomerCustomField[]> => {
    try {
      const fields = await storageService.get<CustomerCustomField[]>(GLOBAL_FIELDS_STORAGE_KEY);
      return fields || [];
    } catch {
      return [];
    }
  },

  /**
   * Save global fields
   */
  save: async (fields: CustomerCustomField[]): Promise<void> => {
    try {
      await storageService.set(GLOBAL_FIELDS_STORAGE_KEY, fields);
    } catch (error) {
      console.error('Failed to save global customer fields:', error);
    }
  },

  /**
   * Add a global field
   */
  add: async (field: CustomerCustomField): Promise<void> => {
    const fields = await globalFieldsService.getAll();
    // Check if field already exists
    if (fields.find(f => f.key === field.key)) {
      throw new Error('Field key already exists');
    }
    await globalFieldsService.save([...fields, { ...field, isGlobal: true }]);
  },

  /**
   * Remove a global field
   */
  remove: async (key: string): Promise<void> => {
    const fields = await globalFieldsService.getAll();
    await globalFieldsService.save(fields.filter(f => f.key !== key));
  },

  /**
   * Update a global field
   */
  update: async (key: string, updates: Partial<CustomerCustomField>): Promise<void> => {
    const fields = await globalFieldsService.getAll();
    const updated = fields.map(f => f.key === key ? { ...f, ...updates } : f);
    await globalFieldsService.save(updated);
  },
};

export default globalFieldsService;

