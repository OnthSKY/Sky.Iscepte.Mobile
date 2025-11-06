/**
 * EmptyState Component
 *
 * Single Responsibility: Displays empty state when no data is available
 *
 * Features:
 * - Customizable icon
 * - Title and description
 * - Optional action button
 * - Accessible
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../core/contexts/ThemeContext';
import { useLocalization } from '../../core/hooks/useLocalization';
import { createAccessibilityProps } from '../../core/utils/accessibility';

/**
 * EmptyState props
 */
export interface EmptyStateProps {
  /**
   * Icon name (Ionicons)
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Title text
   */
  title?: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Action button text
   */
  actionLabel?: string;

  /**
   * Action button handler
   */
  onAction?: () => void;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Show action button
   */
  showAction?: boolean;

  /**
   * Translation keys (for i18n)
   */
  translationKeys?: {
    title?: string;
    description?: string;
    action?: string;
  };
}

/**
 * EmptyState component
 * Displays empty state when no data is available
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="document-outline"
 *   title="No items found"
 *   description="Try adjusting your filters"
 *   actionLabel="Clear filters"
 *   onAction={() => clearFilters()}
 * />
 * ```
 */
export default function EmptyState({
  icon = 'document-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
  showAction = true,
  translationKeys,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const { t } = useLocalization();

  const finalTitle = translationKeys?.title ? t(translationKeys.title) : title;
  const finalDescription = translationKeys?.description
    ? t(translationKeys.description)
    : description;
  const finalActionLabel = translationKeys?.action ? t(translationKeys.action) : actionLabel;

  const a11yProps = createAccessibilityProps(finalTitle || 'Empty state', finalDescription, 'none');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]} {...a11yProps}>
      {icon && (
        <Ionicons
          name={icon}
          size={64}
          color={colors.muted}
          style={styles.icon}
          accessibilityRole="image"
          accessibilityLabel={icon}
        />
      )}

      {finalTitle && (
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          {finalTitle}
        </Text>
      )}

      {finalDescription && (
        <Text style={[styles.description, { color: colors.muted }]}>{finalDescription}</Text>
      )}

      {showAction && finalActionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={finalActionLabel}
        >
          <Text style={[styles.actionText, { color: colors.surface }]}>{finalActionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 200,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
