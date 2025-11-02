/**
 * FormTemplateService - Service for managing form templates for products
 * 
 * Handles CRUD operations and cloning of form templates via API
 */

import httpService from '../../../shared/services/httpService';
import appConfig from '../../../core/config/appConfig';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormTemplate, FormTemplateConfig, FormTemplateListResponse } from '../../../shared/types/formTemplate';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';

// Use httpService directly (it handles both mock and real API)
async function request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, body?: any): Promise<T> {
  // Get token from AsyncStorage for mock service (if in mock mode)
  const token = appConfig.mode === 'mock' ? await AsyncStorage.getItem('access_token') : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  
  switch (method) {
    case 'GET':
      return httpService.get<T>(url, { headers });
    case 'POST':
      return httpService.post<T>(url, body, { headers });
    case 'PUT':
      return httpService.put<T>(url, body, { headers });
    case 'DELETE':
      return httpService.delete<T>(url, { headers });
  }
}

const MODULE = 'stock'; // Products module uses 'stock' as the module key

export const formTemplateService = {
  /**
   * List all form templates for products module
   */
  list: async (): Promise<FormTemplate[]> => {
    try {
      const response = await request<any>('GET', apiEndpoints.formTemplates.list(MODULE));
      
      // Handle array response
      if (Array.isArray(response)) {
        return response;
      }
      
      // Handle paginated response
      if (response?.items && Array.isArray(response.items)) {
        return response.items;
      }
      
      // Fallback: empty array
      return [];
    } catch (error) {
      console.error('Failed to list form templates:', error);
      return [];
    }
  },

  /**
   * Get a single form template by ID
   */
  get: async (id: string | number): Promise<FormTemplate | null> => {
    try {
      return await request<FormTemplate>('GET', apiEndpoints.formTemplates.get(MODULE, id));
    } catch (error) {
      console.error('Failed to get form template:', error);
      return null;
    }
  },

  /**
   * Create a new form template
   */
  create: async (config: FormTemplateConfig): Promise<FormTemplate> => {
    return await request<FormTemplate>('POST', apiEndpoints.formTemplates.create(MODULE), {
      ...config,
      module: MODULE,
    });
  },

  /**
   * Update an existing form template
   */
  update: async (id: string | number, config: Partial<FormTemplateConfig>): Promise<FormTemplate> => {
    return await request<FormTemplate>('PUT', apiEndpoints.formTemplates.update(MODULE, id), config);
  },

  /**
   * Delete a form template
   */
  remove: async (id: string | number): Promise<void> => {
    await request<void>('DELETE', apiEndpoints.formTemplates.remove(MODULE, id));
  },

  /**
   * Clone an existing form template
   */
  clone: async (id: string | number, newName: string): Promise<FormTemplate> => {
    return await request<FormTemplate>('POST', apiEndpoints.formTemplates.clone(MODULE, id), {
      name: newName,
    });
  },

  /**
   * Set a form template as default
   */
  setDefault: async (id: string | number): Promise<FormTemplate> => {
    return await request<FormTemplate>('PUT', apiEndpoints.formTemplates.setDefault(MODULE, id));
  },
};

export default formTemplateService;

