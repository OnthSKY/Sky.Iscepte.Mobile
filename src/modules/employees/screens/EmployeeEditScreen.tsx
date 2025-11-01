/**
 * EmployeeEditScreen - Wrapper for EmployeeFormScreen with edit mode
 * Uses unified EmployeeFormScreen
 */
import EmployeeFormScreen from './EmployeeFormScreen';

export default function EmployeeEditScreen() {
  return <EmployeeFormScreen mode="edit" />;
}

