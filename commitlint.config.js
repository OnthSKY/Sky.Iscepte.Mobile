/**
 * Commitlint Configuration
 *
 * NEDEN: Conventional commits standardı için
 * - Commit mesajlarının tutarlı olması
 * - Otomatik changelog oluşturma
 * - Semantic versioning ile uyumlu
 * - Ekip içi standart
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Commit mesaj formatı: type(scope): subject
    // Örnek: feat(auth): Add login functionality
    'type-enum': [
      2,
      'always',
      [
        'feat', // Yeni özellik
        'fix', // Bug fix
        'docs', // Dokümantasyon
        'style', // Formatting (kod değişikliği yok)
        'refactor', // Refactoring
        'perf', // Performance iyileştirme
        'test', // Test ekleme/düzeltme
        'build', // Build sistemi değişiklikleri
        'ci', // CI/CD değişiklikleri
        'chore', // Diğer değişiklikler
        'revert', // Revert commit
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']], // sentence-case'e izin ver
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
