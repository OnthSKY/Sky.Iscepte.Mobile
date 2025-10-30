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

export default function EmployeeEditScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { employee } = route.params;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
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
    <ScreenLayout title={t('settings:edit_employee')} showBackButton footer={renderFooter()}>
      <ScrollView>
        <View style={{ gap: spacing.md, paddingBottom: spacing.lg }}>
          <Card>
            <DynamicForm
              namespace="employees"
              columns={2}
              fields={[
                { name: 'name', labelKey: 'name', type: 'text', required: true },
                { name: 'email', labelKey: 'email', type: 'text' },
                { name: 'phone', labelKey: 'phone', type: 'text' },
                { name: 'role', labelKey: 'role', type: 'text' },
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

