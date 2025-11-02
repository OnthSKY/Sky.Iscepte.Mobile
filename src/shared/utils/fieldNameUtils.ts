/**
 * Field Name Utilities
 * Helper functions for field name generation and validation
 */

/**
 * Convert Turkish characters to ASCII equivalents for field names
 */
export function normalizeFieldName(text: string): string {
  const turkishMap: Record<string, string> = {
    'ğ': 'g',
    'Ğ': 'G',
    'ü': 'u',
    'Ü': 'U',
    'ş': 's',
    'Ş': 'S',
    'ı': 'i',
    'İ': 'I',
    'ö': 'o',
    'Ö': 'O',
    'ç': 'c',
    'Ç': 'C',
  };

  return text
    .split('')
    .map(char => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '_') // Replace non-alphanumeric with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
}

/**
 * Generate field name from label
 * Example: "Ürün Adı" -> "urun_adi"
 */
export function generateFieldName(label: string): string {
  return normalizeFieldName(label);
}

/**
 * Validate field name format
 */
export function isValidFieldName(name: string): boolean {
  // Must start with letter or underscore, contain only letters, numbers, underscores
  return /^[a-z_][a-z0-9_]*$/.test(name);
}

/**
 * Get field name example
 */
export function getFieldNameExample(): string {
  return 'urun_adi'; // Example: ürün_adı -> urun_adi
}

