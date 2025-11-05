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
const DebtSalesScreen = React.lazy(() => import('../../modules/sales/screens/DebtSalesScreen'));
const CustomersListScreen = React.lazy(() => import('../../modules/customers/screens/CustomerListScreen'));
const SuppliersListScreen = React.lazy(() => import('../../modules/suppliers/screens/SupplierListScreen'));
const ExpensesListScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseListScreen'));
const RevenueListScreen = React.lazy(() => import('../../modules/revenue/screens/RevenueListScreen'));
const ReportsScreen = React.lazy(() => import('../../modules/reports/screens/ReportsScreen'));
const EmployeesScreen = React.lazy(() => import('../../modules/employees/screens/EmployeeListScreen'));
const StockListScreen = React.lazy(() => import('../../modules/products/screens/ProductListScreen'));
const PurchaseListScreen = React.lazy(() => import('../../modules/purchases/screens/PurchaseListScreen'));

// Report screens
const SalesReportScreen = React.lazy(() => import('../../modules/sales/screens/SalesReportScreen'));

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
const StaffPermissionGroupManagementScreen = React.lazy(() => import('../../modules/employees/screens/StaffPermissionGroupManagementScreen'));
const ExpenseTypeListScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseTypeListScreen'));
const ExpenseTypeCreateScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseTypeCreateScreen'));
const ExpenseTypeEditScreen = React.lazy(() => import('../../modules/expenses/screens/ExpenseTypeEditScreen'));
const StockCreateScreen = React.lazy(() => import('../../modules/products/screens/ProductCreateScreen'));
const StockEditScreen = React.lazy(() => import('../../modules/products/screens/ProductEditScreen'));
const QuickSaleScreen = React.lazy(() => import('../../modules/products/screens/QuickSaleScreen'));
const QuickPurchaseScreen = React.lazy(() => import('../../modules/products/screens/QuickPurchaseScreen'));
const CategoryManagementScreen = React.lazy(() => import('../../modules/products/screens/CategoryManagementScreen'));
const FormTemplateManagementScreen = React.lazy(() => import('../../screens/FormTemplateManagementScreen'));
const PurchaseCreateScreen = React.lazy(() => import('../../modules/purchases/screens/PurchaseCreateScreen'));
const PurchaseEditScreen = React.lazy(() => import('../../modules/purchases/screens/PurchaseEditScreen'));

