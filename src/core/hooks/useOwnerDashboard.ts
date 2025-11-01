/**
 * useOwnerDashboard Hook
 * 
 * Single Responsibility: Handles owner dashboard state and logic
 * Dependency Inversion: Depends on stores and services, not concrete implementations
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { useEmployeeStore } from '../../modules/employees/store/employeeStore';

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
  const user: any = useAppStore((s: any) => s.user);
  const role = useAppStore((s: any) => s.role);
  const ownerName = user?.name || 'Kullanıcı';
  const companyName = user?.company || 'Şirketiniz';
  
  // Employee data
  const employees = useEmployeeStore((s: any) => s.items);
  const employeeCards: EmployeeCard[] = useMemo(() => {
    if (employees && employees.length > 0) return employees;
    // Mock data for development
    return [
      { id: 'e1', name: 'Ahmet Yılmaz', role: 'cashier' },
      { id: 'e2', name: 'Ayşe Demir', role: 'sales' },
      { id: 'e3', name: 'Mehmet Kaya', role: 'sales' },
    ];
  }, [employees]);
  
  // Stats data (placeholder - should come from API)
  const stats: OwnerDashboardStats = useMemo(() => ({
    todaySales: '₺12.450',
    todayExpenses: '₺3.200',
    todayTotal: '₺9.250',
    allSales: '₺1.245.000',
    allExpenses: '₺820.000',
    allTotal: '₺425.000',
  }), []);
  
  // Employee stats (placeholder - should come from API)
  // Based on selected employee, calculate or fetch stats
  const employeeStats = useMemo(() => {
    // TODO: Replace with actual API call based on selectedEmployeeId
    if (selectedEmployeeId === 'total') {
      return {
        sales: '₺18.700',
        expenses: '₺2.150',
        total: '₺16.550',
      };
    }
    // Individual employee stats (should come from API)
    const selectedEmployee = employeeCards.find((e) => e.id === selectedEmployeeId);
    return {
      sales: '₺6.200',
      expenses: '₺720',
      total: '₺5.480',
    };
  }, [selectedEmployeeId, employeeCards]);
  
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
    role,
    employeeCards,
    stats: currentStats,
    employeeStats,
    
    // Translation
    t,
  };
}

