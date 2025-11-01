/**
 * Dashboard service types
 * Interface Segregation: Separates type definitions from implementation
 */

export interface DashboardStatData {
  key: string;
  translationKey: string;
  value: string;
  icon: string;
  colorKey: 'primary' | 'success' | 'error' | 'info';
  route: string;
}

export interface QuickActionData {
  key: string;
  translationKey: string;
  icon: string;
  colorKey: 'primary' | 'success' | 'error' | 'info';
  route: string;
}

