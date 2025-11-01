import React from 'react';
import { Text, View } from 'react-native';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { expenseTypeEntityService } from '../services/expenseTypeServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { ExpenseType } from '../services/expenseTypeService';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { useTranslation } from 'react-i18next';

/**
 * ExpenseTypeListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function ExpenseTypeListScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { t } = useTranslation('expenses');

  return (
    <ListScreenContainer
      service={expenseTypeEntityService}
      config={{
        entityName: 'expenseType',
        translationNamespace: 'expenses',
        defaultPageSize: 10,
      }}
      renderItem={(item: ExpenseType) => (
        <Card
          style={{ marginBottom: 12 }}
          onPress={() => navigation.navigate('ExpenseTypeEdit', { expenseType: item })}
        >
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
        </Card>
      )}
      keyExtractor={(item: ExpenseType) => String(item.id)}
    />
  );
}
