import React from 'react';
import { View, Text } from 'react-native';
import spacing from '../../core/constants/spacing';

type Props = {
  label: string;
  control: React.ReactNode;
};

export default function FilterRow({ label, control }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Text style={{ width: 100, fontWeight: '500' }}>{label}</Text>
      <View style={{ flex: 1 }}>{control}</View>
    </View>
  );
}


