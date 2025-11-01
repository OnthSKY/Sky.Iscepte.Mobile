import React from 'react';
import { View, Text } from 'react-native';
import { DetailScreenContainer } from '../../../shared/components/screens/DetailScreenContainer';
import { customerEntityService } from '../services/customerServiceAdapter';
import Card from '../../../shared/components/Card';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { Customer } from '../store/customerStore';

/**
 * CustomerDetailScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes detail screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function CustomerDetailScreen() {
  const { colors } = useTheme();

  return (
    <DetailScreenContainer
      service={customerEntityService}
      config={{
        entityName: 'customer',
        translationNamespace: 'customers',
      }}
      renderContent={(data: Customer) => (
        <View style={{ gap: spacing.md }}>
          <Card>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  Name
                </Text>
                <Text style={{ fontSize: 16 }}>{data.name || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  ID
                </Text>
                <Text style={{ fontSize: 16 }}>{data.id || '-'}</Text>
              </View>
            </View>
          </Card>
        </View>
      )}
    />
  );
}

