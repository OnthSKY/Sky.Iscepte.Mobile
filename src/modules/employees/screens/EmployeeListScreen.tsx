import React from 'react';
import { Text } from 'react-native';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { employeeEntityService } from '../services/employeeServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Employee } from '../store/employeeStore';

/**
 * EmployeeListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function EmployeeListScreen() {
  const navigation = useNavigation<any>();

  return (
    <ListScreenContainer
      service={employeeEntityService}
      config={{
        entityName: 'employee',
        translationNamespace: 'employees',
        defaultPageSize: 10,
      }}
      renderItem={(item: Employee) => (
        <Card
          style={{ marginBottom: 12 }}
          onPress={() => navigation.navigate('EmployeeDetail', { id: item.id, name: item.name, role: item.role })}
        >
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
          <Text>{item.role}</Text>
        </Card>
      )}
      keyExtractor={(item: Employee) => String(item.id)}
    />
  );
}


