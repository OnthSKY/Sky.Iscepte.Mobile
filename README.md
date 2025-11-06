# Sky.Template.Mobile

Modern, ölçeklenebilir React Native (Expo) tabanlı mobil uygulama projesi. İşletme yönetimi için kapsamlı modüller içerir.

## ✨ Özellikler

- 📦 **Modüler Mimari** - Her modül bağımsız olarak geliştirilebilir
- 🌍 **Çoklu Dil Desteği** - i18n ile Türkçe ve İngilizce desteği
- 🎨 **Tema Desteği** - Light/Dark mode
- 🔐 **Güvenli Token Yönetimi** - Keychain/Keystore ile güvenli saklama
- 📡 **Offline-First** - Network olmadan da çalışabilme
- 🔄 **Akıllı Cache Yönetimi** - Otomatik cache cleanup ve size limit enforcement
- ✅ **Gelişmiş Validation** - Zod ile schema-based validation, async validation desteği
- 🧪 **Test Altyapısı** - Jest ve React Native Testing Library
- 🚀 **CI/CD Pipeline** - GitHub Actions ile otomatik test ve build
- 📊 **Error Tracking** - Sentry entegrasyonu

## 📚 Dokümantasyon

Tüm dokümantasyon [`docs/`](docs/) klasöründe bulunmaktadır.

### Hızlı Erişim

- **[📖 Dokümantasyon Ana Sayfası](docs/README.md)** - Tüm dokümantasyonun listesi
- **[🔧 Kurulum Kılavuzları](docs/setup/)** - Environment ve test kurulumu
- **[📖 Kullanım Kılavuzları](docs/guides/)** - Test, form template, permissions, API, caching, validation
- **[🔌 API Dokümantasyonu](docs/api/)** - API endpoint'leri
- **[💻 Geliştirme Dokümantasyonu](docs/development/)** - İyileştirmeler ve proje rehberi
- **[🗄️ Veritabanı Şeması](docs/database/)** - Database schema

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm start

# Android için
npm run android

# iOS için
npm run ios
```

## 📋 Gereksinimler

- Node.js 18+
- npm veya yarn
- Expo CLI
- Android Studio (Android için)
- Xcode (iOS için)

## 🔧 Yapılandırma

1. `.env` dosyası oluşturun (bkz: [Environment Setup](docs/setup/ENVIRONMENT_SETUP.md))
2. Gerekli environment variable'ları ayarlayın

## 🧪 Test

```bash
# Tüm testleri çalıştır
npm test

# Watch mode
npm run test:watch

# Coverage raporu
npm run test:coverage
```

Detaylı bilgi için: [Testing Guide](docs/guides/TESTING_GUIDE.md)

## 📝 Scripts

- `npm start` - Expo development server
- `npm run android` - Android emulator'da çalıştır
- `npm run ios` - iOS simulator'da çalıştır
- `npm run lint` - ESLint kontrolü
- `npm run lint:fix` - ESLint otomatik düzeltme
- `npm run format` - Prettier formatlama
- `npm run type-check` - TypeScript type kontrolü
- `npm test` - Testleri çalıştır

## 🏗️ Mimari

### Genel Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         PersistQueryClientProvider                    │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │           ThemeProvider                        │  │   │
│  │  │  ┌──────────────────────────────────────────┐ │  │   │
│  │  │  │      NavigationContainer                   │ │  │   │
│  │  │  │  ┌────────────────────────────────────┐  │ │  │   │
│  │  │  │  │      RootNavigator                  │  │ │  │   │
│  │  │  │  │  ┌──────────────────────────────┐ │  │ │  │   │
│  │  │  │  │  │   Module Screens              │ │  │ │  │   │
│  │  │  │  │  │   (List, Detail, Form, etc.)  │ │  │ │  │   │
│  │  │  │  │  └──────────────────────────────┘ │  │ │  │   │
│  │  │  │  └────────────────────────────────────┘  │ │  │   │
│  │  │  └──────────────────────────────────────────┘ │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────┐
│   Screens    │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Hooks      │────▶│   Services   │────▶│   API        │
│ (useApiQuery)│     │ (httpService)│     │ (Backend)    │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│ React Query  │     │   Cache      │
│   Cache      │     │   Manager    │
└──────────────┘     └──────────────┘
```

### State Management

