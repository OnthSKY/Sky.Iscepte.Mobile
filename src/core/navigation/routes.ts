import React from 'react';
import i18n from '../../i18n';
import { Role } from '../config/appConstants';
import DashboardScreen from '../../screens/DashboardScreen';
import ProfileScreen from '../../screens/ProfileScreen';

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
const ProductsListScreen = React.lazy(() => import('../../modules/products/screens/ProductListScreen'));

// Module Dashboard screens
const ProductsDashboardScreen = React.lazy(() => import('../../modules/products/screens/ProductsDashboardScreen'));
const SalesDashboardScreen = React.lazy(() => import('../../modules/sales/screens/SalesDashboardScreen'));
const CustomersDashboardScreen = React.lazy(() => import('../../modules/customers/screens/CustomersDashboardScreen'));
const ExpensesDashboardScreen = React.lazy(() => import('../../modules/expenses/screens/ExpensesDashboardScreen'));
const EmployeesDashboardScreen = React.lazy(() => import('../../modules/employees/screens/EmployeesDashboardScreen'));
const ReportsDashboardScreen = React.lazy(() => import('../../modules/reports/screens/ReportsDashboardScreen'));

// Detail screens
const SalesDetailScreen = React.lazy(() => import('../../modules/sales/screens/SalesDetailScreen'));
const CustomerDetailScreen = React.lazy(() => import('../../modules/customers/screens/CustomerDetailScreen'));
const ExpenseDetailScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseDetailScreen'));
const EmployeeDetailScreen = React.lazy(() => import('../../modules/employees/screens/EmployeeDetailScreen'));
const ReportDetailScreen = React.lazy(() => import('../../modules/reports/screens/ReportDetailScreen'));
const ProductDetailScreen = React.lazy(() => import('../../modules/products/screens/ProductDetailScreen'));

// Create/Edit screens
const SalesCreateScreen = React.lazy(() => import('../../modules/sales/screens/SalesCreateScreen'));
const SalesEditScreen = React.lazy(() => import('../../modules/sales/screens/SalesEditScreen'));
const CustomerCreateScreen = React.lazy(() => import('../../modules/customers/screens/CustomerCreateScreen'));
const CustomerEditScreen = React.lazy(() => import('../../modules/customers/screens/CustomerEditScreen'));
const ExpenseCreateScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseCreateScreen'));
const ExpenseEditScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseEditScreen'));
const EmployeeCreateScreen = React.lazy(() => import('../../modules/employees/screens/EmployeeCreateScreen'));
const EmployeeEditScreen = React.lazy(() => import('../../modules/employees/screens/EmployeeEditScreen'));
const ExpenseTypeListScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseTypeListScreen'));
const ExpenseTypeCreateScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseTypeCreateScreen'));
const ExpenseTypeEditScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseTypeEditScreen'));
const ProductCreateScreen = React.lazy(() => import('../../modules/products/screens/ProductCreateScreen'));
const ProductEditScreen = React.lazy(() => import('../../modules/products/screens/ProductEditScreen'));

// Other screens - ProfileScreen imported directly to avoid native module loading issues
const SettingsScreen = React.lazy(() => import('../../screens/SettingsScreen'));
const NotificationsScreen = React.lazy(() => import('../../screens/NotificationsScreen'));

