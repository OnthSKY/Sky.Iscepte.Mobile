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

export default function SalesEditScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { t: tSales } = useTranslation('sales');

  const { id } = route.params;

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

  return (
    <ScreenLayout>
      <ScrollView>
        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>{tSales('edit_sale')}</Text>

          <Card>
            <View style={{ gap: spacing.md }}>
              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tSales('product_name')}
                </Text>
                <Input
                  value={formData.productName}
                  onChangeText={(text) => setFormData({ ...formData, productName: text })}
                  placeholder={tSales('product_name')}
                />
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tSales('category')}
                </Text>
                <Input
                  value={formData.category}
                  onChangeText={(text) => setFormData({ ...formData, category: text })}
                  placeholder={tSales('category')}
                />
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tSales('customer')}
                </Text>
                <Input
                  value={formData.customer}
                  onChangeText={(text) => setFormData({ ...formData, customer: text })}
                  placeholder={tSales('customer')}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                    {tSales('price')}
                  </Text>
                  <Input
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    placeholder={tSales('price')}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                    {tSales('quantity')}
                  </Text>
                  <Input
                    value={formData.quantity}
                    onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                    placeholder={tSales('quantity')}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View>
                <Text style={{ marginBottom: spacing.sm, fontWeight: '500' }}>
                  {tSales('payment_method')}
                </Text>
                <Input
                  value={formData.paymentMethod}
                  onChangeText={(text) => setFormData({ ...formData, paymentMethod: text })}
                  placeholder={tSales('payment_method')}
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