```
┌─────────────────────────────────────────┐
│         Global State (Zustand)          │
│  ┌───────────────────────────────────┐  │
│  │      useAppStore                  │  │
│  │  - User, Role, Theme, Language    │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │      permissionsStore             │  │
│  │  - User Permissions               │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │      Module Stores                │  │
│  │  - Product, Sales, etc.           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 🏗️ Proje Yapısı

```
src/
├── core/                    # Core utilities, configs, services
│   ├── config/              # App configuration (API, navigation, permissions)
│   ├── constants/           # App constants (colors, spacing, typography)
│   ├── contexts/            # React contexts (Theme)
│   ├── hooks/               # Core hooks (API queries, form screens, etc.)
│   ├── navigation/          # Navigation configuration
│   ├── services/            # Core services (query client, cache, network)
│   ├── store/               # Global state stores
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions (validators, error handling)
├── modules/                 # Feature modules
│   ├── customers/           # Müşteri yönetimi
│   ├── employees/           # Çalışan yönetimi
│   ├── expenses/            # Gider yönetimi
│   ├── income/              # Gelir yönetimi
│   ├── products/            # Ürün yönetimi
│   ├── purchases/           # Satın alma yönetimi
│   ├── reports/             # Raporlar
│   ├── revenue/             # Gelir yönetimi
│   ├── sales/               # Satış yönetimi
│   └── suppliers/           # Tedarikçi yönetimi
├── shared/                  # Shared components, hooks, utils
│   ├── components/          # Reusable components
│   ├── hooks/               # Shared hooks
│   ├── layouts/             # Layout components
│   ├── services/            # Shared services
│   ├── store/               # Shared stores
│   ├── types/               # Shared types
│   └── utils/               # Shared utilities
├── screens/                 # Screen components (top-level screens)
├── i18n/                    # Internationalization (i18next)
├── localization/            # Localization utilities
├── mocks/                   # Mock data for development
└── store/                   # Root store configuration
```

### Modül Yapısı

Her modül aşağıdaki yapıyı takip eder:

```
modules/{module}/
├── components/          # Modül-specific components
├── config/             # Form configs, validators
├── hooks/              # Modül-specific hooks
├── screens/            # Modül screens (List, Detail, Form, Dashboard)
├── services/           # API services ve adapters
├── store/              # Modül-specific stores
└── utils/              # Modül-specific utilities
```

## 📦 Teknolojiler

### Core

- **React Native** (0.81.5) - Mobile framework
- **Expo** (~54.0.20) - Development platform
- **TypeScript** (~5.9.2) - Type safety
- **React** (19.1.0) - UI library

### State Management & Data Fetching

- **Zustand** (^5.0.8) - State management
- **React Query** (^5.90.5) - Data fetching, caching, synchronization
- **React Query Persist Client** - Cache persistence

### UI & Navigation

- **React Navigation** (^7.1.19) - Navigation
- **React Native Paper** (^5.14.5) - Material Design components
- **React Native Vector Icons** (^10.3.0) - Icon library

### Internationalization

- **i18next** (^25.6.0) - Internationalization framework
- **react-i18next** (^16.2.2) - React bindings

### Validation

- **Zod** (^3.25.76) - Schema validation

### Security & Storage

- **React Native Keychain** (^10.0.0) - Secure token storage
- **AsyncStorage** (^2.2.0) - Async storage

### Monitoring & Error Tracking

- **Sentry** (^5.34.0) - Error tracking and monitoring

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **Commitlint** - Commit message linting

## 🤝 Katkıda Bulunma

Katkıda bulunmak için lütfen [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını okuyun.

Kısa özet:

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (Conventional Commits formatında)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

Detaylı bilgi için: [CONTRIBUTING.md](CONTRIBUTING.md)

## 📝 Changelog

Değişiklik geçmişi için [CHANGELOG.md](CHANGELOG.md) dosyasına bakın.

## 🎯 Özellikler ve Modüller

### Mevcut Modüller

- **📦 Ürünler (Products)** - Ürün yönetimi, stok takibi, kategori yönetimi
- **💰 Satışlar (Sales)** - Satış işlemleri, borç takibi
- **🛒 Satın Almalar (Purchases)** - Satın alma işlemleri, tedarikçi yönetimi
- **👥 Müşteriler (Customers)** - Müşteri yönetimi, borç takibi
- **👷 Çalışanlar (Employees)** - Çalışan yönetimi, izin yönetimi
- **🏢 Tedarikçiler (Suppliers)** - Tedarikçi yönetimi
- **💸 Giderler (Expenses)** - Gider yönetimi, gider tipleri
- **💵 Gelirler (Revenue)** - Gelir yönetimi
- **📊 Raporlar (Reports)** - İş raporları ve analizler

### Özellikler

- ✅ **Form Templates** - Dinamik form şablonları
- ✅ **Permissions System** - Rol bazlı izin sistemi
- ✅ **Offline Support** - Offline çalışma desteği
- ✅ **Cache Management** - Akıllı cache yönetimi
- ✅ **Validation** - Schema-based ve async validation
- ✅ **Error Handling** - Kapsamlı hata yönetimi
- ✅ **Monitoring** - Sentry ile error tracking

## 🔒 Güvenlik

- Token'lar Keychain/Keystore'da güvenli şekilde saklanır
- HTTPS zorunludur
- Secure storage service ile merkezi token yönetimi

## 📄 Lisans

Bu proje özel bir projedir.

---

Daha fazla bilgi için [dokümantasyon](docs/README.md) klasörüne bakın.
