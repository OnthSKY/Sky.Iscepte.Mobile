/**
 * Stock validation utilities
 * Helper functions for checking stock availability
 */

import { Product } from '../services/productService';

/**
 * Checks if stock tracking should be performed for a product
 * @param product - The product to check
 * @returns true if stock should be tracked, false otherwise
 */
export function shouldTrackStock(product: Product | null | undefined): boolean {
  if (!product) return false;
  
  // If trackStock is explicitly false, don't track stock
  if (product.trackStock === false) return false;
  
  // If stock is null or undefined, don't track stock (backward compatibility)
  if (product.stock === null || product.stock === undefined) return false;
  
  // Otherwise, track stock (default behavior)
  return true;
}

/**
 * Checks if a quantity can be sold for a product
 * @param product - The product to check
 * @param quantity - The quantity to check
 * @returns true if the quantity can be sold, false otherwise
 */
export function canSellQuantity(product: Product | null | undefined, quantity: number): boolean {
  if (!shouldTrackStock(product)) return true;
  
  const stock = product?.stock || 0;
  return quantity <= stock;
}

/**
 * Gets the available stock for a product (returns null if stock tracking is disabled)
 * @param product - The product to check
 * @returns The available stock, or null if stock tracking is disabled
 */
export function getAvailableStock(product: Product | null | undefined): number | null {
  if (!shouldTrackStock(product)) return null;
  return product?.stock ?? 0;
}

