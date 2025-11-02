/**
 * Navigation Configuration
 * 
 * Single Responsibility: Centralized navigation routing configuration
 * Open/Closed: Easy to extend with new routes without modifying existing code
 */

/**
 * Navigation fallback map
 * Maps create/edit screen routes to their corresponding list screen routes
 * Used when a create/edit screen is not available in the current navigator
 */
export const navigationFallbackMap: Record<string, string> = {
  // Sales module
  SalesCreate: 'Sales',
  SalesEdit: 'Sales',
  SalesDetail: 'Sales',
  
  // Customers module
  CustomerCreate: 'Customers',
  CustomerEdit: 'Customers',
  CustomerDetail: 'Customers',
  
  // Suppliers module
  SupplierCreate: 'Suppliers',
  SupplierEdit: 'Suppliers',
  SupplierDetail: 'Suppliers',
  
  // Expenses module
  ExpenseCreate: 'Expenses',
  ExpenseEdit: 'Expenses',
  ExpenseDetail: 'Expenses',
  ExpenseTypeCreate: 'ExpenseTypes',
  ExpenseTypeEdit: 'ExpenseTypes',
  
  // Employees module
  EmployeeCreate: 'Employees',
  EmployeeEdit: 'Employees',
  EmployeeDetail: 'Employees',
  
  // Products module (Stock)
  StockCreate: 'Stock',
  StockEdit: 'Stock',
  StockDetail: 'Stock',
  ProductCreate: 'Products',
  ProductEdit: 'Products',
  ProductDetail: 'Products',
  
  // Purchases module
  PurchaseCreate: 'Purchases',
  PurchaseEdit: 'Purchases',
  PurchaseDetail: 'Purchases',
  
  // Revenue module
  RevenueCreate: 'Revenue',
  RevenueEdit: 'Revenue',
  RevenueDetail: 'Revenue',
  
  // Reports module
  ReportDetail: 'Reports',
};

/**
 * Get fallback route for a given route name
 * 
 * @param routeName - The route name to get fallback for
 * @returns Fallback route name or undefined if no fallback exists
 */
export function getNavigationFallback(routeName: string): string | undefined {
  return navigationFallbackMap[routeName];
}

/**
 * Check if a route has a fallback
 * 
 * @param routeName - The route name to check
 * @returns True if fallback exists, false otherwise
 */
export function hasNavigationFallback(routeName: string): boolean {
  return routeName in navigationFallbackMap;
}

