import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';

export default function ProductCreateScreen() {
  const { t } = useTranslation(['products']);
  return (
    <ScreenLayout title={t('products:new_product', { defaultValue: 'Yeni ürün' })}>
      <View style={{ padding: 16 }}>
        <Text>{t('products:create_form_placeholder', { defaultValue: 'Ürün oluşturma formu buraya gelecek.' })}</Text>
      </View>
    </ScreenLayout>
  );
}


