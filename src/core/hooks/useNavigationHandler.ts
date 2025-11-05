import { useNavigation } from '@react-navigation/native';
import { getNavigationFallback } from '../config/navigationConfig';
import { log } from '../utils/logger';

/**
 * Single Responsibility: Handles navigation logic
 * Dependency Inversion: Depends on navigation abstraction
 */

export interface NavigationFallback {
  [key: string]: string;
}

export interface NavigationHandler {
  navigate(route: string, params?: any): boolean;
  canNavigate(route: string): boolean;
}

/**
 * Custom hook for navigation handling
 * SRP: Only responsible for navigation logic
 */
export function useNavigationHandler(
  fallbackMap: NavigationFallback = {}
): NavigationHandler {
  const navigation = useNavigation<any>();

  const canNavigate = (route: string): boolean => {
    const routeNames: string[] | undefined = (navigation.getState() as any)?.routeNames;
    return routeNames?.includes(route) || false;
  };

  const navigate = (route: string, params?: any): boolean => {
    if (canNavigate(route)) {
      navigation.navigate(route as never, params);
      return true;
    }

    // Try fallback from config
    const fallback = getNavigationFallback(route);
    if (fallback && canNavigate(fallback)) {
      navigation.navigate(fallback as never, params);
      return true;
    }

    // Try custom fallback map if provided
    const customFallback = fallbackMap[route];
    if (customFallback && canNavigate(customFallback)) {
      navigation.navigate(customFallback as never, params);
      return true;
    }

    log.warn(`Route "${route}" is not available in the current navigator.`);
    return false;
  };

  return {
    navigate,
    canNavigate,
  };
}

