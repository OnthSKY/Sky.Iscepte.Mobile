# Caching İyileştirmeleri Kılavuzu

**Oluşturulma Tarihi:** 2025-02-18

Bu dokümantasyon, projede yapılan caching iyileştirmelerini ve kullanımını açıklar.

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Cache Manager](#cache-manager)
3. [Image Caching](#image-caching)
4. [Offline-First Caching](#offline-first-caching)
5. [Kullanım Örnekleri](#kullanım-örnekleri)
6. [Best Practices](#best-practices)

---

## 🎯 Genel Bakış

Caching iyileştirmeleri şunları içerir:

- ✅ **Cache Manager Service** - Cache size limit enforcement, cleanup, ve smart invalidation
- ✅ **Image Caching** - expo-image ile image caching layer
- ✅ **Offline-First Caching** - Offline durumunda cache'den veri okuma
- ✅ **Smart Cache Invalidation** - Otomatik cache invalidation stratejileri
- ✅ **Cache Size Limits** - Cache boyutu ve query sayısı limitleri

---

## 🔧 Cache Manager

### Genel Bakış

Cache Manager, cache size limit enforcement, cleanup, ve smart invalidation sağlar.

**Dosya:** `src/core/services/cacheManager.ts`

### Özellikler

- **Cache Size Limit Enforcement** - Cache boyutu limitlerini zorunlu kılar
- **Automatic Cleanup** - Eski query'leri otomatik olarak temizler
- **Smart Invalidation** - Query pattern'lerine göre akıllı invalidation
- **Cache Statistics** - Cache istatistikleri ve monitoring

### Kullanım

#### useCacheManager Hook

```tsx
import { useCacheManager } from '@/core/hooks/useCacheManager';

function MyComponent() {
  const { getStats, cleanup, smartInvalidate } = useCacheManager();

  // Cache istatistiklerini al
  const stats = getStats();
  console.log('Cache size:', stats.estimatedSize);
  console.log('Total queries:', stats.totalQueries);

  // Manuel cleanup
  const result = cleanup();
  console.log('Removed queries:', result.removedQueries);

  // Smart invalidation
  await smartInvalidate(['products', 'list']);
}
```

#### Cache Manager Instance

```tsx
import { cacheManager } from '@/core/services/queryClient';

// Cache istatistiklerini al
const stats = cacheManager.getStats();

// Manuel cleanup
const result = cacheManager.performCleanup();

// Smart invalidation
await cacheManager.smartInvalidate(['products', 'list'], {
  invalidateRelated: true,
  invalidateModule: true,
});
```

### Cache Limits

- **Cache Size Limit:** 50MB (default)
- **Max Persisted Queries:** 100 (default)
- **Max Age (Non-Critical):** 1 hour (default)
- **Max Age (Critical):** 24 hours (default)

### Automatic Cleanup

Cache Manager otomatik olarak her 5 dakikada bir cleanup yapar. Bu, App.tsx'te `initializeCacheManager()` çağrıldığında başlatılır.

---

## 🖼️ Image Caching

### Genel Bakış

Image Caching, expo-image ile image caching layer sağlar.

**Dosya:** `src/core/services/imageCacheService.ts`

### Özellikler

- **Image Prefetching** - Image'leri önceden yükler
- **Cache Tracking** - Cache'lenmiş image'leri takip eder
- **Cache Statistics** - Image cache istatistikleri

### Kullanım

#### Image Cache Service

```tsx
import { imageCacheUtils } from '@/core/services/imageCacheService';

// Image prefetch
await imageCacheUtils.prefetch('https://example.com/image.jpg');

// Multiple images prefetch
await imageCacheUtils.prefetchMultiple([
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
]);

// Cache istatistikleri
const stats = imageCacheUtils.getStats();
console.log('Cached images:', stats.cachedImages);

// Cache temizleme
imageCacheUtils.clear();
```

#### expo-image ile Kullanım

```tsx
import { Image } from 'expo-image';
import { imageCacheUtils } from '@/core/services/imageCacheService';

function MyComponent() {
  useEffect(() => {
    // Image'leri önceden yükle
    imageCacheUtils.prefetch('https://example.com/image.jpg');
  }, []);

  return (
    <Image
      source={{ uri: 'https://example.com/image.jpg' }}
      cachePolicy="memory-disk" // expo-image cache policy
      style={{ width: 200, height: 200 }}
    />
  );
}
```

---

## 📡 Offline-First Caching

### Genel Bakış

Offline-First Caching, offline durumunda cache'den veri okuma sağlar.

**Dosya:** `src/core/services/queryClient.ts`

### Özellikler

- **Offline-First Queries** - Offline durumunda cache'den veri okur
- **Offline-First Mutations** - Offline durumunda mutation'ları queue'ya ekler
- **Automatic Refetch** - Network geri geldiğinde otomatik refetch

### Kullanım

QueryClient otomatik olarak offline-first mode'da çalışır:

```tsx
import { useApiQuery } from '@/core/hooks/useApiQuery';

function MyComponent() {
  // Offline durumunda cache'den veri okur
  const { data, isLoading } = useApiQuery({
    queryKey: ['products', 'list'],
    queryFn: () => fetchProducts(),
  });

  return <View>{isLoading ? <Text>Loading...</Text> : <ProductList data={data} />}</View>;
}
```

### Network Mode

QueryClient'ın network mode'u `offlineFirst` olarak ayarlanmıştır:

- **Queries:** Cache'den okur, sonra network'ten fetch eder
- **Mutations:** Offline durumunda queue'ya ekler, online olduğunda gönderir

---

## 💡 Kullanım Örnekleri

### Cache Statistics Monitoring

```tsx
import { useCacheManager } from '@/core/hooks/useCacheManager';

function CacheStatsComponent() {
  const { getStats, isSizeLimitExceeded, isQueryCountLimitExceeded } = useCacheManager();
  const stats = getStats();

  return (
    <View>
      <Text>Total Queries: {stats.totalQueries}</Text>
      <Text>Cache Size: {(stats.estimatedSize / 1024 / 1024).toFixed(2)} MB</Text>
      <Text>Size Limit Exceeded: {isSizeLimitExceeded() ? 'Yes' : 'No'}</Text>
      <Text>Query Count Limit Exceeded: {isQueryCountLimitExceeded() ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

### Smart Invalidation on Mutation

```tsx
import { useApiMutation } from '@/core/hooks/useApiMutation';
import { useCacheManager } from '@/core/hooks/useCacheManager';

function ProductForm() {
  const { smartInvalidate } = useCacheManager();

  const mutation = useApiMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      // Smart invalidation - related queries'i de invalidate eder
      await smartInvalidate(['products', 'list'], {
        invalidateRelated: true,
        invalidateModule: true,
      });
    },
  });

  return <Form onSubmit={mutation.mutate} />;
}
```

### Image Prefetching

```tsx
import { useEffect } from 'react';
import { imageCacheUtils } from '@/core/services/imageCacheService';

function ProductList({ products }) {
  useEffect(() => {
    // Product image'lerini önceden yükle
    const imageUris = products.map((p) => p.imageUrl).filter(Boolean);

    imageCacheUtils.prefetchMultiple(imageUris);
  }, [products]);

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <Image source={{ uri: item.imageUrl }} />}
    />
  );
}
```

### Manual Cache Cleanup

```tsx
import { useCacheManager } from '@/core/hooks/useCacheManager';

