/**
 * ExpenseCreateScreen - Wrapper for ExpenseFormScreen with create mode
 * Uses unified ExpenseFormScreen
 */
import ExpenseFormScreen from './ExpenseFormScreen';

export default function ExpenseCreateScreen() {
  return <ExpenseFormScreen mode="create" />;
}

