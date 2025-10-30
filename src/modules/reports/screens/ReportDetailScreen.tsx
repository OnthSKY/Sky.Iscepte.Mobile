import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Card from '../../../shared/components/Card';
import colors from '../../../core/constants/colors';
import spacing from '../../../core/constants/spacing';

type Props = {
  route: {
    params: {
      id: string;
      name?: string;
    };
  };
};

export default function ReportDetailScreen({ route }: Props) {
  const { t: tReports } = useTranslation('reports');

  const { name } = route.params;

  return (
    <ScreenLayout>
      <ScrollView>
        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>
            {tReports('report_details')}
          </Text>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {name || '-'}
            </Text>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {tReports('statistics')}
            </Text>
            <View style={{ gap: spacing.sm }}>
              {/* Statistics will be added */}
              <Text style={{ color: colors.muted }}>No statistics available</Text>
            </View>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {tReports('summary')}
            </Text>
            <Text style={{ color: colors.muted }}>No summary available</Text>
          </Card>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

