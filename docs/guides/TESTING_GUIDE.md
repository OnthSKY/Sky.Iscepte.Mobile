# Test Kullanım Kılavuzu

Bu dokümantasyon, projede test yazma ve çalıştırma hakkında pratik bilgiler içerir.

## 🚀 Hızlı Başlangıç

### Testleri Çalıştırma

```bash
# Tüm testleri çalıştır
npm test

# Watch mode (dosya değişikliklerinde otomatik test)
npm run test:watch

# Coverage raporu ile
npm run test:coverage

# CI için (coverage + max workers)
npm run test:ci
```

### Test Dosyası Oluşturma

Test dosyaları şu konumlarda olmalı:
- `src/**/__tests__/*.test.ts` veya `*.test.tsx`
- `src/**/__tests__/*.spec.ts` veya `*.spec.tsx`

**Örnek:** `src/shared/components/__tests__/Button.test.tsx`

## 📝 Test Yazma Örnekleri

### 1. Component Testi

```typescript
// src/shared/components/__tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPress} />);
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPress} disabled />);
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

### 2. Utility Function Testi

```typescript
// src/core/utils/__tests__/validators.test.ts
import { required, minLength, isEmail } from '../validators';

describe('validators', () => {
  describe('required', () => {
    it('returns error for empty string', () => {
      expect(required('')).toBeTruthy();
    });

    it('returns undefined for valid value', () => {
      expect(required('test')).toBeUndefined();
    });
  });

  describe('minLength', () => {
    it('returns error for string shorter than min', () => {
      expect(minLength(5)('test')).toBeTruthy();
    });

    it('returns undefined for string longer than min', () => {
      expect(minLength(5)('test123')).toBeUndefined();
    });
  });

  describe('isEmail', () => {
    it('returns error for invalid email', () => {
      expect(isEmail('invalid')).toBeTruthy();
    });

    it('returns undefined for valid email', () => {
      expect(isEmail('test@example.com')).toBeUndefined();
    });
  });
});
```

### 3. Hook Testi

```typescript
// src/core/hooks/__tests__/useNetworkStatus.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useNetworkStatus } from '../useNetworkStatus';

describe('useNetworkStatus', () => {
  it('returns online status', async () => {
    const { result } = renderHook(() => useNetworkStatus());
    
    await waitFor(() => {
      expect(result.current.isOnline).toBeDefined();
    });
  });
});
```

### 4. Service Testi

```typescript
// src/shared/services/__tests__/httpService.test.ts
import { httpService } from '../httpService';

describe('httpService', () => {
  it('makes GET request', async () => {
    const response = await httpService.get('/api/test');
    expect(response).toBeDefined();
  });
});
```

## 🛠️ Test Araçları ve API'ler

### @testing-library/react-native

```typescript
import { 
  render,           // Component render etme
  fireEvent,        // Event tetikleme
  waitFor,          // Async işlemler için bekleme
  screen,           // Screen queries
} from '@testing-library/react-native';

// Queries
getByText('Text')           // Text içeren element bul
getByTestId('test-id')      // testID ile element bul
getByPlaceholderText('...') // Placeholder ile input bul
queryByText('Text')         // Bulamazsa null döner (hata vermez)
findByText('Text')          // Async olarak bul
```

### Jest Matchers

```typescript
// Equality
expect(value).toBe(expected)           // ===
expect(value).toEqual(expected)        // Deep equality
expect(value).toStrictEqual(expected)  // Strict equality

// Truthiness
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()

// Numbers
expect(value).toBeGreaterThan(3)
expect(value).toBeLessThan(5)
expect(value).toBeCloseTo(0.3, 5)

// Strings
expect(value).toMatch(/pattern/)
expect(value).toContain('substring')

// Arrays
expect(array).toContain(item)
expect(array).toHaveLength(3)

// Objects
expect(object).toHaveProperty('key')
expect(object).toMatchObject({ key: 'value' })

// Functions
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledTimes(2)
expect(fn).toHaveBeenCalledWith(arg1, arg2)
expect(fn).toHaveReturnedWith(value)

