import { useNavigation } from '@react-navigation/native';

/**
 * Single Responsibility: Handles navigation logic
 * Dependency Inversion: Depends on navigation abstraction
 */

export interface NavigationFallback {
  [key: string]: string;
}

export interface NavigationHandler {
  navigate(route: string): boolean;
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

  const navigate = (route: string): boolean => {
    if (canNavigate(route)) {
      navigation.navigate(route as never);
      return true;
    }

    // Try fallback
    const fallback = fallbackMap[route];
    if (fallback && canNavigate(fallback)) {
      navigation.navigate(fallback as never);
      return true;
    }

    console.warn(`Route "${route}" is not available in the current navigator.`);
    return false;
  };

  return {
    navigate,
    canNavigate,
  };
}