// Other screens - ProfileScreen imported directly to avoid native module loading issues
const SettingsScreen = React.lazy(() => import('../../screens/SettingsScreen'));
const GeneralModuleSettingsScreen = React.lazy(() => import('../../screens/GeneralModuleSettingsScreen'));
const StockModuleSettingsScreen = React.lazy(() => import('../../screens/StockModuleSettingsScreen'));
const EmployeesModuleSettingsScreen = React.lazy(() => import('../../screens/EmployeesModuleSettingsScreen'));
const CustomersModuleSettingsScreen = React.lazy(() => import('../../screens/CustomersModuleSettingsScreen'));
const SuppliersModuleSettingsScreen = React.lazy(() => import('../../screens/SuppliersModuleSettingsScreen'));
const SalesModuleSettingsScreen = React.lazy(() => import('../../screens/SalesModuleSettingsScreen'));
const PurchasesModuleSettingsScreen = React.lazy(() => import('../../screens/PurchasesModuleSettingsScreen'));
const ExpensesModuleSettingsScreen = React.lazy(() => import('../../screens/ExpensesModuleSettingsScreen'));
const RevenueModuleSettingsScreen = React.lazy(() => import('../../screens/RevenueModuleSettingsScreen'));
const LanguageSettingsScreen = React.lazy(() => import('../../screens/LanguageSettingsScreen'));
const ThemeSettingsScreen = React.lazy(() => import('../../screens/ThemeSettingsScreen'));
const MenuTextCaseSettingsScreen = React.lazy(() => import('../../screens/MenuTextCaseSettingsScreen'));
const OwnerSettingsScreen = React.lazy(() => import('../../screens/AdminSettingsScreen'));
const LowStockAlertSettingsScreen = React.lazy(() => import('../../screens/LowStockAlertSettingsScreen'));
const EmployeeVerificationSettingsScreen = React.lazy(() => import('../../screens/EmployeeVerificationSettingsScreen'));
const NotificationsScreen = React.lazy(() => import('../../screens/NotificationsScreen'));
const PackagesScreen = React.lazy(() => import('../../screens/PackagesScreen'));
const MyPackageScreen = React.lazy(() => import('../../screens/MyPackageScreen'));
const CalendarScreen = React.lazy(() => import('../../screens/CalendarScreen'));

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
  // Calendar module
  { name: 'Calendar', module: 'calendar', component: CalendarScreen, requiredPermission: 'calendar:view', options: { title: i18n.t('calendar:module_name', { defaultValue: 'Takvim' }) } },
  // List screens
  { name: 'SalesList', module: 'sales', component: SalesListScreen, requiredPermission: 'sales:view', options: { title: i18n.t('sales:sales') } },
  { name: 'DebtSales', module: 'sales', component: DebtSalesScreen, requiredPermission: 'sales:view', options: { title: i18n.t('sales:debt_sales', { defaultValue: 'Borçlu Satışlar' }) } },
  { name: 'PurchaseList', module: 'purchases', component: PurchaseListScreen, requiredPermission: 'purchases:view', options: { title: i18n.t('purchases:purchases', { defaultValue: 'Alışlar' }) } },
  { name: 'CustomersList', module: 'customers', component: CustomersListScreen, requiredPermission: 'customers:view', options: { title: i18n.t('customers:customers') } },
  { name: 'SuppliersList', module: 'suppliers', component: SuppliersListScreen, requiredPermission: 'suppliers:view', options: { title: i18n.t('suppliers:suppliers', { defaultValue: 'Tedarikçiler' }) } },
  { name: 'ExpensesList', module: 'expenses', component: ExpensesListScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expenses') } },
  { name: 'RevenueList', module: 'revenue', component: RevenueListScreen, requiredPermission: 'revenue:view', options: { title: i18n.t('revenue:revenue', { defaultValue: 'Gelirler' }) } },
  { name: 'StockList', module: 'stock', component: StockListScreen, requiredPermission: 'stock:view', options: { title: i18n.t('stock:stock', { defaultValue: 'Stock' }) } },
  { name: 'EmployeesList', module: 'employees', component: EmployeesScreen, requiredPermission: 'employees:view', options: { title: i18n.t('settings:employees', { defaultValue: 'Employees' }) } },
  { name: 'ReportsList', module: 'reports', component: ReportsScreen, requiredPermission: 'reports:view', options: { title: i18n.t('reports:reports') } },
  { name: 'ExpenseTypes', module: 'expenses', component: ExpenseTypeListScreen, requiredPermission: 'expenses:view', options: { title: i18n.t('expenses:expense_types') } },
  
  // Report screens
  { name: 'SalesReport', module: 'sales', component: SalesReportScreen, requiredPermission: 'sales:view', options: { title: i18n.t('sales:sales', { defaultValue: 'Satış Raporları' }) } },
  
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
  { name: 'CategoryManagement', module: 'stock', component: CategoryManagementScreen, requiredPermission: 'stock:view', options: { title: i18n.t('stock:category_management', { defaultValue: 'Category Management' }) } },
  { name: 'FormTemplateManagement', module: 'settings', component: FormTemplateManagementScreen, requiredPermission: 'settings:view', options: { title: i18n.t('settings:form_templates', { defaultValue: 'Form Templates' }) } },
  
  // Edit screens
  { name: 'SalesEdit', module: 'sales', component: SalesEditScreen, requiredPermission: 'sales:edit', options: { title: i18n.t('sales:edit_sale') } },
  { name: 'PurchaseEdit', module: 'purchases', component: PurchaseEditScreen, requiredPermission: 'purchases:edit', options: { title: i18n.t('purchases:edit_purchase', { defaultValue: 'Alış Düzenle' }) } },
  { name: 'CustomerEdit', module: 'customers', component: CustomerEditScreen, requiredPermission: 'customers:edit', options: { title: i18n.t('customers:edit_customer') } },
  { name: 'SupplierEdit', module: 'suppliers', component: SupplierEditScreen, requiredPermission: 'suppliers:edit', options: { title: i18n.t('suppliers:edit_supplier', { defaultValue: 'Tedarikçi Düzenle' }) } },
  { name: 'ExpenseEdit', module: 'expenses', component: ExpenseEditScreen, requiredPermission: 'expenses:edit', options: { title: i18n.t('expenses:edit_expense') } },
  { name: 'RevenueEdit', module: 'revenue', component: RevenueEditScreen, requiredPermission: 'revenue:edit', options: { title: i18n.t('revenue:edit_revenue', { defaultValue: 'Gelir Düzenle' }) } },
  { name: 'EmployeeEdit', module: 'employees', component: EmployeeEditScreen, requiredPermission: 'employees:edit', options: { title: i18n.t('settings:edit_employee') } },
  { name: 'EmployeePermissions', module: 'employees', component: EmployeePermissionsScreen, requiredPermission: 'employees:edit', options: { title: i18n.t('employees:manage_permissions') } },
  { name: 'StaffPermissionGroupManagement', module: 'employees', component: StaffPermissionGroupManagementScreen, requiredPermission: 'employees:edit', options: { title: i18n.t('employees:permission_groups', { defaultValue: 'Yetki Grupları' }) } },
  { name: 'ExpenseTypeEdit', module: 'expenses', component: ExpenseTypeEditScreen, requiredPermission: 'expenses:edit', options: { title: i18n.t('expenses:edit_expense_type') } },
  { name: 'StockEdit', module: 'stock', component: StockEditScreen, requiredPermission: 'stock:edit', options: { title: i18n.t('stock:edit_stock', { defaultValue: 'Edit stock' }) } },
  
  // Other screens
  { name: 'Profile', module: 'profile', component: ProfileScreen, options: { title: i18n.t('profile') } },
  { name: 'Settings', module: 'settings', component: SettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('settings') } },
  { name: 'GeneralModuleSettings', module: 'settings', component: GeneralModuleSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('settings:general_settings', { defaultValue: 'Genel Ayarlar' }) } },
  { name: 'StockModuleSettings', module: 'settings', component: StockModuleSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('stock:stock', { defaultValue: 'Stock Modülü' }) } },
  { name: 'EmployeesModuleSettings', module: 'settings', component: EmployeesModuleSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('employees:employees', { defaultValue: 'Çalışanlar Modülü' }) } },
  { name: 'CustomersModuleSettings', module: 'settings', component: CustomersModuleSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('customers:customers', { defaultValue: 'Müşteriler Modülü' }) } },
  { name: 'SuppliersModuleSettings', module: 'settings', component: SuppliersModuleSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('suppliers:suppliers', { defaultValue: 'Tedarikçiler Modülü' }) } },
  { name: 'SalesModuleSettings', module: 'settings', component: SalesModuleSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('sales:sales', { defaultValue: 'Satışlar Modülü' }) } },
  { name: 'PurchasesModuleSettings', module: 'settings', component: PurchasesModuleSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('purchases:purchases', { defaultValue: 'Alışlar Modülü' }) } },
  { name: 'ExpensesModuleSettings', module: 'settings', component: ExpensesModuleSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('expenses:expenses', { defaultValue: 'Giderler Modülü' }) } },
  { name: 'RevenueModuleSettings', module: 'settings', component: RevenueModuleSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('revenue:revenue', { defaultValue: 'Gelirler Modülü' }) } },
  { name: 'LanguageSettings', module: 'settings', component: LanguageSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('settings:language', { defaultValue: 'Dil' }) } },
  { name: 'ThemeSettings', module: 'settings', component: ThemeSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('settings:theme', { defaultValue: 'Tema' }) } },
  { name: 'MenuTextCaseSettings', module: 'settings', component: MenuTextCaseSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('settings:menu_text_case', { defaultValue: 'Menü Metin Boyutu' }) } },
  { name: 'OwnerSettings', module: 'settings', component: OwnerSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('settings:owner_settings', { defaultValue: 'Satıcı Ayarları' }) } },
  { name: 'LowStockAlertSettings', module: 'settings', component: LowStockAlertSettingsScreen, requiredPermission: 'settings:view', options: { title: i18n.t('settings:stock_alerts', { defaultValue: 'Stok Uyarı Ayarları' }) } },
  { name: 'EmployeeVerificationSettings', module: 'settings', component: EmployeeVerificationSettingsScreen, requiredPermission: 'employees:edit', options: { title: i18n.t('employees:verification_settings', { defaultValue: 'Doğrulama Ayarları' }) } },
  { name: 'Notifications', module: 'notifications', component: NotificationsScreen, options: { title: i18n.t('notifications') } },
  { name: 'Packages', module: 'settings', component: PackagesScreen, options: { title: i18n.t('packages:packages', { defaultValue: 'Paketler' }) } },
  { name: 'MyPackage', module: 'settings', component: MyPackageScreen, requiredPermission: 'settings:view', options: { title: i18n.t('packages:my_package', { defaultValue: 'Paketim' }) } },
];

export const filterRoutesByRole = (role: Role, hasPermission: (r: Role, p: string) => boolean): RouteConfig[] =>
  allRoutes.filter((r) => !r.requiredPermission || hasPermission(role, r.requiredPermission));