function SettingsScreen() {
  const { cleanup } = useCacheManager();

  const handleClearCache = () => {
    const result = cleanup();
    console.log(`Removed ${result.removedQueries} queries`);
    console.log(`Freed ${(result.freedSize / 1024 / 1024).toFixed(2)} MB`);
  };

  return <Button onPress={handleClearCache}>Clear Cache</Button>;
}
```

---

## ✅ Best Practices

### 1. Cache Key Naming

Query key'lerini tutarlı ve anlamlı şekilde adlandırın:

```tsx
// ✅ Good
queryKeys.products.list({ filters: { category: 'electronics' } });
queryKeys.products.detail(123)[
  // ❌ Bad
  ('products', 'list', 'electronics')
][('product', 123)];
```

### 2. Smart Invalidation

Mutation'lardan sonra smart invalidation kullanın:

```tsx
// ✅ Good
await smartInvalidate(['products', 'list'], {
  invalidateRelated: true,
  invalidateModule: true,
});

// ❌ Bad
queryClient.invalidateQueries({ queryKey: ['products'] });
```

### 3. Image Prefetching

Liste ekranlarında image'leri önceden yükleyin:

```tsx
// ✅ Good
useEffect(() => {
  const imageUris = items.map((item) => item.imageUrl).filter(Boolean);
  imageCacheUtils.prefetchMultiple(imageUris);
}, [items]);
```

### 4. Cache Size Monitoring

Büyük veri setleri için cache size'ı izleyin:

```tsx
// ✅ Good
const { getStats, isSizeLimitExceeded } = useCacheManager();
const stats = getStats();

