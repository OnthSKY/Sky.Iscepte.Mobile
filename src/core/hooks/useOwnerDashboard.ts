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
import { useSaleStatsQuery } from '../../modules/sales/hooks/useSalesQuery';
import { useExpenseStatsQuery } from '../../modules/expenses/hooks/useExpensesQuery';
import { useSalesQuery } from '../../modules/sales/hooks/useSalesQuery';
import { useExpensesQuery } from '../../modules/expenses/hooks/useExpensesQuery';

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
  
  // Fetch sales and expenses stats
  const { data: salesStats, isLoading: salesStatsLoading } = useSaleStatsQuery();
  const { data: expenseStats, isLoading: expenseStatsLoading } = useExpenseStatsQuery();
  
  // Fetch all sales and expenses for calculations
  const { data: salesData } = useSalesQuery();
  const { data: expensesData } = useExpensesQuery();
  
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
  
  // Calculate today's date
  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  }, []);
  
  // Calculate stats from API data
  const stats: OwnerDashboardStats = useMemo(() => {
    const allSalesAmount = salesStats?.totalRevenue || 0;
    const allExpensesAmount = expenseStats?.totalAmount || 0;
    const allTotalAmount = allSalesAmount - allExpensesAmount;
    
    // Calculate today's sales and expenses
    let todaySalesAmount = 0;
    let todayExpensesAmount = 0;
    
    if (salesData?.items) {
      todaySalesAmount = salesData.items
        .filter((sale: any) => sale.date === today && sale.status === 'completed')
        .reduce((sum: number, sale: any) => sum + (sale.amount || sale.total || 0), 0);
    }
    
    if (expensesData?.items) {
      todayExpensesAmount = expensesData.items
        .filter((exp: any) => exp.date === today)
        .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
    }
    
    const todayTotalAmount = todaySalesAmount - todayExpensesAmount;
    
    return {
      todaySales: `₺${todaySalesAmount.toLocaleString('tr-TR')}`,
      todayExpenses: `₺${todayExpensesAmount.toLocaleString('tr-TR')}`,
      todayTotal: `₺${todayTotalAmount.toLocaleString('tr-TR')}`,
      allSales: `₺${allSalesAmount.toLocaleString('tr-TR')}`,
      allExpenses: `₺${allExpensesAmount.toLocaleString('tr-TR')}`,
      allTotal: `₺${allTotalAmount.toLocaleString('tr-TR')}`,
    };
  }, [salesStats, expenseStats, salesData, expensesData, today]);
  
  // Employee stats - calculate from sales and expenses filtered by employee
  const employeeStats = useMemo(() => {
    if (selectedEmployeeId === 'total') {
      // Total for all employees (today's data)
      let totalSales = 0;
      let totalExpenses = 0;
      
      if (salesData?.items && activeTab === 'today') {
        totalSales = salesData.items
          .filter((sale: any) => sale.date === today && sale.status === 'completed')
          .reduce((sum: number, sale: any) => sum + (sale.amount || sale.total || 0), 0);
      } else if (salesStats && activeTab === 'all') {
        totalSales = salesStats.totalRevenue || 0;
      }
      
      if (expensesData?.items && activeTab === 'today') {
        totalExpenses = expensesData.items
          .filter((exp: any) => exp.date === today)
          .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
      } else if (expenseStats && activeTab === 'all') {
        totalExpenses = expenseStats.totalAmount || 0;
      }
      
      const total = totalSales - totalExpenses;
      
      return {
        sales: `₺${totalSales.toLocaleString('tr-TR')}`,
        expenses: `₺${totalExpenses.toLocaleString('tr-TR')}`,
        total: `₺${total.toLocaleString('tr-TR')}`,
      };
    }
    
    // Individual employee stats - filter by employeeId
    const selectedEmployee = employeeCards.find((e) => e.id === selectedEmployeeId);
    if (!selectedEmployee) {
      return {
        sales: '₺0',
        expenses: '₺0',
        total: '₺0',
      };
    }
    
    const employeeId = parseInt(selectedEmployeeId, 10);
    
    // Calculate sales for selected employee
    let empSales = 0;
    let empExpenses = 0;
    
    if (salesData?.items) {
      const filteredSales = salesData.items.filter((sale: any) => {
        const saleEmployeeId = sale.employeeId ? parseInt(String(sale.employeeId), 10) : null;
        const matchesEmployee = saleEmployeeId === employeeId;
        const matchesDate = activeTab === 'today' ? sale.date === today : true;
        const matchesStatus = activeTab === 'today' ? sale.status === 'completed' : true;
        return matchesEmployee && matchesDate && matchesStatus;
      });
      
      empSales = filteredSales.reduce((sum: number, sale: any) => sum + (sale.amount || sale.total || 0), 0);
    }
    
    if (expensesData?.items) {
      const filteredExpenses = expensesData.items.filter((exp: any) => {
        const expEmployeeId = exp.employeeId ? parseInt(String(exp.employeeId), 10) : null;
        const matchesEmployee = expEmployeeId === employeeId;
        const matchesDate = activeTab === 'today' ? exp.date === today : true;
        return matchesEmployee && matchesDate;
      });
      
      empExpenses = filteredExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
    }
    
    const empTotal = empSales - empExpenses;
    
    return {
      sales: `₺${empSales.toLocaleString('tr-TR')}`,
      expenses: `₺${empExpenses.toLocaleString('tr-TR')}`,
      total: `₺${empTotal.toLocaleString('tr-TR')}`,
    };
  }, [selectedEmployeeId, employeeCards, salesData, expensesData, salesStats, expenseStats, activeTab, today]);
  
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
  
  const isLoading = employeesLoading || salesStatsLoading || expenseStatsLoading;
  
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

