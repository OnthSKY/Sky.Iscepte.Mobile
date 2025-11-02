/**
 * useOwnerDashboard Hook
 * 
 * Single Responsibility: Handles owner dashboard state and logic
 * Dependency Inversion: Depends on stores and services, not concrete implementations
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { useEmployeesQuery } from '../../modules/employees/hooks/useEmployeesQuery';
import { useOwnerStoreSummary, useOwnerEmployeeSummary, useOwnerTopProducts } from './useOwnerDashboardSummary';

export interface OwnerDashboardStats {
  sales: string;
  expenses: string;
  total: string;
}

export interface EmployeeCard {
  id: string;
  name: string;
  role: string;
}

/**
 * Hook for owner dashboard functionality
 */
export function useOwnerDashboard() {
  const { t } = useTranslation(['dashboard', 'sales', 'reports', 'common']);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('all');
  
  // Value visibility state
  const [showStoreIncomeValues, setShowStoreIncomeValues] = useState(false);
  const [showStoreExpenseValues, setShowStoreExpenseValues] = useState(false);
  
  // Employee selection state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<'total' | string>('total');
  const [showEmpIncomeValues, setShowEmpIncomeValues] = useState(false);
  const [showEmpExpenseValues, setShowEmpExpenseValues] = useState(false);
  const [employeePickerVisible, setEmployeePickerVisible] = useState(false);
  
  // Show more state
  const [showMoreTopProducts, setShowMoreTopProducts] = useState(false);
  const [showMoreEmployeeProducts, setShowMoreEmployeeProducts] = useState(false);
  
  // User data
  const userId = useAppStore((s: any) => s.userId);
  const token = useAppStore((s: any) => s.token);
  
  // Fetch employees list
  const { data: employeesData, isLoading: employeesLoading } = useEmployeesQuery();
  
  // Fetch dashboard summaries
  const { data: storeSummary, isLoading: storeSummaryLoading } = useOwnerStoreSummary(activeTab);
  const { data: employeeSummary, isLoading: employeeSummaryLoading } = useOwnerEmployeeSummary(
    selectedEmployeeId !== 'total' ? selectedEmployeeId : undefined,
    activeTab
  );
  const { data: topProducts, isLoading: topProductsLoading } = useOwnerTopProducts(activeTab, 20);
  
  // Transform employees data
  const employeeCards: EmployeeCard[] = useMemo(() => {
    if (employeesData?.items && employeesData.items.length > 0) {
      return employeesData.items.map((emp: any) => ({
        id: String(emp.id),
        name: emp.name || t('common:unknown', { defaultValue: 'Unknown' }),
        role: emp.role || emp.department || 'staff',
      }));
    }
    return [];
  }, [employeesData, t]);
  
  // Calculate stats from API data
  const stats = useMemo(() => {
    const salesAmount = storeSummary?.sales || 0;
    const expensesAmount = storeSummary?.expenses || 0;
    const totalAmount = storeSummary?.total || 0;
    
    return {
      sales: `₺${salesAmount.toLocaleString('tr-TR')}`,
      expenses: `₺${expensesAmount.toLocaleString('tr-TR')}`,
      total: `₺${totalAmount.toLocaleString('tr-TR')}`,
    };
  }, [storeSummary]);
  
  // Employee stats - from API
  const employeeStats = useMemo(() => {
    const empSales = employeeSummary?.sales || 0;
    const empExpenses = employeeSummary?.expenses || 0;
    const empTotal = employeeSummary?.total || 0;
    
    return {
      sales: `₺${empSales.toLocaleString('tr-TR')}`,
      expenses: `₺${empExpenses.toLocaleString('tr-TR')}`,
      total: `₺${empTotal.toLocaleString('tr-TR')}`,
      productSales: employeeSummary?.productSales || [],
      productCount: employeeSummary?.productCount || 0,
    };
  }, [employeeSummary]);
  
  const isLoading = employeesLoading || storeSummaryLoading || employeeSummaryLoading || topProductsLoading;
  
  return {
    // State
    activeTab,
    setActiveTab,
    showStoreIncomeValues,
    setShowStoreIncomeValues,
    showStoreExpenseValues,
    setShowStoreExpenseValues,
    selectedEmployeeId,
    setSelectedEmployeeId,
    showEmpIncomeValues,
    setShowEmpIncomeValues,
    showEmpExpenseValues,
    setShowEmpExpenseValues,
    employeePickerVisible,
    setEmployeePickerVisible,
    showMoreTopProducts,
    setShowMoreTopProducts,
    showMoreEmployeeProducts,
    setShowMoreEmployeeProducts,
    
    // Data
    employeeCards,
    stats,
    employeeStats,
    topProducts: topProducts?.products || [],
    topProductsCount: topProducts?.totalCount || 0,
    isLoading,
    
    // Translation
    t,
  };
}

