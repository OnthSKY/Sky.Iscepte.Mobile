/**
 * PurchaseCreateScreen - Wrapper for PurchaseFormScreen with create mode
 * Uses unified PurchaseFormScreen
 */
import PurchaseFormScreen from './PurchaseFormScreen';

export default function PurchaseCreateScreen() {
  return <PurchaseFormScreen mode="create" />;
}

