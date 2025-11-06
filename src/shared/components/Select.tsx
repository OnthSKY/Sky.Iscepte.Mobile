import React, { useMemo, useState, memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import Modal from './Modal';

type Option = { label: string; value: string };

type Props = {
  value?: string;
  options: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  label?: string;
};

const Select = memo<Props>(function Select({ value, options, placeholder = 'Seçiniz', onChange, disabled = false, label }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const selected = useMemo(() => options.find((o) => o.value === value)?.label || placeholder, [options, value, placeholder]);
  const [open, setOpen] = useState(false);
  const data = useMemo(() => options, [options]);
  
  const handleOpen = useCallback(() => {
    if (!disabled) {
      setOpen(true);
    }
  }, [disabled]);
  
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);
  
  const handleSelect = useCallback((itemValue: string) => {
    onChange?.(itemValue);
    setOpen(false);
  }, [onChange]);
  
  const renderItem = useCallback(({ item }: { item: Option }) => (
    <TouchableOpacity
      style={{ paddingVertical: spacing.md }}
      onPress={() => handleSelect(item.value)}
    >
      <Text style={{ color: colors.text }}>{item.label}</Text>
    </TouchableOpacity>
  ), [colors.text, handleSelect]);
  
  const keyExtractor = useCallback((item: Option) => String(item.value), []);
  
  const ItemSeparator = useCallback(() => (
    <View style={{ height: 1, backgroundColor: colors.border }} />
  ), [colors.border]);
  
  return (
    <View style={styles.container}>
      {label && (
        <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: spacing.xs, color: colors.text }}>
          {label}
        </Text>
      )}
      <TouchableOpacity 
        style={[styles.button, disabled && { opacity: 0.5 }]} 
        onPress={handleOpen}
        disabled={disabled}
      >
        <Text style={styles.text} numberOfLines={1}>{selected}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.muted} />
      </TouchableOpacity>
      <Modal visible={open} onRequestClose={handleClose}>
        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparator}
          renderItem={renderItem}
        />
      </Modal>
    </View>
  );
});

export default Select;

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
});


