/**
 * Employee Verification Settings Service
 * Manages TC Kimlik and IMEI verification settings for employees module
 */

import { apiEndpoints } from '../../../core/config/apiEndpoints';
import { httpService } from '../../../shared/services/httpService';

export interface EmployeeVerificationSettings {
  tcVerificationEnabled: boolean;
  imeiVerificationEnabled: boolean;
}

const DEFAULT_SETTINGS: EmployeeVerificationSettings = {
  tcVerificationEnabled: false,
  imeiVerificationEnabled: false,
};

export const employeeVerificationSettingsService = {
  /**
   * Get current verification settings
   */
  async get(): Promise<EmployeeVerificationSettings> {
    try {
      const response = await httpService.get<EmployeeVerificationSettings>(
        '/employees/verification-settings'
      );
      return response.data || DEFAULT_SETTINGS;
    } catch (error) {
      console.warn('Failed to load verification settings, using defaults:', error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Update verification settings
   */
  async update(settings: Partial<EmployeeVerificationSettings>): Promise<EmployeeVerificationSettings> {
    const response = await httpService.put<EmployeeVerificationSettings>(
      '/employees/verification-settings',
      settings
    );
    return response.data;
  },
};

export default employeeVerificationSettingsService;

