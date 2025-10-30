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

export default function EmployeeEditScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { t: tSettings } = useTranslation('settings');

  const { id } = route.params;

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

  return (
    <ScreenLayout>
      <ScrollView>
        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>
            {tSettings('edit_employee')}
          </Text>

          <Card>
            <View style={{ gap: spacing.md }}>
              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>{t('name')}</Text>
                <Input
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder={t('name')}
                />
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>{t('email')}</Text>
                <Input
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder={t('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>{t('phone')}</Text>
                <Input
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder={t('phone')}
                  keyboardType="phone-pad"
                />
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tSettings('role')}
                </Text>
                <Input
                  value={formData.role}
                  onChangeText={(text) => setFormData({ ...formData, role: text })}
                  placeholder={tSettings('role')}
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

