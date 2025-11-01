/**
 * CustomerCreateScreen - Wrapper for CustomerFormScreen with create mode
 * Uses unified CustomerFormScreen
 */
import CustomerFormScreen from './CustomerFormScreen';

export default function CustomerCreateScreen() {
  return <CustomerFormScreen mode="create" />;
}

