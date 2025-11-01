/**
 * ExpenseTypeCreateScreen - Wrapper for ExpenseTypeFormScreen with create mode
 * Uses unified ExpenseTypeFormScreen
 */
import ExpenseTypeFormScreen from './ExpenseTypeFormScreen';

export default function ExpenseTypeCreateScreen() {
  return <ExpenseTypeFormScreen mode="create" />;
}
