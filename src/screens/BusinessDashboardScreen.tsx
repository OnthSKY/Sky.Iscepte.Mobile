import React from 'react';
import { View } from 'react-native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import DashboardTopBar from '../shared/components/DashboardTopBar';

export default function BusinessDashboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation(['dashboard']);

  const headerGradientColors = ['#1D4ED8', '#3B82F6'];
  return (
    <ScreenLayout>
      <LinearGradient colors={headerGradientColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ marginHorizontal: 16, marginTop: 8, borderRadius: 16, padding: 16 }}>
        <DashboardTopBar variant="owner" />
      </LinearGradient>
      <View style={{ padding: 16 }}>
        {/* Business dashboard content goes here */}
      </View>
    </ScreenLayout>
  );
}


