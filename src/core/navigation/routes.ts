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
const SuppliersListScreen = React.lazy(() => import('../../modules/suppliers/screens/SupplierListScreen'));
const ExpensesListScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseListScreen'));
const RevenueListScreen = React.lazy(() => import('../../modules/revenue/screens/RevenueListScreen'));
const ReportsScreen = React.lazy(() => import('../../modules/reports/screens/ReportsScreen'));
const EmployeesScreen = React.lazy(() => import('../../modules/employees/screens/EmployeeListScreen'));
const StockListScreen = React.lazy(() => import('../../modules/products/screens/ProductListScreen'));
const PurchaseListScreen = React.lazy(() => import('../../modules/purchases/screens/PurchaseListScreen'));

// Module Dashboard screens
const StockDashboardScreen = React.lazy(() => import('../../modules/products/screens/ProductsDashboardScreen'));
const SalesDashboardScreen = React.lazy(() => import('../../modules/sales/screens/SalesDashboardScreen'));
const CustomersDashboardScreen = React.lazy(() => import('../../modules/customers/screens/CustomersDashboardScreen'));
const SuppliersDashboardScreen = React.lazy(() => import('../../modules/suppliers/screens/SuppliersDashboardScreen'));
const ExpensesDashboardScreen = React.lazy(() => import('../../modules/expenses/screens/ExpensesDashboardScreen'));
const RevenueDashboardScreen = React.lazy(() => import('../../modules/revenue/screens/RevenueDashboardScreen'));
const EmployeesDashboardScreen = React.lazy(() => import('../../modules/employees/screens/EmployeesDashboardScreen'));
const ReportsDashboardScreen = React.lazy(() => import('../../modules/reports/screens/ReportsDashboardScreen'));
const PurchasesDashboardScreen = React.lazy(() => import('../../modules/purchases/screens/PurchasesDashboardScreen'));

// Detail screens
const SalesDetailScreen = React.lazy(() => import('../../modules/sales/screens/SalesDetailScreen'));
const CustomerDetailScreen = React.lazy(() => import('../../modules/customers/screens/CustomerDetailScreen'));
const SupplierDetailScreen = React.lazy(() => import('../../modules/suppliers/screens/SupplierDetailScreen'));
const ExpenseDetailScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseDetailScreen'));
const RevenueDetailScreen = React.lazy(() => import('../../modules/revenue/screens/RevenueDetailScreen'));
const EmployeeDetailScreen = React.lazy(() => import('../../modules/employees/screens/EmployeeDetailScreen'));
const ReportDetailScreen = React.lazy(() => import('../../modules/reports/screens/ReportDetailScreen'));
const StockDetailScreen = React.lazy(() => import('../../modules/products/screens/ProductDetailScreen'));
const PurchaseDetailScreen = React.lazy(() => import('../../modules/purchases/screens/PurchaseDetailScreen'));

// Create/Edit screens
const SalesCreateScreen = React.lazy(() => import('../../modules/sales/screens/SalesCreateScreen'));
const SalesEditScreen = React.lazy(() => import('../../modules/sales/screens/SalesEditScreen'));
const CustomerCreateScreen = React.lazy(() => import('../../modules/customers/screens/CustomerCreateScreen'));
const CustomerEditScreen = React.lazy(() => import('../../modules/customers/screens/CustomerEditScreen'));
const SupplierCreateScreen = React.lazy(() => import('../../modules/suppliers/screens/SupplierCreateScreen'));
const SupplierEditScreen = React.lazy(() => import('../../modules/suppliers/screens/SupplierEditScreen'));
const ExpenseCreateScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseCreateScreen'));
const ExpenseEditScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseEditScreen'));
const RevenueCreateScreen = React.lazy(() => import('../../modules/revenue/screens/RevenueCreateScreen'));
const RevenueEditScreen = React.lazy(() => import('../../modules/revenue/screens/RevenueEditScreen'));
const EmployeeCreateScreen = React.lazy(() => import('../../modules/employees/screens/EmployeeCreateScreen'));
const EmployeeEditScreen = React.lazy(() => import('../../modules/employees/screens/EmployeeEditScreen'));
const EmployeePermissionsScreen = React.lazy(() => import('../../modules/employees/screens/EmployeePermissionsScreen'));
const ExpenseTypeListScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseTypeListScreen'));
const ExpenseTypeCreateScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseTypeCreateScreen'));
const ExpenseTypeEditScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseTypeEditScreen'));
const StockCreateScreen = React.lazy(() => import('../../modules/products/screens/ProductCreateScreen'));
const StockEditScreen = React.lazy(() => import('../../modules/products/screens/ProductEditScreen'));
const QuickSaleScreen = React.lazy(() => import('../../modules/products/screens/QuickSaleScreen'));
const QuickPurchaseScreen = React.lazy(() => import('../../modules/products/screens/QuickPurchaseScreen'));
const GlobalFieldsManagementScreen = React.lazy(() => import('../../modules/products/screens/GlobalFieldsManagementScreen'));
const CategoryManagementScreen = React.lazy(() => import('../../modules/products/screens/CategoryManagementScreen'));
const PurchaseCreateScreen = React.lazy(() => import('../../modules/purchases/screens/PurchaseCreateScreen'));
const PurchaseEditScreen = React.lazy(() => import('../../modules/purchases/screens/PurchaseEditScreen'));

