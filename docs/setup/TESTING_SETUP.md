# Test Altyapısı Kurulumu

**Tarih:** 2025-02-18

## ✅ Tamamlanan

### 1. Jest Yapılandırması
- **jest.config.js** oluşturuldu
  - jest-expo preset kullanılıyor
  - Coverage threshold'lar belirlendi (%50)
  - Module name mapper'lar eklendi
  - Test match pattern'leri tanımlandı

### 2. Jest Setup Dosyası
- **jest.setup.js** oluşturuldu
  - AsyncStorage mock'u
  - Expo modülleri mock'landı (expo-constants, expo-notifications, expo-image-picker)
  - React Native modülleri mock'landı (gesture-handler, safe-area-context, vector-icons)
  - NetInfo mock'u
  - i18n mock'u

### 3. Test Dosyaları
- **Button.test.tsx** - Button component testleri
- **errorUtils.test.ts** - Error utilities testleri
- **validators.test.ts** - Validator functions testleri

### 4. Package.json Script'leri
- `npm test` - Testleri çalıştır
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Coverage raporu
- `npm run test:ci` - CI için testler

### 5. Babel Yapılandırması
- **babel.config.js** oluşturuldu
  - Babel presets eklendi
  - TypeScript desteği

## 📦 Yüklenen Paketler

### Dev Dependencies
- `jest` - Test framework
- `jest-expo` - Expo için Jest preset
- `@testing-library/react-native` - React Native test utilities
- `@testing-library/jest-native` - Jest matchers
- `@types/jest` - Jest type definitions
- `react-test-renderer` - React component renderer
- `babel-jest` - Babel transformer for Jest
- `@babel/core`, `@babel/preset-env`, `@babel/preset-react`, `@babel/preset-typescript` - Babel presets

## ⚠️ Bilinen Sorunlar

1. **jest-expo preset uyumsuzluğu** - Expo 54 ile jest-expo 52 arasında uyumsuzluk olabilir
2. **React 19 uyumluluğu** - Bazı test kütüphaneleri React 19'u tam desteklemeyebilir
3. **Test çalıştırma** - `npm test` komutu çalışmıyor olabilir, `npx jest` veya `node_modules/.bin/jest` kullanılabilir

## 🔧 Çözüm Önerileri

### Test Çalıştırma
```bash
# Option 1: npm script kullan
npm test

# Option 2: npx kullan
npx jest

# Option 3: Direkt path
node_modules/.bin/jest

# Option 4: Watch mode
npm run test:watch

# Option 5: Coverage
npm run test:coverage
```

### Test Yazma Örnekleri

#### Component Test
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });
});
```

#### Utility Test
```typescript
import { required, minLength } from '../validators';

describe('validators', () => {
  it('validates required field', () => {
    expect(required('')).toBeTruthy();
    expect(required('test')).toBeUndefined();
  });
});
```

## 📝 Sonraki Adımlar

1. **Daha fazla test yazılmalı**
   - Service testleri
   - Hook testleri
   - Integration testleri

2. **Coverage artırılmalı**
   - Şu anda %50 threshold
   - Hedef: %70-80

3. **CI/CD entegrasyonu**
   - GitHub Actions workflow
   - Otomatik test çalıştırma

4. **E2E testler**
   - Detox veya Maestro
   - Kritik akışlar için

---

**Not:** Test altyapısı kuruldu ancak bazı testler çalışmayabilir. Jest-expo preset uyumsuzluğu nedeniyle testlerin çalıştırılması için ek yapılandırma gerekebilir.

