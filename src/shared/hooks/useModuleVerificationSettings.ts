/**
 * Hook to get verification settings for a module
 * Currently supports employees module, can be extended for other modules
 */

import { useQuery } from '@tanstack/react-query';
import { employeeVerificationSettingsService } from '../../modules/employees/services/employeeVerificationSettingsService';

export interface ModuleVerificationSettings {
  tcVerificationEnabled: boolean;
  imeiVerificationEnabled: boolean;
}

/**
 * Get verification settings for a module
 * @param module - Module name (e.g., 'employees', 'customers')
 */
export function useModuleVerificationSettings(module: string) {
  // For now, only employees module has verification settings
  // In the future, this can be extended to support other modules
  const isEmployees = module === 'employees';

  const { data: settings } = useQuery({
    queryKey: [module, 'verification-settings'],
    queryFn: async () => {
      if (module === 'employees') {
        return await employeeVerificationSettingsService.get();
      }
      // Default: no verification for other modules
      return {
        tcVerificationEnabled: false,
        imeiVerificationEnabled: false,
      };
    },
    enabled: isEmployees,
    staleTime: 5 * 60 * 1000,
  });

  return {
    tcVerificationEnabled: settings?.tcVerificationEnabled || false,
    imeiVerificationEnabled: settings?.imeiVerificationEnabled || false,
  };
}

