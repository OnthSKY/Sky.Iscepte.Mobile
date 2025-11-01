import React from 'react';
import { Text } from 'react-native';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { expenseEntityService } from '../services/expenseServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Expense } from '../store/expenseStore';

/**
 * ExpenseListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function ExpenseListScreen() {
  const navigation = useNavigation<any>();

  return (
    <ListScreenContainer
      service={expenseEntityService}
      config={{
        entityName: 'expense',
        translationNamespace: 'expenses',
        defaultPageSize: 10,
      }}
      renderItem={(item: Expense) => (
        <Card
          style={{ marginBottom: 12 }}
          onPress={() => navigation.navigate('ExpenseDetail', { id: item.id, title: item.title, amount: item.amount })}
        >
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.title}</Text>
          <Text>{item.amount} ₺</Text>
        </Card>
      )}
      keyExtractor={(item: Expense) => String(item.id)}
    />
  );
}


