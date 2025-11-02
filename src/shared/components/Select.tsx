import React, { useMemo, useState } from 'react';
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

export default function Select({ value, options, placeholder = 'Seçiniz', onChange, disabled = false, label }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const selected = options.find((o) => o.value === value)?.label || placeholder;
  const [open, setOpen] = useState(false);
  const data = useMemo(() => options, [options]);
  return (
    <View style={styles.container}>
      {label && (
        <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: spacing.xs, color: colors.text }}>
          {label}
        </Text>
      )}
      <TouchableOpacity 
        style={[styles.button, disabled && { opacity: 0.5 }]} 
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
      >
        <Text style={styles.text} numberOfLines={1}>{selected}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.muted} />
      </TouchableOpacity>
      <Modal visible={open} onRequestClose={() => setOpen(false)}>
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.value)}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ paddingVertical: spacing.md }}
              onPress={() => {
                onChange?.(item.value);
                setOpen(false);
              }}
            >
              <Text style={{ color: colors.text }}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
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
});


