import React from 'react';
import { Text } from 'react-native';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { reportEntityService } from '../services/reportServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Report } from '../store/reportStore';
import { useTranslation } from 'react-i18next';

/**
 * ReportsScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function ReportsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation('common');

  return (
    <ListScreenContainer
      service={reportEntityService}
      config={{
        entityName: 'report',
        translationNamespace: 'reports',
        defaultPageSize: 10,
      }}
      renderItem={(item: Report) => (
        <Card
          style={{ marginBottom: 12 }}
          onPress={() => navigation.navigate('ReportDetail', { id: item.id, name: item.title || t('report') })}
        >
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.title || t('report')}</Text>
        </Card>
      )}
      keyExtractor={(item: Report) => String(item.id || Math.random())}
    />
  );
}