// Other screens - ProfileScreen imported directly to avoid native module loading issues
const SettingsScreen = React.lazy(() => import('../../screens/SettingsScreen'));
const NotificationsScreen = React.lazy(() => import('../../screens/NotificationsScreen'));

export const allRoutes: RouteConfig[] = [
  { name: 'Dashboard', module: 'dashboard', component: DashboardScreen, options: { title: i18n.t('dashboard:title') } },
  // Module Dashboard screens
  { name: 'StockDashboard', module: 'stock', component: StockDashboardScreen, requiredPermission: 'stock:view', options: { title: i18n.t('stock:stock', { defaultValue: 'Stock' }) } },
  { name: 'SalesDashboard', module: 'sales', component: SalesDashboardScreen, requiredPermission: 'sales:view', options: { title: i18n.t('sales:sales') } },
  { name: 'PurchasesDashboard', module: 'purchases', component: PurchasesDashboardScreen, requiredPermission: 'purchases:view', options: { title: i18n.t('purchases:purchases', { defaultValue: 'Alışlar' }) } },
  { name: 'CustomersDashboard', module: 'customers', component: CustomersDashboardScreen, requiredPermission: 'customers:view', options: { title: i18n.t('customers:customers') } },
  { name: 'SuppliersDashboard', module: 'suppliers', component: SuppliersDashboardScreen, requiredPermission: 'suppliers:view', options: { title: i18n.t('suppliers:suppliers', { defaultValue: 'Tedarikçiler' }) } },
  { name: 'ExpensesDashboard', module: 'expenses', component: ExpensesDashboardScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expenses') } },
  { name: 'RevenueDashboard', module: 'revenue', component: RevenueDashboardScreen, requiredPermission: 'revenue:view', options: { title: i18n.t('revenue:revenue', { defaultValue: 'Gelirler' }) } },
  { name: 'EmployeesDashboard', module: 'employees', component: EmployeesDashboardScreen, requiredPermission: 'employees:view', options: { title: i18n.t('settings:employees', { defaultValue: 'Employees' }) } },
  { name: 'ReportsDashboard', module: 'reports', component: ReportsDashboardScreen, requiredPermission: 'reports:view', options: { title: i18n.t('reports:reports') } },
  // Main module routes (point to dashboard)
  { name: 'Sales', module: 'sales', component: SalesDashboardScreen, requiredPermission: 'sales:view', options: { title: i18n.t('sales:sales') } },
  { name: 'Purchases', module: 'purchases', component: PurchasesDashboardScreen, requiredPermission: 'purchases:view', options: { title: i18n.t('purchases:purchases', { defaultValue: 'Alışlar' }) } },
  { name: 'Customers', module: 'customers', component: CustomersDashboardScreen, requiredPermission: 'customers:view', options: { title: i18n.t('customers:customers') } },
  { name: 'Suppliers', module: 'suppliers', component: SuppliersDashboardScreen, requiredPermission: 'suppliers:view', options: { title: i18n.t('suppliers:suppliers', { defaultValue: 'Tedarikçiler' }) } },
  { name: 'Expenses', module: 'expenses', component: ExpensesDashboardScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expenses') } },
  { name: 'Revenue', module: 'revenue', component: RevenueDashboardScreen, requiredPermission: 'revenue:view', options: { title: i18n.t('revenue:revenue', { defaultValue: 'Gelirler' }) } },
  { name: 'Stock', module: 'stock', component: StockDashboardScreen, requiredPermission: 'stock:view', options: { title: i18n.t('stock:stock', { defaultValue: 'Stock' }) } },
  { name: 'Employees', module: 'employees', component: EmployeesDashboardScreen, requiredPermission: 'employees:view', options: { title: i18n.t('settings:employees', { defaultValue: 'Employees' }) } },
  { name: 'Reports', module: 'reports', component: ReportsDashboardScreen, requiredPermission: 'reports:view', options: { title: i18n.t('reports:reports') } },
  // List screens
  { name: 'SalesList', module: 'sales', component: SalesListScreen, requiredPermission: 'sales:view', options: { title: i18n.t('sales:sales') } },
  { name: 'PurchaseList', module: 'purchases', component: PurchaseListScreen, requiredPermission: 'purchases:view', options: { title: i18n.t('purchases:purchases', { defaultValue: 'Alışlar' }) } },
  { name: 'CustomersList', module: 'customers', component: CustomersListScreen, requiredPermission: 'customers:view', options: { title: i18n.t('customers:customers') } },
  { name: 'SuppliersList', module: 'suppliers', component: SuppliersListScreen, requiredPermission: 'suppliers:view', options: { title: i18n.t('suppliers:suppliers', { defaultValue: 'Tedarikçiler' }) } },
  { name: 'ExpensesList', module: 'expenses', component: ExpensesListScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expenses') } },
  { name: 'RevenueList', module: 'revenue', component: RevenueListScreen, requiredPermission: 'revenue:view', options: { title: i18n.t('revenue:revenue', { defaultValue: 'Gelirler' }) } },
  { name: 'StockList', module: 'stock', component: StockListScreen, requiredPermission: 'stock:view', options: { title: i18n.t('stock:stock', { defaultValue: 'Stock' }) } },
  { name: 'EmployeesList', module: 'employees', component: EmployeesScreen, requiredPermission: 'employees:view', options: { title: i18n.t('settings:employees', { defaultValue: 'Employees' }) } },
  { name: 'ReportsList', module: 'reports', component: ReportsScreen, requiredPermission: 'reports:view', options: { title: i18n.t('reports:reports') } },
  { name: 'ExpenseTypes', module: 'expenses', component: ExpenseTypeListScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expense_types') } },
  
  // Detail screens
  { name: 'SalesDetail', module: 'sales', component: SalesDetailScreen, requiredPermission: 'sales:view', options: { title: i18n.t('sales:sale_details') } },
  { name: 'PurchaseDetail', module: 'purchases', component: PurchaseDetailScreen, requiredPermission: 'purchases:view', options: { title: i18n.t('purchases:purchase_details', { defaultValue: 'Alış Detayları' }) } },
  { name: 'CustomerDetail', module: 'customers', component: CustomerDetailScreen, requiredPermission: 'customers:view', options: { title: i18n.t('customers:customer_details') } },
  { name: 'SupplierDetail', module: 'suppliers', component: SupplierDetailScreen, requiredPermission: 'suppliers:view', options: { title: i18n.t('suppliers:supplier_details', { defaultValue: 'Tedarikçi Detayları' }) } },
  { name: 'ExpenseDetail', module: 'expenses', component: ExpenseDetailScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expense_details') } },
  { name: 'RevenueDetail', module: 'revenue', component: RevenueDetailScreen, requiredPermission: 'revenue:view', options: { title: i18n.t('revenue:revenue_details', { defaultValue: 'Gelir Detayları' }) } },
  { name: 'EmployeeDetail', module: 'employees', component: EmployeeDetailScreen, requiredPermission: 'employees:view', options: { title: i18n.t('settings:employee_details') } },
  { name: 'ReportDetail', module: 'reports', component: ReportDetailScreen, requiredPermission: 'reports:view', options: { title: i18n.t('reports:report_details') } },
  { name: 'StockDetail', module: 'stock', component: StockDetailScreen, requiredPermission: 'stock:view', options: { title: i18n.t('stock:stock_details', { defaultValue: 'Stock details' }) } },
  
  // Create screens
  { name: 'SalesCreate', module: 'sales', component: SalesCreateScreen, requiredPermission: 'sales:create', options: { title: i18n.t('sales:new_sale') } },
  { name: 'PurchaseCreate', module: 'purchases', component: PurchaseCreateScreen, requiredPermission: 'purchases:create', options: { title: i18n.t('purchases:new_purchase', { defaultValue: 'Yeni Alış' }) } },
  { name: 'CustomerCreate', module: 'customers', component: CustomerCreateScreen, requiredPermission: 'customers:create', options: { title: i18n.t('customers:new_customer') } },
  { name: 'SupplierCreate', module: 'suppliers', component: SupplierCreateScreen, requiredPermission: 'suppliers:create', options: { title: i18n.t('suppliers:new_supplier', { defaultValue: 'Yeni Tedarikçi' }) } },
  { name: 'ExpenseCreate', module: 'expenses', component: ExpenseCreateScreen, requiredPermission: 'expenses:create', options: { title: i18n.t('expenses:new_expense') } },
  { name: 'RevenueCreate', module: 'revenue', component: RevenueCreateScreen, requiredPermission: 'revenue:create', options: { title: i18n.t('revenue:new_revenue', { defaultValue: 'Yeni Gelir' }) } },
  { name: 'EmployeeCreate', module: 'employees', component: EmployeeCreateScreen, requiredPermission: 'employees:create', options: { title: i18n.t('settings:new_employee') } },
  { name: 'ExpenseTypeCreate', module: 'expenses', component: ExpenseTypeCreateScreen, requiredPermission: 'expenses:create', options: { title: i18n.t('expenses:new_expense_type') } },
  { name: 'StockCreate', module: 'stock', component: StockCreateScreen, requiredPermission: 'stock:create', options: { title: i18n.t('stock:new_stock', { defaultValue: 'New stock' }) } },
  { name: 'QuickSale', module: 'stock', component: QuickSaleScreen, requiredPermission: 'sales:create', options: { title: i18n.t('stock:quick_sale', { defaultValue: 'Quick Sale' }) } },
  { name: 'QuickPurchase', module: 'stock', component: QuickPurchaseScreen, requiredPermission: 'purchases:create', options: { title: i18n.t('stock:quick_purchase', { defaultValue: 'Quick Purchase' }) } },
  { name: 'GlobalFieldsManagement', module: 'stock', component: GlobalFieldsManagementScreen, requiredPermission: 'stock:manage_global_fields', options: { title: i18n.t('stock:manage_global_fields', { defaultValue: 'Manage Global Fields' }) } },
  { name: 'CategoryManagement', module: 'stock', component: CategoryManagementScreen, requiredPermission: 'stock:view', options: { title: i18n.t('stock:category_management', { defaultValue: 'Category Management' }) } },
  
  // Edit screens
  { name: 'SalesEdit', module: 'sales', component: SalesEditScreen, requiredPermission: 'sales:edit', options: { title: i18n.t('sales:edit_sale') } },
  { name: 'PurchaseEdit', module: 'purchases', component: PurchaseEditScreen, requiredPermission: 'purchases:edit', options: { title: i18n.t('purchases:edit_purchase', { defaultValue: 'Alış Düzenle' }) } },
  { name: 'CustomerEdit', module: 'customers', component: CustomerEditScreen, requiredPermission: 'customers:edit', options: { title: i18n.t('customers:edit_customer') } },
  { name: 'SupplierEdit', module: 'suppliers', component: SupplierEditScreen, requiredPermission: 'suppliers:edit', options: { title: i18n.t('suppliers:edit_supplier', { defaultValue: 'Tedarikçi Düzenle' }) } },
  { name: 'ExpenseEdit', module: 'expenses', component: ExpenseEditScreen, requiredPermission: 'expenses:edit', options: { title: i18n.t('expenses:edit_expense') } },
  { name: 'RevenueEdit', module: 'revenue', component: RevenueEditScreen, requiredPermission: 'revenue:edit', options: { title: i18n.t('revenue:edit_revenue', { defaultValue: 'Gelir Düzenle' }) } },
  { name: 'EmployeeEdit', module: 'employees', component: EmployeeEditScreen, requiredPermission: 'employees:edit', options: { title: i18n.t('settings:edit_employee') } },
  { name: 'EmployeePermissions', module: 'employees', component: EmployeePermissionsScreen, requiredPermission: 'employees:edit', options: { title: i18n.t('employees:manage_permissions') } },
  { name: 'ExpenseTypeEdit', module: 'expenses', component: ExpenseTypeEditScreen, requiredPermission: 'expenses:edit', options: { title: i18n.t('expenses:edit_expense_type') } },
  { name: 'StockEdit', module: 'stock', component: StockEditScreen, requiredPermission: 'stock:edit', options: { title: i18n.t('stock:edit_stock', { defaultValue: 'Edit stock' }) } },
  
  // Other screens
  { name: 'Profile', module: 'profile', component: ProfileScreen, options: { title: i18n.t('profile') } },
  { name: 'Settings', module: 'settings', component: SettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('settings') } },
  { name: 'Notifications', module: 'notifications', component: NotificationsScreen, options: { title: i18n.t('notifications') } },
];

export const filterRoutesByRole = (role: Role, hasPermission: (r: Role, p: string) => boolean): RouteConfig[] =>
  allRoutes.filter((r) => !r.requiredPermission || hasPermission(role, r.requiredPermission));


