/**
 * Stock Alert Settings Service
 * Handles API calls for stock alert settings
 */

import httpService from '../../../shared/services/httpService';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import { ReminderFrequency, ReminderLimit } from '../../../core/store/lowStockAlertStore';

export interface StockAlertSettings {
  enabled: boolean;
  threshold: number;
  reminderFrequency: ReminderFrequency;
  reminderLimit: ReminderLimit;
}

export const stockAlertSettingsService = {
  /**
   * Get stock alert settings
   */
  get: async (): Promise<StockAlertSettings> => {
    return httpService.get<StockAlertSettings>(apiEndpoints.stock.alertSettings);
  },

  /**
   * Update stock alert settings
   */
  update: async (settings: Partial<StockAlertSettings>): Promise<StockAlertSettings> => {
    return httpService.put<StockAlertSettings>(apiEndpoints.stock.alertSettings, settings);
  },
};

export default stockAlertSettingsService;

