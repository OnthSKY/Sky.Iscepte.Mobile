/**
 * PurchaseEditScreen - Wrapper for PurchaseFormScreen with edit mode
 * Uses unified PurchaseFormScreen
 */
import PurchaseFormScreen from './PurchaseFormScreen';

export default function PurchaseEditScreen() {
  return <PurchaseFormScreen mode="edit" />;
}

