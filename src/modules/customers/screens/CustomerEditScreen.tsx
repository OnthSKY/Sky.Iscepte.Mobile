/**
 * CustomerEditScreen - Wrapper for CustomerFormScreen with edit mode
 * Uses unified CustomerFormScreen
 */
import CustomerFormScreen from './CustomerFormScreen';

export default function CustomerEditScreen() {
  return <CustomerFormScreen mode="edit" />;
}

