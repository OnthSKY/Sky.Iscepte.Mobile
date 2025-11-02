import { Currency } from '../services/productService';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  TRY: 'Türk Lirası',
  USD: 'Dolar',
  EUR: 'Euro',
};

export function formatCurrency(amount: number, currency: Currency = 'TRY'): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${amount.toLocaleString()}`;
}

export function getCurrencySymbol(currency: Currency = 'TRY'): string {
  return CURRENCY_SYMBOLS[currency];
}
