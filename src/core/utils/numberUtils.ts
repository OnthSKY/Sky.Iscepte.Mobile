export const formatCurrency = (value: number, currency: string = 'TRY', locale: string = 'tr-TR') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);

export const parseNumber = (text: string): number => {
  const normalized = text.replace(/[^0-9.,-]/g, '').replace(',', '.');
  return Number(normalized);
};


