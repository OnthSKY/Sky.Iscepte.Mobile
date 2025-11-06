# State Management İyileştirmeleri Kılavuzu

## 🎯 Neden State Management İyileştirmeleri?

### Sorunlar (Önceki Durum)

- ❌ Store state'leri uygulama kapanınca kayboluyordu
- ❌ Kullanıcı tercihleri (theme, language) her seferinde yeniden ayarlanıyordu
- ❌ Development'ta store state'lerini debug etmek zordu
- ❌ Gereksiz re-render'lar oluyordu (tüm store değişikliklerinde)

### Çözüm (State Management İyileştirmeleri)

- ✅ Store persistence - Kullanıcı tercihleri kalıcı
- ✅ Selective subscriptions - Sadece değişen state'ler için re-render
- ✅ DevTools support - Development'ta state debugging
- ✅ Modüler store yapısı

## 📋 Yapılan İyileştirmeler

### 1. Store Persistence

**NEDEN:** Kullanıcı tercihlerini kalıcı hale getirmek için

**Ne yapar:**

- Theme, language, menuTextCase tercihlerini AsyncStorage'da saklar
- Uygulama kapanıp açıldığında tercihler korunur
- Token'ları ve user data'yı persist etmez (güvenlik ve güncellik için)

**Kullanım:**

```typescript
// useAppStore otomatik olarak persist ediyor
const { themePreference, setTheme } = useAppStore();

// Theme değiştirildiğinde otomatik kaydedilir
await setTheme(ThemePreference.DARK);
```

**Yapılandırma:**

```typescript
persist(
  (set, get) => ({
    /* store */
  }),
  {
    name: 'app-store',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      themePreference: state.themePreference,
      language: state.language,
      menuTextCase: state.menuTextCase,
      // Token'lar ve user data persist edilmez
    }),
  }
);
```

### 2. Selective Subscriptions (useShallow)

**NEDEN:** Gereksiz re-render'ları önlemek için

**Sorun:**

```typescript
// ❌ Kötü: Her store değişikliğinde re-render
const theme = useAppStore((state) => state.themePreference);
const language = useAppStore((state) => state.language);
```

**Çözüm:**

```typescript
// ✅ İyi: Sadece theme veya language değiştiğinde re-render
import { useShallow } from '../store/hooks/useShallow';

const { theme, language } = useAppStore(
  useShallow((state) => ({
    theme: state.themePreference,
    language: state.language,
  }))
);
```

**Fayda:**

- Sadece seçilen field'lar değiştiğinde re-render
- Daha performanslı component'ler
- Daha az gereksiz render

### 3. Store Structure

**Mevcut Store'lar:**

- `useAppStore` - Ana app state (auth, theme, language, user)
- `usePermissionStore` - Permission state (JWT permissions, module permissions)

**Store Yapısı:**

```
src/store/
├── useAppStore.ts          # Ana app store
├── permissionsStore.ts      # Permission store
└── hooks/
    └── useShallow.ts        # Selective subscription hook
```

## 🚀 Kullanım Örnekleri

### Örnek 1: Theme Değiştirme (Persistence ile)

```typescript
import { useAppStore } from '../store/useAppStore';
import { ThemePreference } from '../core/config/appConstants';

function ThemeSelector() {
  const { themePreference, setTheme } = useAppStore();

  const handleThemeChange = async (theme: ThemePreference) => {
    await setTheme(theme);
    // Otomatik olarak AsyncStorage'a kaydedilir
  };

  return (
    <Button onPress={() => handleThemeChange(ThemePreference.DARK)}>
      Dark Mode
    </Button>
  );
}
```

### Örnek 2: Selective Subscription

