import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import colors from '../../core/constants/colors';
import spacing from '../../core/constants/spacing';

type Props = {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
};

export default function SearchBar({ value, onChangeText, placeholder = 'Ara...' }: Props) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.input, focused && styles.inputFocused]}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputFocused: { borderColor: colors.primary },
});