if (isSizeLimitExceeded()) {
  console.warn('Cache size limit exceeded');
}
```

### 5. Offline-First Queries

Offline-first queries kullanın (default):

```tsx
// ✅ Good - Offline-first (default)
const { data } = useApiQuery({
  queryKey: ['products', 'list'],
  queryFn: fetchProducts,
});

// ❌ Bad - Always network
const { data } = useApiQuery({
  queryKey: ['products', 'list'],
  queryFn: fetchProducts,
  networkMode: 'online', // Offline durumunda çalışmaz
});
```

---

## 📊 Cache Configuration

### Cache Limits

```tsx
// src/core/services/cacheConfig.ts

export const CACHE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB
export const MAX_PERSISTED_QUERIES = 100;
export const defaultCacheCleanupConfig = {
  maxAgeNonCritical: 60 * 60 * 1000, // 1 hour
  maxAgeCritical: 24 * 60 * 60 * 1000, // 24 hours
  maxQueries: MAX_PERSISTED_QUERIES,
};
```

### Critical vs Non-Critical Queries

**Critical Queries (Persisted):**

- `auth` - Authentication data
- `user` - User profile
- `permissions` - User permissions
- `settings` - App settings
- `stats` - Dashboard statistics

**Non-Critical Queries (Memory Only):**

- Lists (products, sales, customers, etc.)
- Details (individual items)
- Search results

---

## 🔍 Troubleshooting

### Cache Size Limit Exceeded

Eğer cache size limit aşılırsa:

1. Cache istatistiklerini kontrol edin:

```tsx
const stats = cacheManager.getStats();
console.log('Cache size:', stats.estimatedSize);
```

2. Manuel cleanup yapın:

```tsx
const result = cacheManager.performCleanup();
console.log('Removed queries:', result.removedQueries);
```

3. Cache limit'lerini artırın (gerekirse):

```tsx
// src/core/services/cacheConfig.ts
export const CACHE_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB
```

### Image Cache Issues

Image cache sorunları için:

1. Image cache istatistiklerini kontrol edin:

```tsx
const stats = imageCacheUtils.getStats();
console.log('Cached images:', stats.cachedImages);
```

2. Image cache'i temizleyin:

```tsx
imageCacheUtils.clear();
```

### Offline-First Not Working

Offline-first çalışmıyorsa:

1. Network mode'un `offlineFirst` olduğundan emin olun (default)
2. Query'nin cache'de olduğundan emin olun
3. Network status'u kontrol edin:

```tsx
import { useNetworkStatus } from '@/core/hooks/useNetworkStatus';

const { isOnline } = useNetworkStatus();
console.log('Is online:', isOnline);
```

---

## 📚 İlgili Dokümantasyon

- [React Query Documentation](https://tanstack.com/query/latest)
- [expo-image Documentation](https://docs.expo.dev/versions/latest/sdk/image/)
- [API Improvements Guide](./API_IMPROVEMENTS.md)
- [State Management Guide](./STATE_MANAGEMENT.md)

---

**Son Güncelleme:** 2025-02-18