// Async
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()
```

## 🎯 Best Practices

### 1. Test İsimlendirme

```typescript
describe('ComponentName', () => {
  describe('when condition', () => {
    it('should do something', () => {
      // Test
    });
  });
});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should calculate total correctly', () => {
  // Arrange (Hazırlık)
  const items = [{ price: 10, quantity: 2 }, { price: 5, quantity: 3 }];
  
  // Act (Aksiyon)
  const total = calculateTotal(items);
  
  // Assert (Doğrulama)
  expect(total).toBe(35);
});
```

### 3. Mock Kullanımı

```typescript
// Function mock
const mockFn = jest.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async value');
mockFn.mockRejectedValue(new Error('error'));

// Module mock
jest.mock('../service', () => ({
  serviceMethod: jest.fn(() => Promise.resolve({ data: 'test' })),
}));

// Partial mock
jest.spyOn(module, 'function').mockReturnValue('mocked');
```

### 4. Async Testler

```typescript
it('should fetch data', async () => {
  const promise = fetchData();
  await expect(promise).resolves.toEqual({ data: 'test' });
});

// veya
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toEqual({ data: 'test' });
});

// waitFor kullanımı
it('should update after async operation', async () => {
  const { result } = renderHook(() => useData());
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

### 5. Cleanup

```typescript
afterEach(() => {
  jest.clearAllMocks();
  cleanup(); // React Testing Library cleanup
});
```

## 📊 Coverage Raporu

### Coverage Görüntüleme

```bash
npm run test:coverage
```

Coverage raporu `coverage/` klasöründe oluşturulur:
- `coverage/lcov-report/index.html` - HTML raporu
- `coverage/lcov.info` - LCOV formatı

### Coverage Threshold'lar

`jest.config.js` dosyasında belirlenen threshold'lar:
- Branches: %50
- Functions: %50
- Lines: %50
- Statements: %50

## 🔧 Yaygın Sorunlar ve Çözümler

### 1. "Cannot find module" Hatası

```typescript
// jest.config.js'de moduleNameMapper ekle
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### 2. AsyncStorage Mock

```typescript
// jest.setup.js'de zaten var
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

### 3. Navigation Mock

```typescript
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: {} }),
}));
```

### 4. i18n Mock

```typescript
jest.mock('../../i18n', () => ({
  t: (key: string, options?: any) => {
    if (options?.defaultValue) return options.defaultValue;
    return key;
  },
}));
```

## 📚 Örnek Test Senaryoları

### Senaryo 1: Form Validation

```typescript
describe('ProductFormScreen', () => {
  it('should show error when required field is empty', () => {
    const { getByText } = render(<ProductFormScreen />);
    const submitButton = getByText('Kaydet');
    
    fireEvent.press(submitButton);
    
    expect(getByText('Bu alan zorunludur')).toBeTruthy();
  });
});
```

### Senaryo 2: API Call

```typescript
describe('ProductService', () => {
  it('should fetch products', async () => {
    const products = await productService.list();
    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
  });
});
```

### Senaryo 3: State Management

```typescript
describe('useAppStore', () => {
  it('should update theme', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(result.current.theme).toBe('dark');
  });
});
```

## 🎓 Öğrenme Kaynakları

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 📝 Checklist: Yeni Test Yazarken

- [ ] Test dosyası doğru konumda mı? (`__tests__` klasörü veya `.test.ts` uzantısı)
- [ ] Test isimleri açıklayıcı mı?
- [ ] Arrange-Act-Assert pattern kullanıldı mı?
- [ ] Gerekli mock'lar eklendi mi?
- [ ] Async işlemler için `async/await` veya `waitFor` kullanıldı mı?
- [ ] Cleanup yapıldı mı? (`afterEach`, `cleanup`)
- [ ] Coverage threshold'ları karşılıyor mu?

---

**Not:** Test yazarken, gerçek kullanıcı senaryolarını test etmeye odaklanın. Implementation detaylarından çok, kullanıcı davranışlarını test edin.

