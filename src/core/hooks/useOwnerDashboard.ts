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
import { CURRENCY_SYMBOLS } from '../../modules/products/utils/currency';

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
    const sales = storeSummary?.sales || [];
    const expenses = storeSummary?.expenses || [];
    const total = storeSummary?.total || [];
    
    // Format as currency strings
    const salesStr = sales.map((s: any) => {
      const symbol = CURRENCY_SYMBOLS[s.currency as keyof typeof CURRENCY_SYMBOLS] || '₺';
      return `${symbol}${s.amount.toLocaleString('tr-TR')}`;
    }).join(' / ') || '₺0';
    
    const expensesStr = expenses.map((e: any) => {
      const symbol = CURRENCY_SYMBOLS[e.currency as keyof typeof CURRENCY_SYMBOLS] || '₺';
      return `${symbol}${e.amount.toLocaleString('tr-TR')}`;
    }).join(' / ') || '₺0';
    
    const totalStr = total.map((t: any) => {
      const symbol = CURRENCY_SYMBOLS[t.currency as keyof typeof CURRENCY_SYMBOLS] || '₺';
      return `${symbol}${t.amount.toLocaleString('tr-TR')}`;
    }).join(' / ') || '₺0';
    
    return {
      sales: salesStr,
      expenses: expensesStr,
      total: totalStr,
    };
  }, [storeSummary]);
  
  // Employee stats - from API
  const employeeStats = useMemo(() => {
    const empSales = employeeSummary?.sales || [];
    const empExpenses = employeeSummary?.expenses || [];
    const empTotal = employeeSummary?.total || [];
    const productSales = employeeSummary?.productSales || [];
    const productCount = employeeSummary?.productCount || 0;
    
    // Format as currency strings
    const salesStr = empSales.map((s: any) => {
      const symbol = CURRENCY_SYMBOLS[s.currency as keyof typeof CURRENCY_SYMBOLS] || '₺';
      return `${symbol}${s.amount.toLocaleString('tr-TR')}`;
    }).join(' / ') || '₺0';
    
    const expensesStr = empExpenses.map((e: any) => {
      const symbol = CURRENCY_SYMBOLS[e.currency as keyof typeof CURRENCY_SYMBOLS] || '₺';
      return `${symbol}${e.amount.toLocaleString('tr-TR')}`;
    }).join(' / ') || '₺0';
    
    const totalStr = empTotal.map((t: any) => {
      const symbol = CURRENCY_SYMBOLS[t.currency as keyof typeof CURRENCY_SYMBOLS] || '₺';
      return `${symbol}${t.amount.toLocaleString('tr-TR')}`;
    }).join(' / ') || '₺0';
    
    return {
      sales: salesStr,
      expenses: expensesStr,
      total: totalStr,
      productSales,
      productCount,
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

