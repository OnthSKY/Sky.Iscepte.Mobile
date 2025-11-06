# Güvenlik Migrasyonu - AsyncStorage'dan Keychain'e

## 🔄 Yapılan Değişiklikler

### 1. Secure Storage Service Oluşturuldu

**Dosya:** `src/core/services/secureStorageService.ts`

**NEDEN:**
- Token'lar ve hassas veriler için güvenli storage sağlar
- iOS Keychain ve Android Keystore kullanır
- Donanım seviyesinde şifreleme

**Kullanım:**
```typescript
import { tokenStorage } from '../core/services/secureStorageService';

// Token saklama
await tokenStorage.setAccessToken(token);

// Token okuma
const token = await tokenStorage.getAccessToken();
```

### 2. Auth Service Güncellendi

**Dosya:** `src/shared/services/authService.ts`

**Değişiklikler:**
- ✅ `AsyncStorage.setItem('access_token')` → `tokenStorage.setAccessToken()`
- ✅ `AsyncStorage.getItem('access_token')` → `tokenStorage.getAccessToken()`
- ✅ `AsyncStorage.removeItem('access_token')` → `tokenStorage.clearTokens()`

**NEDEN:**
- Login/logout işlemlerinde token'lar güvenli saklanmalı
- Keychain donanım seviyesinde şifreleme sağlar

### 3. App Store Güncellendi

**Dosya:** `src/store/useAppStore.ts`

**Değişiklikler:**
- ✅ `silentLogin()` fonksiyonunda token okuma Keychain'den
- ✅ Token'lar artık Keychain'de saklanıyor

**NEDEN:**
- Uygulama başlangıcında token'lar güvenli okunmalı
- Session yönetimi güvenli olmalı

### 4. Get Token Utility

**Dosya:** `src/core/utils/getToken.ts`

**NEDEN:**
- Tüm servislerde token okuma işlemini merkezileştirir
- Tek bir yerden yönetim
- Mock mode kontrolü

**Kullanım:**
```typescript
import { getAccessToken } from '../core/utils/getToken';
const token = await getAccessToken();
```

## 📋 Kalan Dosyalar

Aşağıdaki dosyalarda hala `AsyncStorage.getItem('access_token')` kullanımı var:

1. `src/modules/products/services/productService.ts` ✅ Güncellendi
2. `src/modules/sales/services/salesService.ts` ✅ Güncellendi
3. `src/shared/services/userService.ts` ✅ Güncellendi
4. `src/modules/products/services/formTemplateService.ts` ⚠️ Güncellenecek
5. `src/modules/customers/services/customerService.ts` ⚠️ Güncellenecek
6. `src/modules/purchases/services/purchaseService.ts` ⚠️ Güncellenecek
7. `src/modules/purchases/services/purchaseTypeService.ts` ⚠️ Güncellenecek
8. `src/core/services/ownerDashboardService.ts` ⚠️ Güncellenecek
9. `src/modules/employees/services/staffPermissionGroupService.ts` ⚠️ Güncellenecek
10. `src/modules/income/services/incomeService.ts` ⚠️ Güncellenecek
11. `src/modules/revenue/services/revenueService.ts` ⚠️ Güncellenecek
12. `src/modules/expenses/services/expenseService.ts` ⚠️ Güncellenecek
13. `src/modules/suppliers/services/supplierService.ts` ⚠️ Güncellenecek
14. `src/modules/employees/services/employeeService.ts` ⚠️ Güncellenecek

## 🔧 Güncelleme Adımları

Her dosya için:

1. `AsyncStorage.getItem('access_token')` → `getAccessToken()` utility kullan
2. `import AsyncStorage` satırını kaldır (sadece token için kullanılıyorsa)
3. `import { getAccessToken } from '../../../core/utils/getToken'` ekle

**Örnek:**
```typescript
// ÖNCE
import AsyncStorage from '@react-native-async-storage/async-storage';
const token = await AsyncStorage.getItem('access_token');

// SONRA
const { getAccessToken } = await import('../../../core/utils/getToken');
const token = await getAccessToken();
```

## ✅ Tamamlanan

- ✅ `secureStorageService.ts` oluşturuldu
- ✅ `authService.ts` güncellendi
- ✅ `useAppStore.ts` güncellendi
- ✅ `permissionsStore.ts` güncellendi
- ✅ `getToken.ts` utility oluşturuldu
- ✅ `productService.ts` güncellendi
- ✅ `salesService.ts` güncellendi
- ✅ `userService.ts` güncellendi

## ⚠️ Kalan İşler

- ⚠️ Diğer servis dosyalarında token okuma güncellemesi
- ⚠️ Test dosyalarında mock'ların güncellenmesi
- ⚠️ Certificate pinning eklenmesi
- ⚠️ Data encryption eklenmesi (opsiyonel, Keychain zaten şifreliyor)

---

**Not:** Bu migrasyon production için kritik öneme sahiptir. Tüm token okuma işlemleri Keychain üzerinden yapılmalıdır.

