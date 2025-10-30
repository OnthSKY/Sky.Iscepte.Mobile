import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';

export default function ProductEditScreen() {
  const { t } = useTranslation(['products']);
  return (
    <ScreenLayout title={t('products:edit_product', { defaultValue: 'Ürünü düzenle' })}>
      <View style={{ padding: 16 }}>
        <Text>{t('products:edit_form_placeholder', { defaultValue: 'Ürün düzenleme formu buraya gelecek.' })}</Text>
      </View>
    </ScreenLayout>
  );
}


