import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';

type Props = {
  navigation: any;
};

export default function ExpenseTypeCreateScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { t: tExpenses } = useTranslation('expenses');
  const { colors } = useTheme();

  const [name, setName] = useState('');

  const handleSave = () => {
    // Save logic will be added
    console.log('Expense Type Name:', name);
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
      title={tExpenses('new_expense_type')}
      showBackButton
      footer={renderFooter()}
    >
      <ScrollView>
        <View style={{ gap: spacing.md, paddingBottom: spacing.lg }}>
          <Card>
            <View style={{ gap: spacing.md }}>
              <Input
                label={tExpenses('expense_type_name')}
                value={name}
                onChangeText={setName}
                placeholder={tExpenses('expense_type_name_placeholder')}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
