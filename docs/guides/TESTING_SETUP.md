# Testing Setup Guide

Bu dokümantasyon, projede test altyapısının kurulumu ve kullanımını açıklar.

## 📋 Test Türleri

### 1. Unit Tests

- **Konum**: `src/**/__tests__/**/*.test.{ts,tsx}`
- **Amaç**: Bireysel fonksiyon ve component'lerin test edilmesi
- **Örnek**: `src/shared/components/__tests__/Button.test.tsx`

### 2. Integration Tests

- **Konum**: `src/__tests__/integration/**/*.integration.test.ts`
- **Amaç**: Birden fazla component veya servisin birlikte çalışmasının test edilmesi
- **Örnekler**:
  - `auth.integration.test.ts` - Login flow testleri
  - `form.integration.test.ts` - Form submission testleri
  - `api.integration.test.ts` - API service testleri

### 3. E2E Tests

- **Konum**: `e2e/**/*.e2e.test.js`
- **Amaç**: Kullanıcı akışlarının end-to-end test edilmesi
- **Framework**: Detox
- **Örnekler**:
  - `login.e2e.test.js` - Login akışı
  - `navigation.e2e.test.js` - Navigasyon akışı
  - `form.e2e.test.js` - Form oluşturma/düzenleme akışı

## 🚀 Kurulum

### Gereksinimler

```bash
# Jest ve React Native Testing Library (zaten kurulu)
npm install --save-dev @testing-library/react-native @testing-library/jest-native

# Detox (E2E testler için)
npm install --save-dev detox @types/detox
```

### Detox Kurulumu (iOS)

```bash
# iOS için
brew tap wix/brew
brew install applesimutils
```

### Detox Kurulumu (Android)

Android için Android SDK ve emulator kurulu olmalı.

## 📝 Test Çalıştırma

### Unit Tests

```bash
# Tüm testler
npm test

# Watch mode
npm run test:watch

# Coverage raporu
npm run test:coverage

# CI için
npm run test:ci
```

### Integration Tests

```bash
# Sadece integration testler
npm run test:integration
```

### E2E Tests

```bash
# Build (ilk kez)
npm run test:e2e:build

# iOS build
npm run test:e2e:build:ios

# Android build
npm run test:e2e:build:android

# Test çalıştırma
npm run test:e2e
```

## 🧪 Test Yazma

### Unit Test Örneği

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test" onPress={onPress} />);
    fireEvent.press(getByText('Test'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Integration Test Örneği

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginScreen from '../../screens/LoginScreen';

describe('Login Integration', () => {
  it('should login successfully', async () => {
    const { getByPlaceholderText, getByText } = render(
      <QueryClientProvider client={queryClient}>
        <LoginScreen />
      </QueryClientProvider>
    );

    fireEvent.changeText(getByPlaceholderText('Username'), 'admin');
    fireEvent.changeText(getByPlaceholderText('Password'), '1234');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(useAppStore.getState().isAuthenticated).toBe(true);
    });
  });
});
```

### E2E Test Örneği

```javascript
describe('Login E2E', () => {
  it('should login successfully', async () => {
    await element(by.id('username-input')).typeText('admin');
    await element(by.id('password-input')).typeText('1234');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

## 🎯 Test Coverage

### Coverage Threshold'lar

- **Branches**: %50
- **Functions**: %50
- **Lines**: %50
- **Statements**: %50

### Coverage Raporu

```bash
npm run test:coverage
```

Rapor `coverage/` klasöründe oluşturulur.

## 🔧 Mock'lar

### Jest Setup

Mock'lar `jest.setup.js` dosyasında tanımlanır:

- AsyncStorage
- Expo modules
- React Native modules
- i18n

### Custom Mock'lar

Test dosyalarında custom mock'lar oluşturulabilir:

```typescript
jest.mock('../../services/authService', () => ({
  login: jest.fn(() => Promise.resolve({ token: 'mock-token' })),
}));
```

## 📊 Test Stratejisi

### Unit Tests

- Her utility function için
- Her component için
- Her service method için

### Integration Tests

- Kritik user flow'lar için
- Component'ler arası etkileşimler için
- API entegrasyonları için

### E2E Tests

- Ana user journey'ler için
- Cross-screen navigation için
- Form submission flow'ları için

## 🐛 Troubleshooting

### Problem: Testler çalışmıyor

**Çözüm:**

1. `jest.setup.js` dosyasının doğru olduğundan emin olun
2. Mock'ların doğru tanımlandığından emin olun
3. `npm test -- --clearCache` ile cache'i temizleyin

### Problem: E2E testler çalışmıyor

**Çözüm:**

1. Detox'un doğru kurulduğundan emin olun
2. Build'in başarılı olduğundan emin olun
3. Emulator/Simulator'ün çalıştığından emin olun

### Problem: Coverage düşük

**Çözüm:**

1. Eksik testler yazın
2. Edge case'leri test edin
3. Error handling'i test edin

## 📚 İlgili Dosyalar

- `jest.config.js` - Jest yapılandırması
- `jest.setup.js` - Jest setup dosyası
- `.detoxrc.js` - Detox yapılandırması
- `e2e/jest.config.js` - E2E Jest yapılandırması

---

**Not**: Test'ler sürekli geliştirilmektedir. Yeni test'ler eklenirken bu dokümantasyon güncellenmelidir.
