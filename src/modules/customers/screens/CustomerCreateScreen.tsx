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
  navigation: any;
};

export default function CustomerCreateScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { t: tCustomers } = useTranslation('customers');

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

  return (
    <ScreenLayout>
      <ScrollView>
        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>
            {tCustomers('new_customer')}
          </Text>

          <Card>
            <View style={{ gap: spacing.md }}>
              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tCustomers('name')}
                </Text>
                <Input
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder={tCustomers('name')}
                />
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tCustomers('phone')}
                </Text>
                <Input
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder={tCustomers('phone')}
                  keyboardType="phone-pad"
                />
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tCustomers('email')}
                </Text>
                <Input
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder={tCustomers('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tCustomers('debt_limit')}
                </Text>
                <Input
                  value={formData.debtLimit}
                  onChangeText={(text) => setFormData({ ...formData, debtLimit: text })}
                  placeholder={tCustomers('debt_limit')}
                  keyboardType="numeric"
                />
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tCustomers('group')}
                </Text>
                <Input
                  value={formData.group}
                  onChangeText={(text) => setFormData({ ...formData, group: text })}
                  placeholder={tCustomers('group')}
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

