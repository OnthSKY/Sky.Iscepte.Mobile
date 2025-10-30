import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import DynamicForm, {
  DynamicField,
} from '../../../shared/components/DynamicForm';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import Select from '../../../shared/components/Select';
import expenseTypeService from '../services/expenseTypeService';
import useExpenseTypeStore from '../store/expenseTypeStore';

type Props = {
  navigation: any;
};

export default function ExpenseCreateScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { t: tExpenses } = useTranslation('expenses');
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const columns = width < 400 ? 1 : 2;

  const { items, setItems } = useExpenseTypeStore();
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentDate: '',
  });

  const loadTypes = async () => {
    setLoadingTypes(true);
    try {
      const res = await expenseTypeService.list();
      setItems(res.data);
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    loadTypes();
    const unsubscribe = navigation.addListener('focus', () => {
      loadTypes();
    });
    return unsubscribe;
  }, [navigation]);

  const options = useMemo(
    () => items.map((i) => ({ label: i.name, value: String(i.id) })),
    [items]
  );

  const handleSave = () => {
    // Save logic will be added
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderFooter = () => (
    <View style={{ flexDirection: 'row', gap: spacing.md }}>
      <Button
        title={t('cancel')}
        onPress={handleCancel}
        style={{ flex: 1, backgroundColor: colors.muted }}
      />
      <Button title={t('save')} onPress={handleSave} style={{ flex: 1 }} />
    </View>
  );

  return (
    <ScreenLayout
      title={tExpenses('new_expense')}
      showBackButton
      footer={renderFooter()}
      headerRight={
        <Button
          title={tExpenses('manage_expense_types')}
          onPress={() => navigation.navigate('ExpenseTypes')}
        />
      }
    >
      <ScrollView>
        <View style={{ gap: spacing.md, paddingBottom: spacing.lg }}>
          <Card>
            <DynamicForm
              namespace="expenses"
              columns={columns}
              fields={[
                {
                  name: 'type',
                  labelKey: 'type',
                  type: 'custom',
                  render: (value, onChange) => (
                    <Select
                      options={options}
                      value={String(value)}
                      onChange={(v) => onChange(v)}
                      placeholder={loadingTypes ? t('loading') : undefined}
                    />
                  ),
                  required: true,
                },
                { name: 'amount', labelKey: 'amount', type: 'number', required: true },
                { name: 'date', labelKey: 'date', type: 'date', required: true },
                { name: 'paymentDate', labelKey: 'payment_date', type: 'date' },
                { name: 'description', labelKey: 'description', type: 'textarea' },
              ] as DynamicField[]}
              values={formData}
              onChange={(v) => setFormData(v)}
            />
          </Card>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

