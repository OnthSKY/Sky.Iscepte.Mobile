import { DashboardService as IDashboardService } from '../hooks/useDashboardData';
import { DashboardStatData, QuickActionData } from './dashboardService.types';
import { Role } from '../config/appConstants';

/**
 * Theme colors type - avoids direct hook dependency in service layer
 */
export interface ThemeColors {
  primary: string;
  success: string;
  error: string;
  info: string;
  muted: string;
  text: string;
  background: string;
  surface: string;
  border: string;
}

/**
 * Single Responsibility: Provides dashboard data based on role
 * Open/Closed: Open for extension (new roles), closed for modification
 * Dependency Inversion: Implements DashboardService interface
 */

export abstract class BaseDashboardService implements IDashboardService {
  protected role: Role;
  protected themeColors: ThemeColors;

  constructor(role: Role, themeColors: ThemeColors) {
    this.role = role;
    this.themeColors = themeColors;
  }

  abstract getStats(): Promise<DashboardStatData[]>;
  abstract getQuickActions(): Promise<QuickActionData[]>;
}

/**
 * Service implementation for Admin role
 * SRP: Only responsible for admin dashboard data
 */
export class AdminDashboardService extends BaseDashboardService {
  async getStats(): Promise<DashboardStatData[]> {
    // This would typically fetch from an API
    // For now, return mock data with translation keys
    return [
      {
        key: 'total-users',
        translationKey: 'dashboard:total_users',
        value: '1,234',
        icon: 'people-outline',
        colorKey: 'primary',
        route: 'Users',
      },
      {
        key: 'total-businesses',
        translationKey: 'dashboard:total_businesses',
        value: '456',
        icon: 'business-outline',
        colorKey: 'info',
        route: 'Businesses',
      },
      {
        key: 'total-sales',
        translationKey: 'dashboard:total_sales',
        value: '₺2,450,000',
        icon: 'trending-up-outline',
        colorKey: 'success',
        route: 'Sales',
      },
      {
        key: 'total-data',
        translationKey: 'dashboard:total_data',
        value: '12,589',
        icon: 'server-outline',
        colorKey: 'primary',
        route: 'Reports',
      },
    ];
  }

  async getQuickActions(): Promise<QuickActionData[]> {
    return [
      {
        key: 'manage-users',
        translationKey: 'dashboard:manage_users',
        icon: 'people-outline',
        colorKey: 'primary',
        route: 'Users',
      },
      {
        key: 'manage-global-fields',
        translationKey: 'stock:manage_global_fields',
        icon: 'grid-outline',
        colorKey: 'info',
        route: 'GlobalFieldsManagement',
        requiredPermission: 'stock:manage_global_fields',
      },
      {
        key: 'settings',
        translationKey: 'common:settings',
        icon: 'settings-outline',
        colorKey: 'primary',
        route: 'Settings',
      },
    ];
  }
}

/**
 * Service implementation for Owner role
 * SRP: Only responsible for owner dashboard data
 */
export class OwnerDashboardService extends BaseDashboardService {
  async getStats(): Promise<DashboardStatData[]> {
    return [
      {
        key: 'sales',
        translationKey: 'dashboard:total_sales',
        value: '₺125,430',
        icon: 'trending-up-outline',
        colorKey: 'success',
        route: 'Sales',
      },
      {
        key: 'customers',
        translationKey: 'dashboard:total_customers',
        value: '1,247',
        icon: 'people-outline',
        colorKey: 'info',
        route: 'Customers',
      },
      {
        key: 'expenses',
        translationKey: 'dashboard:total_expenses',
        value: '₺45,230',
        icon: 'wallet-outline',
        colorKey: 'error',
        route: 'Expenses',
      },
      {
        key: 'profit',
        translationKey: 'dashboard:net_profit',
        value: '₺80,200',
        icon: 'cash-outline',
        colorKey: 'primary',
        route: 'Reports',
      },
    ];
  }

  async getQuickActions(): Promise<QuickActionData[]> {
    return [
      {
        key: 'new-sale',
        translationKey: 'sales:new_sale',
        icon: 'add-circle-outline',
        colorKey: 'success',
        route: 'SalesCreate',
      },
      {
        key: 'new-customer',
        translationKey: 'customers:new_customer',
        icon: 'person-add-outline',
        colorKey: 'info',
        route: 'CustomerCreate',
      },
      {
        key: 'new-expense',
        translationKey: 'expenses:new_expense',
        icon: 'add-circle-outline',
        colorKey: 'error',
        route: 'ExpenseCreate',
      },
      {
        key: 'manage-global-fields',
        translationKey: 'stock:manage_global_fields',
        icon: 'grid-outline',
        colorKey: 'info',
        route: 'GlobalFieldsManagement',
        requiredPermission: 'stock:manage_global_fields',
      },
      {
        key: 'reports',
        translationKey: 'reports:reports',
        icon: 'stats-chart-outline',
        colorKey: 'primary',
        route: 'Reports',
      },
      {
        key: 'packages',
        translationKey: 'packages:packages',
        icon: 'cube-outline',
        colorKey: 'info',
        route: 'Packages',
      },
    ];
  }
}

/**
 * Service implementation for Staff role
 * SRP: Only responsible for staff dashboard data
 */
export class StaffDashboardService extends BaseDashboardService {
  async getStats(): Promise<DashboardStatData[]> {
    return [
      {
        key: 'my-sales',
        translationKey: 'dashboard:my_sales',
        value: '₺3,780',
        icon: 'trending-up-outline',
        colorKey: 'success',
        route: 'Sales',
      },
    ];
  }

  async getQuickActions(): Promise<QuickActionData[]> {
    return [
      {
        key: 'new-sale',
        translationKey: 'sales:new_sale',
        icon: 'add-circle-outline',
        colorKey: 'success',
        route: 'SalesCreate',
      },
    ];
  }
}

/**
 * Factory pattern for creating dashboard services
 * Open/Closed: Easy to extend with new roles without modifying existing code
 */
export class DashboardServiceFactory {
  static create(role: Role, themeColors: ThemeColors): BaseDashboardService {
    switch (role) {
      case 'admin':
        return new AdminDashboardService(role, themeColors);
      case 'owner':
        return new OwnerDashboardService(role, themeColors);
      case 'staff':
        return new StaffDashboardService(role, themeColors);
      default:
        return new StaffDashboardService(role, themeColors);
    }
  }
}

