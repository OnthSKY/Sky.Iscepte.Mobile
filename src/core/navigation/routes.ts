import React from 'react';
import i18n from '../../i18n';
import { Role } from '../config/permissions';
import DashboardScreen from '../../screens/DashboardScreen';

export type RouteConfig = {
  name: string;
  module: string;
  component: React.ComponentType<any>;
  requiredPermission?: string;
  options?: Record<string, unknown>;
};

// Lazy imports to enable potential code splitting
const SalesListScreen = React.lazy(() => import('../../modules/sales/screens/SalesListScreen'));
const CustomersListScreen = React.lazy(() => import('../../modules/customers/screens/CustomerListScreen'));
const ExpensesListScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseListScreen'));
const ReportsScreen = React.lazy(() => import('../../modules/reports/screens/ReportsScreen'));
const EmployeesScreen = React.lazy(() => import('../../modules/employees/screens/EmployeeListScreen'));

// Detail screens
const SalesDetailScreen = React.lazy(() => import('../../modules/sales/screens/SalesDetailScreen'));
const CustomerDetailScreen = React.lazy(() => import('../../modules/customers/screens/CustomerDetailScreen'));
const ExpenseDetailScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseDetailScreen'));
const EmployeeDetailScreen = React.lazy(() => import('../../modules/employees/screens/EmployeeDetailScreen'));
const ReportDetailScreen = React.lazy(() => import('../../modules/reports/screens/ReportDetailScreen'));

// Create/Edit screens
const SalesCreateScreen = React.lazy(() => import('../../modules/sales/screens/SalesCreateScreen'));
const SalesEditScreen = React.lazy(() => import('../../modules/sales/screens/SalesEditScreen'));
const CustomerCreateScreen = React.lazy(() => import('../../modules/customers/screens/CustomerCreateScreen'));
const CustomerEditScreen = React.lazy(() => import('../../modules/customers/screens/CustomerEditScreen'));
const ExpenseCreateScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseCreateScreen'));
const ExpenseEditScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseEditScreen'));
const EmployeeCreateScreen = React.lazy(() => import('../../modules/employees/screens/EmployeeCreateScreen'));
const EmployeeEditScreen = React.lazy(() => import('../../modules/employees/screens/EmployeeEditScreen'));

// Other screens
const ProfileScreen = React.lazy(() => import('../../screens/ProfileScreen'));
const SettingsScreen = React.lazy(() => import('../../screens/SettingsScreen'));
const NotificationsScreen = React.lazy(() => import('../../screens/NotificationsScreen'));

export const allRoutes: RouteConfig[] = [
  { name: 'Dashboard', module: 'dashboard', component: DashboardScreen, options: { title: i18n.t('dashboard:title') } },
  // List screens
  { name: 'Sales', module: 'sales', component: SalesListScreen, requiredPermission: 'sales:view', options: { title: i18n.t('sales:sales') } },
  { name: 'Customers', module: 'customers', component: CustomersListScreen, requiredPermission: 'customers:view', options: { title: i18n.t('customers:customers') } },
  { name: 'Expenses', module: 'expenses', component: ExpensesListScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expenses') } },
  { name: 'Reports', module: 'reports', component: ReportsScreen, requiredPermission: 'reports:view', options: { title: i18n.t('reports:reports') } },
  { name: 'Employees', module: 'employees', component: EmployeesScreen, requiredPermission: 'employees:view', options: { title: i18n.t('settings:employees', { defaultValue: 'Employees' }) } },
  
  // Detail screens
  { name: 'SalesDetail', module: 'sales', component: SalesDetailScreen, requiredPermission: 'sales:view', options: { title: i18n.t('sales:sale_details') } },
  { name: 'CustomerDetail', module: 'customers', component: CustomerDetailScreen, requiredPermission: 'customers:view', options: { title: i18n.t('customers:customer_details') } },
  { name: 'ExpenseDetail', module: 'expenses', component: ExpenseDetailScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expense_details') } },
  { name: 'EmployeeDetail', module: 'employees', component: EmployeeDetailScreen, requiredPermission: 'employees:view', options: { title: i18n.t('settings:employee_details') } },
  { name: 'ReportDetail', module: 'reports', component: ReportDetailScreen, requiredPermission: 'reports:view', options: { title: i18n.t('reports:report_details') } },
  
  // Create screens
  { name: 'SalesCreate', module: 'sales', component: SalesCreateScreen, requiredPermission: 'sales:create', options: { title: i18n.t('sales:new_sale') } },
  { name: 'CustomerCreate', module: 'customers', component: CustomerCreateScreen, requiredPermission: 'customers:create', options: { title: i18n.t('customers:new_customer') } },
  { name: 'ExpenseCreate', module: 'expenses', component: ExpenseCreateScreen, requiredPermission: 'expenses:create', options: { title: i18n.t('expenses:new_expense') } },
  { name: 'EmployeeCreate', module: 'employees', component: EmployeeCreateScreen, requiredPermission: 'employees:create', options: { title: i18n.t('settings:new_employee') } },
  
  // Edit screens
  { name: 'SalesEdit', module: 'sales', component: SalesEditScreen, requiredPermission: 'sales:edit', options: { title: i18n.t('sales:edit_sale') } },
  { name: 'CustomerEdit', module: 'customers', component: CustomerEditScreen, requiredPermission: 'customers:edit', options: { title: i18n.t('customers:edit_customer') } },
  { name: 'ExpenseEdit', module: 'expenses', component: ExpenseEditScreen, requiredPermission: 'expenses:edit', options: { title: i18n.t('expenses:edit_expense') } },
  { name: 'EmployeeEdit', module: 'employees', component: EmployeeEditScreen, requiredPermission: 'employees:edit', options: { title: i18n.t('settings:edit_employee') } },
  
  // Other screens
  { name: 'Profile', module: 'profile', component: ProfileScreen, options: { title: i18n.t('profile') } },
  { name: 'Settings', module: 'settings', component: SettingsScreen, options: { title: i18n.t('settings') } },
  { name: 'Notifications', module: 'notifications', component: NotificationsScreen, options: { title: i18n.t('notifications') } },
];

export const filterRoutesByRole = (role: Role, hasPermission: (r: Role, p: string) => boolean): RouteConfig[] =>
  allRoutes.filter((r) => !r.requiredPermission || hasPermission(role, r.requiredPermission));


