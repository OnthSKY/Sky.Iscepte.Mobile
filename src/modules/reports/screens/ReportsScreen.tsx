import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Button from '../../../shared/components/Button';
import { usePermissions } from '../../../core/hooks/usePermissions';
import { useAppStore } from '../../../store/useAppStore';
import { useTranslation } from 'react-i18next';
import PaginatedList from '../../../shared/components/PaginatedList';
import { reportService } from '../services/reportService';
import Card from '../../../shared/components/Card';
import SearchBar from '../../../shared/components/SearchBar';
import EmptyState from '../../../shared/components/EmptyState';

export default function ReportsScreen({ navigation }: any) {
  const { t } = useTranslation('common');
  const role = useAppStore(s => s.role);
  const { can } = usePermissions(role);
  const canView = useMemo(() => can('reports:view'), [can]);
  const [query, setQuery] = React.useState('');
  return (
    <ScreenLayout>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '600' }}>{t('reports')}</Text>
          {canView ? <Button title={t('generate_report')} onPress={() => {}} /> : null}
        </View>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('search') as string} />
        <PaginatedList
          pageSize={10}
          query={{ searchValue: query, orderColumn: 'CreatedAt', orderDirection: 'DESC' }}
          fetchPage={({ page, pageSize, query }) => reportService.list({ page, pageSize, ...(query as any) })}
          keyExtractor={(item) => String((item as any).id || Math.random())}
          renderItem={({ item }) => (
            <Card
              style={{ marginBottom: 12 }}
              onPress={() => navigation.navigate('ReportDetail', { id: item.id, name: (item as any).title || t('report') })}
            >
              <Text style={{ fontSize: 16, fontWeight: '500' }}>{(item as any).title || t('report')}</Text>
            </Card>
          )}
          ListEmptyComponent={<EmptyState title={t('no_results') as string} subtitle={t('try_adjust_filters') as string} />}
        />
      </View>
    </ScreenLayout>
  );
}


