import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import spacing from '../../core/constants/spacing';
import { useTheme } from '../../core/contexts/ThemeContext';
 

type Props = {
  children?: React.ReactNode;
  noPadding?: boolean;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  showBackButton?: boolean;
  footer?: React.ReactNode;
};

export default function ScreenLayout({
  children,
  noPadding,
  title,
  subtitle,
  headerRight,
  showBackButton,
  footer,
}: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors, !!noPadding);
  const navigation = useNavigation();
  const canGoBack = showBackButton && navigation.canGoBack();
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'top']}>
      <View style={styles.container}>
        {title ? (
          <View style={styles.header}>
            {canGoBack ? (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={24} color={colors.text} />
              </TouchableOpacity>
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
            </View>
            {headerRight ? <View style={{ marginLeft: spacing.md }}>{headerRight}</View> : null}
          </View>
        ) : null}
        <View style={styles.content}>{children}</View>
        {footer ? (
          <SafeAreaView edges={['bottom']} style={styles.footer}>
            {footer}
          </SafeAreaView>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, noPadding: boolean) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.page },
    container: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: spacing.md,
      marginBottom: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: noPadding ? 0 : spacing.lg,
    },
    backButton: {
      marginRight: spacing.md,
      padding: spacing.xs,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 14,
      color: colors.muted,
    },
    content: {
      flex: 1,
      width: '100%',
      alignSelf: 'center',
      // keep forms readable on larger screens
      maxWidth: 720,
      paddingHorizontal: noPadding ? 0 : spacing.lg,
    },
    footer: {
      padding: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      width: '100%',
      alignSelf: 'center',
      maxWidth: 720,
    },
  });


