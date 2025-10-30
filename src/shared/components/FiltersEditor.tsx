import React from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import spacing from '../../core/constants/spacing';
import colors from '../../core/constants/colors';

type Props = {
  value?: Record<string, string>;
  onChange?: (filters: Record<string, string> | undefined) => void;
  placeholderKey?: string;
  placeholderValue?: string;
};

export default function FiltersEditor({ value, onChange, placeholderKey = 'Alan', placeholderValue = 'Değer' }: Props) {
  const [keyText, setKeyText] = React.useState('');
  const [valText, setValText] = React.useState('');
  const filters = React.useMemo(() => ({ ...(value || {}) }), [value]);

  const add = () => {
    if (!keyText) return;
    const next = { ...filters } as Record<string, string>;
    next[keyText] = valText;
    onChange?.(next);
    setKeyText('');
    setValText('');
  };

  const remove = (k: string) => {
    const next = { ...filters } as Record<string, string>;
    delete next[k];
    onChange?.(Object.keys(next).length ? next : undefined);
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <TextInput
          value={keyText}
          onChangeText={setKeyText}
          placeholder={placeholderKey}
          style={{ flex: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
        />
        <TextInput
          value={valText}
          onChangeText={setValText}
          placeholder={placeholderValue}
          style={{ flex: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
        />
        <TouchableOpacity onPress={add} style={{ paddingHorizontal: spacing.md, justifyContent: 'center' }}>
          <Text style={{ color: colors.primary }}>Ekle</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {Object.entries(filters).map(([k, v]) => (
          <TouchableOpacity key={k} onPress={() => remove(k)} style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 6 }}>
            <Text>{k}: {v} ×</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}


