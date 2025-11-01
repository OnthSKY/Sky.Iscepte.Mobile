/**
 * EmployeeCreateScreen - Wrapper for EmployeeFormScreen with create mode
 * Uses unified EmployeeFormScreen
 */
import EmployeeFormScreen from './EmployeeFormScreen';

export default function EmployeeCreateScreen() {
  return <EmployeeFormScreen mode="create" />;
}

