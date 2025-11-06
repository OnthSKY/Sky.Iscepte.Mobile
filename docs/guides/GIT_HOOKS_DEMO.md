# Git Hooks Nasıl Çalışır? - Demo

## 🎯 Özet

Git hook'ları commit sürecini otomatik kontrol eder:

1. **Pre-commit Hook**: Commit öncesi kod kalitesi kontrolü
2. **Commit-msg Hook**: Commit mesajı formatı kontrolü

## 📋 Adım Adım Nasıl Çalışır?

### 1. Pre-commit Hook (Otomatik Lint/Format)

**Ne zaman çalışır?**

- Her `git commit` komutundan önce otomatik çalışır

**Ne yapar?**

```bash
git commit -m "feat: Add new feature"
```

**Çıktı:**

```
[STARTED] Backing up original state...
[COMPLETED] Backed up original state in git stash
[STARTED] Running tasks for staged files...
[STARTED] *.{ts,tsx,js,jsx} — 2 files
[STARTED] eslint --fix
[COMPLETED] eslint --fix
[STARTED] prettier --write
[COMPLETED] prettier --write
[COMPLETED] *.{ts,tsx,js,jsx} — 2 files
[COMPLETED] Running tasks for staged files...
[STARTED] Applying modifications from tasks...
[COMPLETED] Applying modifications from tasks...
[COMPLETED] Cleaning up temporary files...
```

**Sonuç:**

- ✅ Değişen dosyalar otomatik lint edildi (ESLint)
- ✅ Değişen dosyalar otomatik formatlandı (Prettier)
- ✅ Hata varsa commit engellenir
- ✅ Hata yoksa commit devam eder

### 2. Commit-msg Hook (Commit Mesajı Formatı)

**Ne zaman çalışır?**

- Commit mesajı yazıldıktan sonra, commit tamamlanmadan önce

**Geçerli Format:**

```bash
git commit -m "feat: add new feature"
git commit -m "fix(auth): resolve login issue"
git commit -m "docs: update readme"
```

**Geçersiz Format (Commit Engellenir):**

```bash
git commit -m "Add new feature"  # ❌ type yok
git commit -m "FEAT: Add feature"  # ❌ type büyük harf
git commit -m "feat: Add New Feature"  # ❌ subject büyük harf
git commit -m "feat: add new feature."  # ❌ nokta var
```

**Hata Mesajı:**

```
✖   input: Add new feature
✖   type may not be empty [type-empty]
✖   found 1 problems, 0 warnings
❌   Get help: https://github.com/conventional-changelog/commitlint
husky - commit-msg script failed (code 1)
```

## 🔍 Detaylı Açıklama

### Pre-commit Hook İşlem Akışı

```
1. Git commit komutu çalıştırılır
   ↓
2. Pre-commit hook tetiklenir
   ↓
3. lint-staged çalışır
   ↓
4. Değişen dosyalar tespit edilir
   ↓
5. Her dosya tipine göre işlem yapılır:
   - *.{ts,tsx,js,jsx} → ESLint + Prettier
   - *.{json,md,yml,yaml} → Prettier
   ↓
6. Hata varsa:
   - Commit engellenir
   - Hata mesajı gösterilir
   ↓
7. Hata yoksa:
   - Commit devam eder
   - Commit-msg hook çalışır
```

### Commit-msg Hook İşlem Akışı

```
1. Commit mesajı yazılır
   ↓
2. Commit-msg hook tetiklenir
   ↓
3. Commitlint çalışır
   ↓
4. Commit mesajı formatı kontrol edilir:
   - Type var mı? (feat, fix, docs, ...)
   - Type küçük harf mi?
   - Subject var mı?
   - Subject formatı doğru mu?
   - Mesaj uzunluğu 100 karakterden az mı?
   ↓
5. Hata varsa:
   - Commit engellenir
   - Hata mesajı gösterilir
   ↓
6. Hata yoksa:
   - Commit tamamlanır
```

## 📝 Örnek Senaryolar

### Senaryo 1: Başarılı Commit

```bash
# 1. Dosya değiştir
echo "console.log('test');" > test.js

# 2. Stage'e ekle
git add test.js

# 3. Commit yap
git commit -m "feat: add test file"
```

**Çıktı:**

```
[STARTED] Running tasks for staged files...
[COMPLETED] eslint --fix
[COMPLETED] prettier --write
[COMPLETED] Running tasks for staged files...
[main abc1234] feat: add test file
 1 file changed, 1 insertion(+)
```

**Sonuç:** ✅ Commit başarılı

### Senaryo 2: Lint Hatası (Commit Engellenir)

```bash
# 1. Hatalı kod yaz
echo "var x = 1;" > test.js  # var kullanımı (ESLint hatası)

# 2. Stage'e ekle
git add test.js

# 3. Commit yap
git commit -m "feat: add test file"
```

**Çıktı:**

```
[STARTED] Running tasks for staged files...
[FAILED] eslint --fix
✖ ESLint found problems
  test.js:1:1  error  Unexpected var, use let or const  no-var
husky - pre-commit script failed (code 1)
```

**Sonuç:** ❌ Commit engellendi (ESLint hatası)

### Senaryo 3: Geçersiz Commit Mesajı (Commit Engellenir)

```bash
# 1. Dosya değiştir
echo "test" > test.js

# 2. Stage'e ekle
git add test.js

# 3. Geçersiz commit mesajı ile commit yap
git commit -m "Add test file"  # type yok
```

**Çıktı:**

```
[COMPLETED] Running tasks for staged files...
✖   input: Add test file
✖   type may not be empty [type-empty]
✖   found 1 problems, 0 warnings
husky - commit-msg script failed (code 1)
```

**Sonuç:** ❌ Commit engellendi (commit mesajı formatı hatalı)

## ⚙️ Yapılandırma Dosyaları

### `.husky/pre-commit`

```bash
# Pre-commit hook - Commit öncesi otomatik kontrol
npx lint-staged
```

### `.husky/commit-msg`

```bash
# Commit-msg hook - Commit mesajı formatı kontrolü
npx --no -- commitlint --edit ${1}
```

### `.lintstagedrc.js`

```javascript
module.exports = {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
```

### `commitlint.config.js`

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', ...]],
    'header-max-length': [2, 'always', 100],
  },
};
```

## 🎯 Faydalar

1. **Otomatik Kod Kalitesi**
   - Her commit'te kod otomatik lint/format edilir
   - Hatalı kod commit edilemez

2. **Tutarlı Commit Mesajları**
   - Tüm commit mesajları standart formatta
   - Otomatik changelog oluşturma için uygun

3. **Hızlı Kontrol**
   - Sadece değişen dosyalar kontrol edilir
   - Commit süresi kısa kalır

4. **Ekip Standardı**
   - Tüm ekip üyeleri aynı standartları kullanır
   - Kod kalitesi garanti edilir

## 🔧 Troubleshooting

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
- Örnek: `feat: add feature` formatını kullanın

---

**Not:** Git hook'ları commit sürecini biraz yavaşlatabilir ama kod kalitesini önemli ölçüde artırır.
