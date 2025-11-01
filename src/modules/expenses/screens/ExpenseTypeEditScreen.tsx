/**
 * ExpenseTypeEditScreen - Wrapper for ExpenseTypeFormScreen with edit mode
 * Uses unified ExpenseTypeFormScreen
 */
import ExpenseTypeFormScreen from './ExpenseTypeFormScreen';

export default function ExpenseTypeEditScreen() {
  return <ExpenseTypeFormScreen mode="edit" />;
}
