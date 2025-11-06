/**
 * lint-staged Configuration
 *
 * NEDEN: Sadece değişen dosyaları lint/format'lamak için
 * - Commit süresini hızlandırır
 * - Sadece değişen dosyalar kontrol edilir
 * - Daha hızlı pre-commit hook'ları
 */

module.exports = {
  // TypeScript/JavaScript dosyaları
  // NEDEN: Sadece değişen dosyaları lint/format'lamak commit süresini hızlandırır
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix', // ESLint otomatik düzeltme
    'prettier --write', // Prettier formatlama
  ],

  // JSON, Markdown, YAML dosyaları
  '*.{json,md,yml,yaml}': [
    'prettier --write', // Prettier formatlama
  ],

  // Not: Type checking commit sırasında çok yavaş olabilir
  // Manuel olarak `npm run type-check` çalıştırılabilir veya CI'da yapılabilir
};
