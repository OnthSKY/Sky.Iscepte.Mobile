import React from 'react';
import { View } from 'react-native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import DashboardTopBar from '../shared/components/DashboardTopBar';

export default function AdminDashboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation(['dashboard']);

  const headerGradientColors = ['#111827', '#1F2937'];
  return (
    <ScreenLayout>
      <LinearGradient colors={headerGradientColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ marginHorizontal: 16, marginTop: 8, borderRadius: 16, padding: 16 }}>
        <DashboardTopBar variant="admin" />
      </LinearGradient>
      <View style={{ padding: 16 }}>
        {/* Admin-specific dashboard content goes here */}
      </View>
    </ScreenLayout>
  );
}


