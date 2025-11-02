/**
 * DetailSection Component
 * 
 * Single Responsibility: Groups related detail fields in a card
 * Responsive: Adapts layout to screen size
 */

import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Card from './Card';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import { isSmallScreen } from '../../core/constants/breakpoints';
import DetailField from './DetailField';

interface DetailSectionProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  fields?: Array<{
    label: string;
    value: string | number | undefined | null;
    formatValue?: (value: any) => string;
    icon?: string;
    onPress?: () => void;
  }>;
  gridColumns?: 1 | 2;
}

export default function DetailSection({ 
  title, 
  subtitle, 
  children,
  fields,
  gridColumns = 1
}: DetailSectionProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isSmall = isSmallScreen(width);
  const styles = getStyles(colors, isSmall);

  const effectiveColumns = isSmall ? 1 : gridColumns;

  const renderContent = () => {
    if (fields && fields.length > 0) {
      if (effectiveColumns === 2) {
        // Grid layout for 2 columns
        const rows: typeof fields[] = [];
        for (let i = 0; i < fields.length; i += 2) {
          rows.push(fields.slice(i, i + 2));
        }
        
        return (
          <View style={styles.gridContainer}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {row.map((field, fieldIndex) => (
                  <View key={fieldIndex} style={styles.gridItem}>
                    <DetailField
                      label={field.label}
                      value={field.value}
                      formatValue={field.formatValue}
                      icon={field.icon}
                      onPress={field.onPress}
                    />
                  </View>
                ))}
                {row.length === 1 && <View style={styles.gridItem} />}
              </View>
            ))}
          </View>
        );
      }
      
      // Single column layout
      return (
        <View style={styles.fieldsContainer}>
          {fields.map((field, index) => (
            <DetailField
              key={index}
              label={field.label}
              value={field.value}
              formatValue={field.formatValue}
              icon={field.icon}
              onPress={field.onPress}
            />
          ))}
        </View>
      );
    }

    return children;
  };

  return (
    <Card style={styles.card}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      )}
      {renderContent()}
    </Card>
  );
}

const getStyles = (colors: any, isSmall: boolean) => StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: isSmall ? 18 : 20,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.text, // Ensure text color is always visible
  },
  subtitle: {
    fontSize: isSmall ? 13 : 14,
    color: colors.muted,
  },
  fieldsContainer: {
    gap: 0,
  },
  gridContainer: {
    gap: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  gridItem: {
    flex: 1,
  },
});

