import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Button from '../../../shared/components/Button';
import { usePermissions } from '../../../core/hooks/usePermissions';
import { useAppStore } from '../../../store/useAppStore';
import PaginatedList from '../../../shared/components/PaginatedList';
import { employeeService } from '../services/employeeService';
import Card from '../../../shared/components/Card';
import { useTranslation } from 'react-i18next';
import SearchBar from '../../../shared/components/SearchBar';
import EmptyState from '../../../shared/components/EmptyState';
import FilterRow from '../../../shared/components/FilterRow';
import Select from '../../../shared/components/Select';

export default function EmployeeListScreen({ navigation }: any) {
  const { t } = useTranslation('common');
  const role = useAppStore(s => s.role);
  const { can } = usePermissions(role);
  const canEdit = useMemo(() => can('employees:edit'), [can]);
  const canCreate = useMemo(() => can('employees:create'), [can]);
  const [query, setQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('');
  return (
    <ScreenLayout>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '600' }}>{t('employees')}</Text>
          {canCreate ? <Button title={t('create')} onPress={() => navigation.navigate('EmployeeCreate')} /> : null}
        </View>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('search') as string} />
        <FilterRow
          label={t('role') as string}
          control={
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { label: t('all') as string, value: '' },
                { label: 'admin', value: 'admin' },
                { label: 'manager', value: 'manager' },
                { label: 'user', value: 'user' },
                { label: 'guest', value: 'guest' },
              ]}
            />
          }
        />
        <PaginatedList
          pageSize={10}
          query={{ searchValue: query, orderColumn: 'CreatedAt', orderDirection: 'DESC', filters: roleFilter ? { role: roleFilter } : undefined }}
          fetchPage={({ page, pageSize, query }) => employeeService.list({ page, pageSize, ...(query as any) })}
          keyExtractor={(item) => String((item as any).id)}
          renderItem={({ item }) => (
            <Card
              style={{ marginBottom: 12 }}
              onPress={() => navigation.navigate('EmployeeDetail', { id: item.id, name: (item as any).name, role: (item as any).role })}
            >
              <Text style={{ fontSize: 16, fontWeight: '500' }}>{(item as any).name}</Text>
              <Text>{(item as any).role}</Text>
            </Card>
          )}
          ListEmptyComponent={<EmptyState title={t('no_results') as string} subtitle={t('try_adjust_filters') as string} />}
        />
      </View>
    </ScreenLayout>
  );
}


