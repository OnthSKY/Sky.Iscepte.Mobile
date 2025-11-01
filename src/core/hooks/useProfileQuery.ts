/**
 * useProfileQuery Hook
 * 
 * Single Responsibility: Provides profile query hook
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from './useApiQuery';
import { queryKeys } from '../services/queryClient';
import { apiEndpoints } from '../config/apiEndpoints';
import { UserProfile } from '../../shared/services/userService';

/**
 * Hook for fetching current user profile
 */
export function useProfileQuery() {
  return useApiQuery<UserProfile>({
    url: apiEndpoints.user.profile,
    queryKey: queryKeys.user.profile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