```typescript
import { useAppStore } from '../store/useAppStore';
import { useShallow } from '../store/hooks/useShallow';

function UserPreferences() {
  // Sadece theme ve language değiştiğinde re-render
  const { theme, language } = useAppStore(
    useShallow((state) => ({
      theme: state.themePreference,
      language: state.language,
    }))
  );

  // user değişikliklerinde re-render olmaz
  return (
    <View>
      <Text>Theme: {theme}</Text>
      <Text>Language: {language}</Text>
    </View>
  );
}
```

### Örnek 3: Multiple Store Kullanımı

```typescript
import { useAppStore } from '../store/useAppStore';
import { usePermissionStore } from '../store/permissionsStore';

function Dashboard() {
  const { user, role } = useAppStore();
  const { jwtPermissions } = usePermissionStore();

  const canCreateProduct = jwtPermissions.includes('products:create');

  return (
    <View>
      {canCreateProduct && <Button>Create Product</Button>}
    </View>
  );
}
```

## 🔍 Best Practices

### 1. Selective Subscriptions Kullanın

**❌ Kötü:**

```typescript
const theme = useAppStore((state) => state.themePreference);
const language = useAppStore((state) => state.language);
const user = useAppStore((state) => state.user);
```

**✅ İyi:**

```typescript
const { theme, language, user } = useAppStore(
  useShallow((state) => ({
    theme: state.themePreference,
    language: state.language,
    user: state.user,
  }))
);
```

### 2. Sadece Gerekli State'i Persist Edin

**❌ Kötü:**

```typescript
// Tüm state'i persist etme
partialize: (state) => state;
```

**✅ İyi:**

```typescript
// Sadece kullanıcı tercihlerini persist et
partialize: (state) => ({
  themePreference: state.themePreference,
  language: state.language,
  // Token'ları persist etme (güvenlik)
  // User data'yı persist etme (güncellik)
});
```

### 3. Store'ları Modüler Tutun

**✅ İyi:**

- Her store tek bir sorumluluğa sahip
- `useAppStore` - App state
- `usePermissionStore` - Permission state
- Her store bağımsız çalışır

### 4. Async Actions için try-catch Kullanın

```typescript
async login(username: string, password: string) {
  try {
    const response = await authService.login(username, password);
    set({ isAuthenticated: true, user: response.user });
  } catch (error) {
    console.error('Login failed:', error);
    set({ isAuthenticated: false });
  }
}
```

## 📊 Performance İyileştirmeleri

### Before (Selective Subscription Olmadan)

```typescript
// Her store değişikliğinde re-render
const Component = () => {
  const theme = useAppStore((state) => state.themePreference);
  const language = useAppStore((state) => state.language);
  // user değiştiğinde de re-render olur ❌
};
```

### After (Selective Subscription ile)

```typescript
// Sadece theme veya language değiştiğinde re-render
const Component = () => {
  const { theme, language } = useAppStore(
    useShallow((state) => ({
      theme: state.themePreference,
      language: state.language,
    }))
  );
  // user değişikliklerinde re-render olmaz ✅
};
```

## 🔧 Troubleshooting

### Problem: Persisted state yüklenmiyor

**Çözüm:**

- `hydrate()` metodunu çağırdığınızdan emin olun
- AsyncStorage izinlerini kontrol edin
- Store name'in doğru olduğundan emin olun

### Problem: Gereksiz re-render'lar

**Çözüm:**

- `useShallow` hook'unu kullanın
- Sadece ihtiyaç duyduğunuz state'i subscribe edin
- Object reference'ları kontrol edin

### Problem: State persist edilmiyor

**Çözüm:**

- `partialize` fonksiyonunda doğru field'ları seçtiğinizden emin olun
- AsyncStorage yazma izinlerini kontrol edin
- Storage key'in doğru olduğundan emin olun

## 📚 İlgili Dosyalar

- `src/store/useAppStore.ts` - Ana app store
- `src/store/permissionsStore.ts` - Permission store
- `src/store/hooks/useShallow.ts` - Selective subscription hook

---

**Not:** State management iyileştirmeleri uygulama performansını ve kullanıcı deneyimini önemli ölçüde artırır.
