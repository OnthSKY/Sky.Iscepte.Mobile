import React from 'react';
import { Text } from 'react-native';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { salesEntityService } from '../services/salesServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Sale } from '../store/salesStore';

/**
 * SalesListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function SalesListScreen() {
  const navigation = useNavigation<any>();

  return (
    <ListScreenContainer
      service={salesEntityService}
      config={{
        entityName: 'sale',
        translationNamespace: 'sales',
        defaultPageSize: 10,
      }}
      renderItem={(item: Sale) => (
        <Card
          style={{ marginBottom: 12 }}
          onPress={() => navigation.navigate('SalesDetail', { id: item.id, title: item.title, amount: item.amount })}
        >
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.title || 'Sale'}</Text>
        </Card>
      )}
      keyExtractor={(item: Sale) => String(item.id)}
    />
  );
}


