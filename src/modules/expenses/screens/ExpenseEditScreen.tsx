/**
 * ExpenseEditScreen - Wrapper for ExpenseFormScreen with edit mode
 * Uses unified ExpenseFormScreen
 */
import ExpenseFormScreen from './ExpenseFormScreen';

export default function ExpenseEditScreen() {
  return <ExpenseFormScreen mode="edit" />;
}

