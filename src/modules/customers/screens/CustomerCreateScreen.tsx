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
};

export default function CustomerCreateScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { t: tCustomers } = useTranslation('customers');
  const { colors } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    debtLimit: '',
    group: '',
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
    <ScreenLayout title={tCustomers('new_customer')} showBackButton footer={renderFooter()}>
      <ScrollView>
        <View style={{ gap: spacing.md, paddingBottom: spacing.lg }}>
          <Card>
            <DynamicForm
              namespace="customers"
              columns={2}
              fields={[
                { name: 'name', labelKey: 'name', type: 'text', required: true },
                { name: 'phone', labelKey: 'phone', type: 'text' },
                { name: 'email', labelKey: 'email', type: 'text' },
                { name: 'debtLimit', labelKey: 'debt_limit', type: 'number' },
                { name: 'group', labelKey: 'group', type: 'text' },
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

