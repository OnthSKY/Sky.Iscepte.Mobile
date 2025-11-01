import React from 'react';
import { View, Text } from 'react-native';
import { DetailScreenContainer } from '../../../shared/components/screens/DetailScreenContainer';
import { reportEntityService } from '../services/reportServiceAdapter';
import Card from '../../../shared/components/Card';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { Report } from '../store/reportStore';
import { useTranslation } from 'react-i18next';

/**
 * ReportDetailScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes detail screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function ReportDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('reports');

  return (
    <DetailScreenContainer
      service={reportEntityService}
      config={{
        entityName: 'report',
        translationNamespace: 'reports',
      }}
      renderContent={(data: Report) => (
        <View style={{ gap: spacing.md }}>
          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {data.title || '-'}
            </Text>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {t('statistics', { defaultValue: 'Statistics' })}
            </Text>
            <View style={{ gap: spacing.sm }}>
              <Text style={{ color: colors.muted }}>No statistics available</Text>
            </View>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {t('summary', { defaultValue: 'Summary' })}
            </Text>
            <Text style={{ color: colors.muted }}>No summary available</Text>
          </Card>
        </View>
      )}
    />
  );
}

