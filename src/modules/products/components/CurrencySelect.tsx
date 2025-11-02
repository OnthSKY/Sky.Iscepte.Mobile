import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import Modal from '../../../shared/components/Modal';
import { Currency } from '../services/productService';

type Props = {
  value?: Currency;
  onChange?: (value: Currency) => void;
  placeholder?: string;
};

const CURRENCIES: { label: string; value: Currency; symbol: string }[] = [
  { label: 'Türk Lirası', value: 'TRY', symbol: '₺' },
  { label: 'Dolar', value: 'USD', symbol: '$' },
  { label: 'Euro', value: 'EUR', symbol: '€' },
];

export default function CurrencySelect({ value, placeholder = 'Seçiniz', onChange }: Props) {
  const { t } = useTranslation('stock');
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const selected = CURRENCIES.find((c) => c.value === value);
  const selectedLabel = selected ? `${selected.symbol} ${selected.label}` : placeholder;
  const [open, setOpen] = useState(false);

  const handleBackPress = () => {
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
        <Text style={styles.text} numberOfLines={1}>{selectedLabel}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.muted} />
      </TouchableOpacity>
      
      <Modal visible={open} onRequestClose={handleBackPress}>
        <View style={styles.modalContent}>
          {/* Header with back button */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('currency', { defaultValue: 'Para Birimi' })}
            </Text>
            <View style={{ width: 32 }} />
          </View>

          <FlatList
            data={CURRENCIES}
            keyExtractor={(item) => item.value}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  onChange?.(item.value);
                  setOpen(false);
                }}
              >
                <Text style={[styles.currencyLabel, { color: colors.text }]}>
                  {item.symbol} {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {},
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: { color: colors.text, fontSize: 16, lineHeight: 22, flex: 1 },
  modalContent: {
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  itemContainer: {
    paddingVertical: spacing.md,
  },
  currencyLabel: {
    fontSize: 16,
  },
});
