import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import colors from '../../../core/constants/colors';
import spacing from '../../../core/constants/spacing';

type Props = {
  route: {
    params: {
      id: string;
    };
  };
  navigation: any;
};

export default function ExpenseEditScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { t: tExpenses } = useTranslation('expenses');

  const { id } = route.params;

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

  return (
    <ScreenLayout>
      <ScrollView>
        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>
            {tExpenses('edit_expense')}
          </Text>

          <Card>
            <View style={{ gap: spacing.md }}>
              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tExpenses('type')}
                </Text>
                <Input
                  value={formData.type}
                  onChangeText={(text) => setFormData({ ...formData, type: text })}
                  placeholder={tExpenses('type')}
                />
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tExpenses('amount')}
                </Text>
                <Input
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                  placeholder={tExpenses('amount')}
                  keyboardType="numeric"
                />
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tExpenses('date')}
                </Text>
                <Input
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder={tExpenses('date')}
                />
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tExpenses('payment_date')}
                </Text>
                <Input
                  value={formData.paymentDate}
                  onChangeText={(text) => setFormData({ ...formData, paymentDate: text })}
                  placeholder={tExpenses('payment_date')}
                />
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tExpenses('description')}
                </Text>
                <Input
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder={tExpenses('description')}
                  multiline
                  numberOfLines={4}
                  style={{ textAlignVertical: 'top' }}
                />
              </View>
            </View>
          </Card>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Button
              title={t('cancel')}
              onPress={handleCancel}
              style={{ flex: 1, backgroundColor: colors.muted }}
            />
            <Button
              title={t('save')}
              onPress={handleSave}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

