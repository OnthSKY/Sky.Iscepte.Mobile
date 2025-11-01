import React from 'react';
import { Text } from 'react-native';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { customerEntityService } from '../services/customerServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Customer } from '../store/customerStore';

/**
 * CustomerListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function CustomerListScreen() {
  const navigation = useNavigation<any>();

  return (
    <ListScreenContainer
      service={customerEntityService}
      config={{
        entityName: 'customer',
        translationNamespace: 'customers',
        defaultPageSize: 10,
      }}
      renderItem={(item: Customer) => (
        <Card
          style={{ marginBottom: 12 }}
          onPress={() => navigation.navigate('CustomerDetail', { id: item.id, name: item.name })}
        >
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
        </Card>
      )}
      keyExtractor={(item: Customer) => String(item.id)}
    />
  );
}


