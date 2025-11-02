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

  return (
    <ScreenLayout>
      <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ marginHorizontal: 16, marginTop: 8, borderRadius: 16, padding: 16 }}>
        <DashboardTopBar variant="staff" />
      </LinearGradient>
      <View style={{ padding: 16, gap: 12 }}>
        <SummaryCard 
          label={t('sales:sales')} 
          value="₺3.780" 
          icon="trending-up-outline"
          style={{ marginBottom: 24 }}
        />
      </View>
    </ScreenLayout>
  );
}


