# Environment Configuration Kılavuzu

Bu dokümantasyon, projede environment variable'ların nasıl yönetileceğini açıklar.

## 📋 Kurulum

### 1. .env Dosyası Oluşturma

Proje root dizininde `.env` dosyası oluşturun:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### 2. .env Dosyası İçeriği

`.env` dosyanız şu şekilde olmalı:

```env
# Application
APP_VERSION=0.1.0
NODE_ENV=development

# API Configuration
API_URL=https://api.example.com
APP_MODE=mock

# App Settings
DEFAULT_LOCALE=tr
DEFAULT_THEME=light

# Build Configuration
IOS_BUILD_NUMBER=1
ANDROID_VERSION_CODE=1

# Monitoring & Analytics
SENTRY_DSN=

# Environment
# Options: development, staging, production
ENVIRONMENT=development
```

## 🔧 Environment Değişkenleri

### API Configuration

- **API_URL**: Backend API URL'i
  - Development: `http://localhost:3000`
  - Staging: `https://staging-api.example.com`
  - Production: `https://api.example.com`

- **APP_MODE**: Uygulama modu
  - `mock`: Mock servisler kullanılır
  - `api`: Gerçek API kullanılır

### App Settings

- **DEFAULT_LOCALE**: Varsayılan dil
  - `tr`: Türkçe
  - `en`: İngilizce

- **DEFAULT_THEME**: Varsayılan tema
  - `light`: Açık tema
  - `dark`: Koyu tema

### Build Configuration

- **IOS_BUILD_NUMBER**: iOS build numarası
- **ANDROID_VERSION_CODE**: Android version code

### Monitoring

- **SENTRY_DSN**: Sentry DSN (opsiyonel)
- **ENVIRONMENT**: Environment adı (development, staging, production)

## 🌍 Farklı Environment'lar

### Development

`.env` dosyası:
```env
NODE_ENV=development
API_URL=http://localhost:3000
APP_MODE=mock
ENVIRONMENT=development
```

### Staging

`.env.staging` dosyası oluşturun:
```env
NODE_ENV=production
API_URL=https://staging-api.example.com
APP_MODE=api
ENVIRONMENT=staging
SENTRY_DSN=your-staging-sentry-dsn
```

### Production

`.env.production` dosyası oluşturun:
```env
NODE_ENV=production
API_URL=https://api.example.com
APP_MODE=api
ENVIRONMENT=production
SENTRY_DSN=your-production-sentry-dsn
```

## 📱 Kullanım

### app.config.js

Environment değişkenleri `app.config.js` dosyasından okunur:

```javascript
extra: {
  API_URL: process.env.API_URL || 'https://api.example.com',
  DEFAULT_LOCALE: process.env.DEFAULT_LOCALE || 'tr',
  APP_MODE: process.env.APP_MODE || 'mock',
}
```

### Kod İçinde Kullanım

```typescript
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.API_URL;
const appMode = Constants.expoConfig?.extra?.APP_MODE;
```

Veya `appConfig` kullanarak:

```typescript
import { appConfig } from './core/config/appConfig';

const apiUrl = appConfig.apiBaseUrl;
const appMode = appConfig.mode;
```

## 🔒 Güvenlik

### ⚠️ ÖNEMLİ

1. **`.env` dosyasını ASLA commit etmeyin**
   - `.gitignore` dosyasında zaten var
   - Hassas bilgileri içerir

2. **`.env.example` dosyasını commit edin**
   - Örnek değerlerle
   - Hassas bilgiler olmadan

3. **Production secrets**
   - CI/CD pipeline'da environment variable olarak ayarlayın
   - Veya secure storage kullanın

## 🚀 Build ve Deploy

### Development Build

```bash
npm start
```

### Production Build

```bash
# .env.production dosyasını kullan
NODE_ENV=production expo build:android
NODE_ENV=production expo build:ios
```

### EAS Build

EAS Build'de environment variable'ları EAS dashboard'dan ayarlayın veya `eas.json` dosyasında tanımlayın.

## 📝 Örnek Senaryolar

### Senaryo 1: Local Development

```env
API_URL=http://localhost:3000
APP_MODE=mock
ENVIRONMENT=development
```

### Senaryo 2: Staging Test

```env
API_URL=https://staging-api.example.com
APP_MODE=api
ENVIRONMENT=staging
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Senaryo 3: Production

```env
API_URL=https://api.example.com
APP_MODE=api
ENVIRONMENT=production
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## 🔍 Troubleshooting

### Problem: Environment değişkenleri okunmuyor

**Çözüm:**
1. `.env` dosyasının root dizinde olduğundan emin olun
2. `app.config.js` dosyasının doğru olduğundan emin olun
3. Expo server'ı yeniden başlatın: `npm start -- --clear`

### Problem: Build'de environment değişkenleri çalışmıyor

**Çözüm:**
1. EAS Build kullanıyorsanız, EAS dashboard'dan environment variable'ları ayarlayın
2. Local build için `.env` dosyasının doğru olduğundan emin olun

## 📚 İlgili Dosyalar

- `app.config.js` - Expo configuration (environment değişkenlerini okur)
- `src/core/config/appConfig.ts` - App configuration (kod içinde kullanım)
- `.env.example` - Örnek environment dosyası (manuel oluşturulmalı)
- `.gitignore` - `.env` dosyası ignore edilir

---

**Not:** `.env.example` dosyasını manuel olarak oluşturmanız gerekiyor. Yukarıdaki örnek içeriği kullanabilirsiniz.

