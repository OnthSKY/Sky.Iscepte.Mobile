import React from 'react';
import { View } from 'react-native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import SummaryCard from '../shared/components/SummaryCard';
import { LinearGradient } from 'expo-linear-gradient';
import spacing from '../core/constants/spacing';
import DashboardTopBar from '../shared/components/DashboardTopBar';

export default function StaffDashboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation(['dashboard', 'sales']);

  const isDark = false;
  const headerGradientColors = isDark ? ['#0F172A', '#1E3A8A'] : ['#1D4ED8', '#3B82F6'];

  return (
    <ScreenLayout>
      <LinearGradient colors={headerGradientColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ marginHorizontal: 16, marginTop: 8, borderRadius: 16, padding: 16 }}>
        <DashboardTopBar variant="staff" />
      </LinearGradient>
      <View style={{ padding: 16, gap: 12 }}>
        <SummaryCard title={t('sales:sales')} value="₺3.780" trend={{ value: 4, direction: 'up' }} />
      </View>
    </ScreenLayout>
  );
}


