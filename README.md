# Sky.Template.Mobile

React Native (Expo) tabanlı mobil uygulama projesi.

## 📚 Dokümantasyon

Tüm dokümantasyon [`docs/`](docs/) klasöründe bulunmaktadır.

### Hızlı Erişim

- **[📖 Dokümantasyon Ana Sayfası](docs/README.md)** - Tüm dokümantasyonun listesi
- **[🔧 Kurulum Kılavuzları](docs/setup/)** - Environment ve test kurulumu
- **[📖 Kullanım Kılavuzları](docs/guides/)** - Test, form template, permissions
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

## 🏗️ Proje Yapısı

```
src/
├── core/           # Core utilities, configs, services
├── modules/        # Feature modules (products, sales, etc.)
├── shared/         # Shared components, hooks, utils
├── screens/         # Screen components
├── i18n/           # Internationalization
└── store/          # State management
```

## 📦 Teknolojiler

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Query** - Data fetching
- **Zustand** - State management
- **React Navigation** - Navigation
- **i18next** - Internationalization
- **Sentry** - Error tracking

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje özel bir projedir.

---

Daha fazla bilgi için [dokümantasyon](docs/README.md) klasörüne bakın.

