import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import DynamicForm, { DynamicField } from '../../../shared/components/DynamicForm';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';

type Props = {
  navigation: any;
  route: any;
};

export default function ExpenseEditScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { t: tExpenses } = useTranslation('expenses');
  const { colors } = useTheme();
  const { expense } = route.params;

  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    description: '',
    date: '',
    paymentDate: '',
  });

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
    <ScreenLayout title={tExpenses('edit_expense')} showBackButton footer={renderFooter()}>
      <ScrollView>
        <View style={{ gap: spacing.md, paddingBottom: spacing.lg }}>
          <Card>
            <DynamicForm
              namespace="expenses"
              columns={2}
              fields={[
                { name: 'type', labelKey: 'type', type: 'text', required: true },
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

