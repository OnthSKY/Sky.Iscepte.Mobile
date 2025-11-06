# Katkıda Bulunma Rehberi

Sky.Template.Mobile projesine katkıda bulunmak için teşekkürler! Bu rehber, projeye nasıl katkıda bulunabileceğinizi açıklar.

## 📋 İçindekiler

1. [Kod Standartları](#kod-standartları)
2. [Geliştirme Süreci](#geliştirme-süreci)
3. [Commit Mesajları](#commit-mesajları)
4. [Pull Request Süreci](#pull-request-süreci)
5. [Test Yazma](#test-yazma)
6. [Dokümantasyon](#dokümantasyon)

## 🎯 Kod Standartları

### TypeScript

- **Strict Mode**: Tüm TypeScript strict seçenekleri aktif
- **Type Safety**: `any` kullanımından kaçının
- **Type Coverage**: Minimum %80 type coverage hedeflenir

### ESLint & Prettier

- Kod otomatik olarak lint edilir ve formatlanır
- Pre-commit hook'ları kod kalitesini kontrol eder
- Lint hataları commit'i engeller

### Kod Stili

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Trailing Commas**: ES5 compatible

## 🚀 Geliştirme Süreci

### 1. Projeyi Fork Edin

```bash
# GitHub'da projeyi fork edin
# Sonra fork'unuzu clone edin
git clone https://github.com/YOUR_USERNAME/Sky.Template.Mobile.git
cd Sky.Template.Mobile
```

### 2. Development Branch Oluşturun

```bash
# Main branch'den güncel kodu alın
git checkout main
git pull origin main

# Yeni feature branch oluşturun
git checkout -b feature/your-feature-name
```

### 3. Bağımlılıkları Yükleyin

```bash
npm install
```

### 4. Environment Ayarları

`.env` dosyası oluşturun (bkz: [Environment Setup](docs/setup/ENVIRONMENT_SETUP.md))

### 5. Geliştirme

- Kod yazarken lint ve type check çalıştırın:

  ```bash
  npm run lint
  npm run type-check
  ```

- Testleri çalıştırın:
  ```bash
  npm test
  ```

### 6. Commit

Conventional Commits formatını kullanın (aşağıya bakın)

## 📝 Commit Mesajları

Proje [Conventional Commits](https://www.conventionalcommits.org/) standardını kullanır.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Yeni özellik
- `fix`: Bug düzeltmesi
- `docs`: Dokümantasyon değişiklikleri
- `style`: Kod formatı (lint, prettier)
- `refactor`: Kod refactoring
- `test`: Test ekleme/değiştirme
- `chore`: Build, config değişiklikleri
- `perf`: Performance iyileştirmeleri
- `ci`: CI/CD değişiklikleri

### Örnekler

```bash
# Yeni özellik
git commit -m "feat(products): add product search functionality"

# Bug düzeltmesi
git commit -m "fix(auth): fix token refresh issue"

# Dokümantasyon
git commit -m "docs: update API documentation"

# Breaking change
git commit -m "feat(api)!: change API response format

BREAKING CHANGE: API response structure changed"
```

## 🔄 Pull Request Süreci

### 1. Branch'inizi Push Edin

```bash
git push origin feature/your-feature-name
```

### 2. Pull Request Oluşturun

- GitHub'da Pull Request oluşturun
- Template'i doldurun
- İlgili issue'ları referans edin

### 3. PR Checklist

- [ ] Kod lint hatası yok
- [ ] Type check başarılı
- [ ] Testler geçiyor
- [ ] Test coverage düşmedi
- [ ] Dokümantasyon güncellendi (gerekirse)
- [ ] Breaking change varsa belirtildi

### 4. Code Review

- PR'lar en az bir kişi tarafından review edilmelidir
- Review feedback'lerini adresleyin
- "Request changes" durumunda değişiklikleri yapın ve tekrar review isteyin

### 5. Merge

- PR onaylandıktan sonra merge edilir
- Squash merge tercih edilir

## 🧪 Test Yazma

### Test Dosyası Konumu

- Test dosyaları `__tests__` klasöründe veya `.test.ts`/`.test.tsx` uzantılı olmalıdır
- Component testleri: `ComponentName.test.tsx`
- Utility testleri: `utilityName.test.ts`

### Test Yazma Örnekleri

```typescript
// Component test
import { render, screen } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button title="Test" />);
    expect(screen.getByText('Test')).toBeTruthy();
  });
});

// Utility test
import { validateEmail } from '../validators';

describe('validateEmail', () => {
  it('validates correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
});
```

### Test Çalıştırma

```bash
# Tüm testler
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 📚 Dokümantasyon

### Kod Dokümantasyonu

- JSDoc kullanın
- Public API'ler için dokümantasyon zorunludur
- Complex logic için açıklayıcı yorumlar ekleyin

### Örnek

````typescript
/**
 * Validates email address
 *
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 *
 * @example
 * ```ts
 * const isValid = validateEmail('test@example.com');
 * ```
 */
export function validateEmail(email: string): boolean {
  // ...
}
````

### Dokümantasyon Güncellemeleri

- Yeni özellik eklerken ilgili dokümantasyonu güncelleyin
- API değişikliklerinde API_DOCUMENTATION.md'yi güncelleyin
- Breaking change'lerde CHANGELOG.md'yi güncelleyin

## 🏗️ Proje Yapısı

### Yeni Modül Ekleme

1. `src/modules/{moduleName}/` klasörü oluşturun
2. Standart modül yapısını takip edin:
   ```
   modules/{module}/
   ├── components/
   ├── config/
   ├── hooks/
   ├── screens/
   ├── services/
   ├── store/
   └── utils/
   ```
3. Navigation config'e ekleyin
4. Permissions config'e ekleyin

### Yeni Component Ekleme

1. `src/shared/components/` veya modül içinde `components/` klasörüne ekleyin
2. TypeScript types tanımlayın
3. Test yazın
4. Storybook story ekleyin (opsiyonel)

## 🐛 Bug Report

Bug bulduysanız:

1. Issue oluşturun
2. Bug'ı açıklayın
3. Steps to reproduce ekleyin
4. Expected vs actual behavior belirtin
5. Environment bilgisi ekleyin (OS, device, etc.)

## 💡 Feature Request

Yeni özellik önerisi için:

1. Issue oluşturun
2. Özelliği detaylı açıklayın
3. Use case'leri belirtin
4. Alternatif çözümleri düşünün

## ❓ Sorular

Sorularınız için:

- Issue oluşturun (question label ile)
- Dokümantasyonu kontrol edin
- Mevcut kod örneklerine bakın

## 📞 İletişim

- GitHub Issues: Sorular ve bug report'lar için
- Pull Requests: Kod katkıları için

---

**Teşekkürler!** 🎉
