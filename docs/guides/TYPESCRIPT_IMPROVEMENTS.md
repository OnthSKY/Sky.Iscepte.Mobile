# TypeScript İyileştirmeleri Kılavuzu

## 🎯 Neden TypeScript İyileştirmeleri?

### Sorunlar (Önceki Durum)

- ❌ `any` kullanımları type safety'i azaltıyordu
- ❌ Type coverage ölçülmüyordu
- ❌ Type errors geç fark ediliyordu
- ❌ Runtime hataları olabiliyordu

### Çözüm (TypeScript İyileştirmeleri)

- ✅ Type coverage raporu - type-coverage ile type safety ölçümü
- ✅ Any kullanımı azaltma - Proper type'lar kullanımı
- ✅ Type helpers - Type-safe utility functions
- ✅ Type safety artırma

## 📋 Yapılan İyileştirmeler

### 1. Type Coverage Raporu

**NEDEN:** Type safety'i ölçmek ve iyileştirmek için

**Ne yapar:**

- `type-coverage` ile type coverage ölçümü
- `any` kullanımlarını tespit eder
- Type safety yüzdesini gösterir
- Detaylı rapor oluşturur

**Kullanım:**

```bash
# Type coverage raporu
npm run type-coverage

# Type coverage kontrolü (threshold: 80%)
npm run type-coverage:check
```

**Yapılandırma:**
`.type-coverage.json` dosyasında:

```json
{
  "target": ".",
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["**/*.test.ts", "**/*.spec.ts"],
  "threshold": 80,
  "detail": true
}
```

### 2. Type Helpers

**NEDEN:** `any` kullanımını azaltmak için type-safe utility'ler

**Ne yapar:**

- Type-safe object property access
- Type-safe error handling
- Type-safe JSON parsing
- Type-safe array filtering

**Kullanım:**

```typescript
import {
  getProperty,
  hasProperty,
  filterDefined,
  safeJsonParse,
  isError,
  getErrorMessage,
} from '../core/utils/typeHelpers';

// Type-safe property access
const value = getProperty(obj, 'key');

// Type-safe property check
if (hasProperty(obj, 'key')) {
  // obj.key is now available
}

// Type-safe array filter
const defined = filterDefined([1, null, 2, undefined]); // [1, 2]

// Type-safe JSON parse
const data = safeJsonParse<MyType>(json, fallback);

// Type-safe error handling
if (isError(error)) {
  console.error(error.message);
}
```

### 3. Any Kullanımı Azaltma

**NEDEN:** Type safety'i artırmak için

**Stratejiler:**

1. **Unknown kullanımı**
   - `any` yerine `unknown` kullan
   - Type guard'lar ile type narrowing

2. **Proper type definitions**
   - Interface ve type tanımları
   - Generic type'lar

3. **Type guards**
   - Runtime type checking
   - Type narrowing

**Örnekler:**

**❌ Kötü:**

```typescript
function processData(data: any) {
  return data.value;
}
```

**✅ İyi:**

```typescript
interface Data {
  value: string;
}

function processData(data: Data) {
  return data.value;
}
```

**❌ Kötü:**

```typescript
function handleError(error: any) {
  console.error(error.message);
}
```

**✅ İyi:**

```typescript
import { isError, getErrorMessage } from '../core/utils/typeHelpers';

function handleError(error: unknown) {
  if (isError(error)) {
    console.error(error.message);
  } else {
    console.error(getErrorMessage(error));
  }
}
```

## 🚀 Best Practices

### 1. Any Yerine Unknown Kullanın

**❌ Kötü:**

```typescript
function process(value: any) {
  return value;
}
```

**✅ İyi:**

```typescript
function process(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }
  throw new Error('Invalid value');
}
```

### 2. Type Guards Kullanın

**❌ Kötü:**

```typescript
function isString(value: any): boolean {
  return typeof value === 'string';
}
```

**✅ İyi:**

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

### 3. Interface Tanımları Kullanın

**❌ Kötü:**

```typescript
function processUser(user: any) {
  return user.name;
}
```

**✅ İyi:**

```typescript
interface User {
  name: string;
  email: string;
}

function processUser(user: User) {
  return user.name;
}
```

### 4. Generic Type'lar Kullanın

**❌ Kötü:**

```typescript
function getValue(obj: any, key: any): any {
  return obj[key];
}
```

**✅ İyi:**

```typescript
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

## 📊 Type Coverage Metrikleri

### Hedefler

- **Minimum threshold**: %80 type coverage
- **Hedef**: %90+ type coverage
- **Any kullanımı**: Mümkün olduğunca az

### Raporlama

```bash
npm run type-coverage
```

**Örnek çıktı:**

```
type-coverage: 85.2%
type-coverage: 1200 / 1408 expressions are typed
```

## 🔧 Troubleshooting

### Problem: Type coverage düşük

**Çözüm:**

- `any` kullanımlarını bulun: `npm run type-coverage -- --detail`
- `any` kullanımlarını proper type'larla değiştirin
- Type helper'ları kullanın

### Problem: Type errors

**Çözüm:**

- Type definitions'ı kontrol edin
- Type guards kullanın
- Unknown kullanın, any değil

### Problem: Runtime errors

**Çözüm:**

- Type guards ile runtime validation
- Proper error handling
- Type-safe utility functions

## 📚 İlgili Dosyalar

- `src/core/utils/typeHelpers.ts` - Type-safe utility functions
- `.type-coverage.json` - Type coverage yapılandırması
- `package.json` - Type coverage script'leri

---

**Not:** TypeScript iyileştirmeleri type safety'i artırır ve runtime hatalarını azaltır.
