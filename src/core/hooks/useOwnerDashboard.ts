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
import { useOwnerTodaySummary, useOwnerTotalSummary, useOwnerEmployeeSummary } from './useOwnerDashboardSummary';

export interface OwnerDashboardStats {
  todaySales: string;
  todayExpenses: string;
  todayTotal: string;
  allSales: string;
  allExpenses: string;
  allTotal: string;
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
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  
  // Value visibility state
  const [showValues, setShowValues] = useState(false);
  
  // Employee selection state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<'total' | string>('total');
  const [showEmpValues, setShowEmpValues] = useState(false);
  const [employeePickerVisible, setEmployeePickerVisible] = useState(false);
  
  // User data
  const userId = useAppStore((s: any) => s.userId);
  const token = useAppStore((s: any) => s.token);
  
  // Fetch employees list
  const { data: employeesData, isLoading: employeesLoading } = useEmployeesQuery();
  
  // Fetch dashboard summaries
  const { data: todaySummary, isLoading: todaySummaryLoading } = useOwnerTodaySummary();
  const { data: totalSummary, isLoading: totalSummaryLoading } = useOwnerTotalSummary();
  
  // Fetch employee summary (with employeeId or total, based on activeTab)
  const { data: employeeSummary, isLoading: employeeSummaryLoading } = useOwnerEmployeeSummary(
    selectedEmployeeId !== 'total' ? selectedEmployeeId : undefined,
    activeTab
  );
  
  // Get owner name from token (extracted from token in mock service)
  const ownerName = useMemo(() => {
    // Try to get from token user info - will be handled by mock service
    return t('dashboard:owner', { defaultValue: 'Owner' });
  }, [t]);
  
  const companyName = useMemo(() => {
    return t('common:default_company', { defaultValue: 'Your Company' });
  }, [t]);
  
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
  const stats: OwnerDashboardStats = useMemo(() => {
    const todaySalesAmount = todaySummary?.sales || 0;
    const todayExpensesAmount = todaySummary?.expenses || 0;
    const todayTotalAmount = todaySummary?.total || 0;
    
    const allSalesAmount = totalSummary?.sales || 0;
    const allExpensesAmount = totalSummary?.expenses || 0;
    const allTotalAmount = totalSummary?.total || 0;
    
    return {
      todaySales: `₺${todaySalesAmount.toLocaleString('tr-TR')}`,
      todayExpenses: `₺${todayExpensesAmount.toLocaleString('tr-TR')}`,
      todayTotal: `₺${todayTotalAmount.toLocaleString('tr-TR')}`,
      allSales: `₺${allSalesAmount.toLocaleString('tr-TR')}`,
      allExpenses: `₺${allExpensesAmount.toLocaleString('tr-TR')}`,
      allTotal: `₺${allTotalAmount.toLocaleString('tr-TR')}`,
    };
  }, [todaySummary, totalSummary]);
  
  // Employee stats - from API
  const employeeStats = useMemo(() => {
    const empSales = employeeSummary?.sales || 0;
    const empExpenses = employeeSummary?.expenses || 0;
    const empTotal = employeeSummary?.total || 0;
    
    return {
      sales: `₺${empSales.toLocaleString('tr-TR')}`,
      expenses: `₺${empExpenses.toLocaleString('tr-TR')}`,
      total: `₺${empTotal.toLocaleString('tr-TR')}`,
    };
  }, [employeeSummary]);
  
  // Get current stats based on active tab
  const currentStats = useMemo(() => {
    if (activeTab === 'today') {
      return {
        sales: stats.todaySales,
        expenses: stats.todayExpenses,
        total: stats.todayTotal,
      };
    }
    return {
      sales: stats.allSales,
      expenses: stats.allExpenses,
      total: stats.allTotal,
    };
  }, [activeTab, stats]);
  
  const isLoading = employeesLoading || todaySummaryLoading || totalSummaryLoading || employeeSummaryLoading;
  
  return {
    // State
    activeTab,
    setActiveTab,
    showValues,
    setShowValues,
    selectedEmployeeId,
    setSelectedEmployeeId,
    showEmpValues,
    setShowEmpValues,
    employeePickerVisible,
    setEmployeePickerVisible,
    
    // Data
    ownerName,
    companyName,
    employeeCards,
    stats: currentStats,
    employeeStats,
    isLoading,
    
    // Translation
    t,
  };
}

