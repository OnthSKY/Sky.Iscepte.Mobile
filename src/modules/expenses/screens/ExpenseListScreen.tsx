import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Button from '../../../shared/components/Button';
import { usePermissions } from '../../../core/hooks/usePermissions';
import { useAppStore } from '../../../store/useAppStore';
import PaginatedList from '../../../shared/components/PaginatedList';
import { expenseService } from '../services/expenseService';
import Card from '../../../shared/components/Card';
import { useTranslation } from 'react-i18next';
import SearchBar from '../../../shared/components/SearchBar';
import EmptyState from '../../../shared/components/EmptyState';
import FiltersEditor from '../../../shared/components/FiltersEditor';

export default function ExpenseListScreen({ navigation }: any) {
  const { t } = useTranslation('common');
  const role = useAppStore(s => s.role);
  const { can } = usePermissions(role);
  const canCreate = useMemo(() => can('expenses:create'), [can]);
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string> | undefined>();
  return (
    <ScreenLayout>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '600' }}>{t('expenses')}</Text>
          {canCreate ? <Button title={t('create')} onPress={() => navigation.navigate('ExpenseCreate')} /> : null}
        </View>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('search') as string} />
        <FiltersEditor value={filters} onChange={setFilters} />
        <PaginatedList
          pageSize={10}
          query={{ searchValue: query, orderColumn: 'CreatedAt', orderDirection: 'DESC', filters }}
          fetchPage={({ page, pageSize, query }) => expenseService.list({ page, pageSize, ...(query as any) })}
          keyExtractor={(item) => String((item as any).id)}
          renderItem={({ item }) => (
            <Card
              style={{ marginBottom: 12 }}
              onPress={() => navigation.navigate('ExpenseDetail', { id: item.id, title: (item as any).title, amount: (item as any).amount })}
            >
              <Text style={{ fontSize: 16, fontWeight: '500' }}>{(item as any).title}</Text>
              <Text>{(item as any).amount}</Text>
            </Card>
          )}
          ListEmptyComponent={<EmptyState title={t('no_results') as string} subtitle={t('try_adjust_filters') as string} />}
        />
      </View>
    </ScreenLayout>
  );
}


