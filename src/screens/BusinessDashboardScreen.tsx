import React from 'react';
import { View } from 'react-native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function BusinessDashboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation(['dashboard']);

  return (
    <ScreenLayout title={t('dashboard:title')}>
      <View style={{ padding: 16 }}>
        {/* Owner/Staff dashboard content goes here */}
      </View>
    </ScreenLayout>
  );
}


