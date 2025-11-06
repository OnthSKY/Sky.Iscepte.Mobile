# Git Hooks Kullanım Kılavuzu

## 🔧 Neden Git Hooks?

### Sorunlar (Önceki Durum)

- ❌ Commit'lerde lint hataları olabiliyordu
- ❌ Format tutarsızlıkları
- ❌ Commit mesajları tutarsız
- ❌ Kod kalitesi kontrolü manuel

### Çözüm (Git Hooks)

- ✅ Pre-commit hook: Otomatik lint/format kontrolü
- ✅ Commit-msg hook: Commit mesajı format kontrolü
- ✅ Sadece değişen dosyalar kontrol edilir (hızlı)
- ✅ Hata varsa commit engellenir

## 📋 Kurulum

### 1. Husky

Husky Git hook'larını yönetir.

**NEDEN:**

- Git hook'larını kolay yönetmek için
- Ekip üyeleri için otomatik kurulum
- Cross-platform çalışır

### 2. lint-staged

Sadece değişen dosyaları lint/format'lar.

**NEDEN:**

- Tüm dosyaları kontrol etmek yavaş
- Sadece değişen dosyalar yeterli
- Commit süresini hızlandırır

### 3. Commitlint

Commit mesajı formatını kontrol eder.

**NEDEN:**

- Conventional commits standardı
- Tutarlı commit mesajları
- Otomatik changelog için gerekli

## 🚀 Kullanım

### Pre-commit Hook

Her commit öncesi otomatik çalışır:

```bash
git commit -m "feat: Add new feature"
```

**Ne yapar:**

1. Değişen dosyaları tespit eder
2. ESLint kontrolü yapar (otomatik düzeltme)
3. Prettier formatlama yapar
4. Hata varsa commit engellenir

**Örnek çıktı:**

```
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
```

### Commit-msg Hook

Commit mesajı formatını kontrol eder:

**Geçerli format:**

```bash
feat(auth): Add login functionality
fix(api): Resolve token refresh issue
docs(readme): Update installation guide
```

**Geçersiz format (commit engellenir):**

```bash
# Hata: type yok
Add login functionality

# Hata: type büyük harf
FEAT: Add login

# Hata: subject çok uzun
feat: Add a very long commit message that exceeds the maximum length limit
```

## 📝 Commit Mesaj Formatı

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type'lar

- `feat`: Yeni özellik
- `fix`: Bug fix
- `docs`: Dokümantasyon
- `style`: Formatting (kod değişikliği yok)
- `refactor`: Refactoring
- `perf`: Performance iyileştirme
- `test`: Test ekleme/düzeltme
- `build`: Build sistemi değişiklikleri
- `ci`: CI/CD değişiklikleri
- `chore`: Diğer değişiklikler
- `revert`: Revert commit

### Örnekler

```bash
# Basit
feat: Add user authentication

# Scope ile
feat(auth): Add login functionality

# Body ile
feat(api): Add user endpoint

Add GET /api/users endpoint with pagination support

# Breaking change
feat(api)!: Change authentication method

BREAKING CHANGE: JWT tokens now required for all requests
```

## ⚙️ Yapılandırma

### lint-staged

`.lintstagedrc.js` dosyasında:

```javascript
module.exports = {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md}': ['prettier --write'],
};
```

### Commitlint

`commitlint.config.js` dosyasında:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
  },
};
```

## 🔍 Troubleshooting

### Problem: Pre-commit hook çalışmıyor

**Çözüm:**

```bash
# Husky'yi yeniden kur
npm run prepare

# Hook dosyalarının executable olduğundan emin ol (Linux/Mac)
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### Problem: Commit çok yavaş

**Çözüm:**

- lint-staged sadece değişen dosyaları kontrol eder
- Eğer hala yavaşsa, `.lintstagedrc.js`'de type-check'i kaldırın

### Problem: Commit mesajı reddediliyor

**Çözüm:**

- Commit mesaj formatını kontrol edin
- `commitlint.config.js` kurallarına uyun
- Örnek: `feat: Add feature` formatını kullanın

## 🎯 Best Practices

1. **Küçük commit'ler**
   - Her commit tek bir değişiklik içermeli
   - Daha kolay review ve rollback

2. **Anlamlı mesajlar**
   - Ne yapıldığını açıkça belirtin
   - Neden yapıldığını body'de açıklayın

3. **Type doğru kullanımı**
   - `feat`: Yeni özellik
   - `fix`: Bug düzeltme
   - `refactor`: Kod iyileştirme

4. **Scope kullanımı**
   - Modül veya component adı
   - Örnek: `feat(auth)`, `fix(api)`

## 📚 İlgili Dosyalar

- `.husky/pre-commit` - Pre-commit hook
- `.husky/commit-msg` - Commit-msg hook
- `.lintstagedrc.js` - lint-staged yapılandırması
- `commitlint.config.js` - Commitlint yapılandırması

---

**Not:** Git hook'ları commit sürecini biraz yavaşlatabilir ama kod kalitesini önemli ölçüde artırır.
