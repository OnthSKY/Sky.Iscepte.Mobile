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

export default function SalesEditScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { t: tSales } = useTranslation('sales');
  const { colors } = useTheme();
  const { sale } = route.params;

  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    customer: '',
    price: '',
    quantity: '1',
    paymentMethod: '',
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
    <ScreenLayout title={tSales('edit_sale')} showBackButton footer={renderFooter()}>
      <ScrollView>
        <View style={{ gap: spacing.md, paddingBottom: spacing.lg }}>
          <Card>
            <DynamicForm
              namespace="sales"
              columns={2}
              fields={[
                { name: 'productName', labelKey: 'product_name', type: 'text', required: true },
                { name: 'category', labelKey: 'category', type: 'text' },
                { name: 'customer', labelKey: 'customer', type: 'text' },
                { name: 'price', labelKey: 'price', type: 'number' },
                { name: 'quantity', labelKey: 'quantity', type: 'number' },
                { name: 'paymentMethod', labelKey: 'payment_method', type: 'text' },
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

