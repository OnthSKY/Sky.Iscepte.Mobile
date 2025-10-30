import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import spacing from '../../core/constants/spacing';
import { useTheme } from '../../core/contexts/ThemeContext';
 

type Props = {
  children?: React.ReactNode;
};

export default function ScreenLayout({ children }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.page },
  container: { flex: 1, padding: spacing.lg },
  
});