export const allRoutes: RouteConfig[] = [
  { name: 'Dashboard', module: 'dashboard', component: DashboardScreen, options: { title: i18n.t('dashboard:title') } },
  // Module Dashboard screens
  { name: 'ProductsDashboard', module: 'products', component: ProductsDashboardScreen, requiredPermission: 'products:view', options: { title: i18n.t('products:products', { defaultValue: 'Products' }) } },
  { name: 'SalesDashboard', module: 'sales', component: SalesDashboardScreen, requiredPermission: 'sales:view', options: { title: i18n.t('sales:sales') } },
  { name: 'CustomersDashboard', module: 'customers', component: CustomersDashboardScreen, requiredPermission: 'customers:view', options: { title: i18n.t('customers:customers') } },
  { name: 'ExpensesDashboard', module: 'expenses', component: ExpensesDashboardScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expenses') } },
  { name: 'EmployeesDashboard', module: 'employees', component: EmployeesDashboardScreen, requiredPermission: 'employees:view', options: { title: i18n.t('settings:employees', { defaultValue: 'Employees' }) } },
  { name: 'ReportsDashboard', module: 'reports', component: ReportsDashboardScreen, requiredPermission: 'reports:view', options: { title: i18n.t('reports:reports') } },
  // Main module routes (point to dashboard)
  { name: 'Sales', module: 'sales', component: SalesDashboardScreen, requiredPermission: 'sales:view', options: { title: i18n.t('sales:sales') } },
  { name: 'Customers', module: 'customers', component: CustomersDashboardScreen, requiredPermission: 'customers:view', options: { title: i18n.t('customers:customers') } },
  { name: 'Expenses', module: 'expenses', component: ExpensesDashboardScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expenses') } },
  { name: 'Products', module: 'products', component: ProductsDashboardScreen, requiredPermission: 'products:view', options: { title: i18n.t('products:products', { defaultValue: 'Products' }) } },
  { name: 'Employees', module: 'employees', component: EmployeesDashboardScreen, requiredPermission: 'employees:view', options: { title: i18n.t('settings:employees', { defaultValue: 'Employees' }) } },
  { name: 'Reports', module: 'reports', component: ReportsDashboardScreen, requiredPermission: 'reports:view', options: { title: i18n.t('reports:reports') } },
  // List screens
  { name: 'SalesList', module: 'sales', component: SalesListScreen, requiredPermission: 'sales:view', options: { title: i18n.t('sales:sales') } },
  { name: 'CustomersList', module: 'customers', component: CustomersListScreen, requiredPermission: 'customers:view', options: { title: i18n.t('customers:customers') } },
  { name: 'ExpensesList', module: 'expenses', component: ExpensesListScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expenses') } },
  { name: 'ProductsList', module: 'products', component: ProductsListScreen, requiredPermission: 'products:view', options: { title: i18n.t('products:products', { defaultValue: 'Products' }) } },
  { name: 'EmployeesList', module: 'employees', component: EmployeesScreen, requiredPermission: 'employees:view', options: { title: i18n.t('settings:employees', { defaultValue: 'Employees' }) } },
  { name: 'ReportsList', module: 'reports', component: ReportsScreen, requiredPermission: 'reports:view', options: { title: i18n.t('reports:reports') } },
  { name: 'ExpenseTypes', module: 'expenses', component: ExpenseTypeListScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expense_types') } },
  
  // Detail screens
  { name: 'SalesDetail', module: 'sales', component: SalesDetailScreen, requiredPermission: 'sales:view', options: { title: i18n.t('sales:sale_details') } },
  { name: 'CustomerDetail', module: 'customers', component: CustomerDetailScreen, requiredPermission: 'customers:view', options: { title: i18n.t('customers:customer_details') } },
  { name: 'ExpenseDetail', module: 'expenses', component: ExpenseDetailScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expense_details') } },
  { name: 'EmployeeDetail', module: 'employees', component: EmployeeDetailScreen, requiredPermission: 'employees:view', options: { title: i18n.t('settings:employee_details') } },
  { name: 'ReportDetail', module: 'reports', component: ReportDetailScreen, requiredPermission: 'reports:view', options: { title: i18n.t('reports:report_details') } },
  { name: 'ProductDetail', module: 'products', component: ProductDetailScreen, requiredPermission: 'products:view', options: { title: i18n.t('products:product_details', { defaultValue: 'Product details' }) } },
  
  // Create screens
  { name: 'SalesCreate', module: 'sales', component: SalesCreateScreen, requiredPermission: 'sales:create', options: { title: i18n.t('sales:new_sale') } },
  { name: 'CustomerCreate', module: 'customers', component: CustomerCreateScreen, requiredPermission: 'customers:create', options: { title: i18n.t('customers:new_customer') } },
  { name: 'ExpenseCreate', module: 'expenses', component: ExpenseCreateScreen, requiredPermission: 'expenses:create', options: { title: i18n.t('expenses:new_expense') } },
  { name: 'EmployeeCreate', module: 'employees', component: EmployeeCreateScreen, requiredPermission: 'employees:create', options: { title: i18n.t('settings:new_employee') } },
  { name: 'ExpenseTypeCreate', module: 'expenses', component: ExpenseTypeCreateScreen, requiredPermission: 'expenses:create', options: { title: i18n.t('expenses:new_expense_type') } },
  { name: 'ProductCreate', module: 'products', component: ProductCreateScreen, requiredPermission: 'products:create', options: { title: i18n.t('products:new_product', { defaultValue: 'New product' }) } },
  
  // Edit screens
  { name: 'SalesEdit', module: 'sales', component: SalesEditScreen, requiredPermission: 'sales:edit', options: { title: i18n.t('sales:edit_sale') } },
  { name: 'CustomerEdit', module: 'customers', component: CustomerEditScreen, requiredPermission: 'customers:edit', options: { title: i18n.t('customers:edit_customer') } },
  { name: 'ExpenseEdit', module: 'expenses', component: ExpenseEditScreen, requiredPermission: 'expenses:edit', options: { title: i18n.t('expenses:edit_expense') } },
  { name: 'EmployeeEdit', module: 'employees', component: EmployeeEditScreen, requiredPermission: 'employees:edit', options: { title: i18n.t('settings:edit_employee') } },
  { name: 'ExpenseTypeEdit', module: 'expenses', component: ExpenseTypeEditScreen, requiredPermission: 'expenses:edit', options: { title: i18n.t('expenses:edit_expense_type') } },
  { name: 'ProductEdit', module: 'products', component: ProductEditScreen, requiredPermission: 'products:edit', options: { title: i18n.t('products:edit_product', { defaultValue: 'Edit product' }) } },
  
  // Other screens
  { name: 'Profile', module: 'profile', component: ProfileScreen, options: { title: i18n.t('profile') } },
  { name: 'Settings', module: 'settings', component: SettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('settings') } },
  { name: 'Notifications', module: 'notifications', component: NotificationsScreen, options: { title: i18n.t('notifications') } },
];

export const filterRoutesByRole = (role: Role, hasPermission: (r: Role, p: string) => boolean): RouteConfig[] =>
  allRoutes.filter((r) => !r.requiredPermission || hasPermission(role, r.requiredPermission));


