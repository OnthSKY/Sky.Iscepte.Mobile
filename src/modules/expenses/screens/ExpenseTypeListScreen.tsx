import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import expenseTypeService, { ExpenseType } from '../services/expenseTypeService';
import useExpenseTypeStore from '../store/expenseTypeStore';

type Props = {
  navigation: any;
};

export default function ExpenseTypeListScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { t: tExpenses } = useTranslation('expenses');
  const { colors } = useTheme();
  const { items, stats, setItems, setStats } = useExpenseTypeStore();
  const [pendingDelete, setPendingDelete] = useState<ExpenseType | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        expenseTypeService.list(),
        expenseTypeService.stats(),
      ]);
      setItems(listRes.data);
      setStats(statsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = () => {
    navigation.navigate('ExpenseTypeCreate');
  };

  const handleEdit = (expenseType: ExpenseType) => {
    navigation.navigate('ExpenseTypeEdit', { expenseType });
  };

  const handleDelete = async (item: ExpenseType) => {
    setPendingDelete(item);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const toDelete = pendingDelete;
    setPendingDelete(null);
    // optimistic update
    const prev = items;
    setItems(items.filter((i) => i.id !== toDelete.id));
    try {
      await expenseTypeService.remove(toDelete.id);
      await load();
    } catch (e) {
      setItems(prev);
    }
  };

  const headerRight = (
    <Button title={tExpenses('new_expense_type')} onPress={handleCreate} />
  );

  const renderItem = ({ item }: { item: ExpenseType }) => (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text>{item.name}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button title={t('edit')} onPress={() => handleEdit(item)} />
          <Button title={t('delete')} onPress={() => handleDelete(item)} style={{ backgroundColor: colors.danger }} />
        </View>
      </View>
    </Card>
  );

  return (
    <ScreenLayout title={tExpenses('expense_types')} showBackButton headerRight={headerRight}>
      <View style={{ gap: spacing.md, flex: 1, paddingBottom: spacing.lg }}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: colors.muted }}>{tExpenses('expense_types')}</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{stats?.totalTypes ?? 0}</Text>
            </View>
            <View>
              <Text style={{ color: colors.muted }}>{t('total')}</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{stats?.totalExpenseAmount?.toLocaleString?.() ?? '0'}</Text>
            </View>
          </View>
        </Card>

        <FlatList
          data={items}
          refreshing={loading}
          onRefresh={load}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: spacing.md }}
        />
      </View>

      <ConfirmDialog
        visible={!!pendingDelete}
        title={t('are_you_sure')}
        description={t('this_action_cannot_be_undone')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </ScreenLayout>
  );
}
