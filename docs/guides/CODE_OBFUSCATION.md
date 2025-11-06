# Code Obfuscation - Güvenlik İyileştirmesi

## 🔒 Neden Code Obfuscation?

Code obfuscation, production build'lerde kodunuzu karmaşıklaştırarak reverse engineering'i zorlaştırır. Bu sayede:

- ✅ **API key'ler ve secrets korunur**
- ✅ **Business logic gizlenir**
- ✅ **Reverse engineering zorlaştırılır**
- ✅ **Kod analizi engellenir**
- ✅ **OWASP Mobile Top 10 güvenlik önerisi**

## 📋 Platform Desteği

### Android ✅

- **ProGuard/R8** - Tam destek
- **Minification** - Aktif
- **Resource shrinking** - Aktif

### iOS ⚠️

- **Build optimization** - Xcode build settings ile
- **Swift obfuscation** - Üçüncü taraf araçlar gerekir (opsiyonel)
- **JavaScript minification** - Metro bundler ile (zaten aktif)

### JavaScript ✅

- **Minification** - Metro bundler ile otomatik (production build'lerde)
- **Tree shaking** - Otomatik
- **Code splitting** - Otomatik

## 🚀 Kurulum

### 1. Plugin Aktifleştirme

`app.config.js` dosyasında plugin zaten ekli:

```javascript
plugins: [
  [
    './plugins/withCodeObfuscation.js',
    {
      android: {
        enableProguard: true,
        enableR8: true,
      },
      ios: {
        enableOptimization: true,
      },
    },
  ],
],
```

### 2. ProGuard Rules

`android/app/proguard-rules.pro` dosyası otomatik oluşturulur. Bu dosya:

- React Native core class'larını korur
- Expo modüllerini korur
- Third-party library'leri korur
- Reflection kullanan kodları korur

### 3. Native Build

Plugin'i aktifleştirdikten sonra native build yapın:

```bash
# Prebuild (native dosyaları oluştur)
npx expo prebuild

# Android production build
npx expo run:android --variant release

# iOS production build (macOS gerekli)
npx expo run:ios --configuration Release
```

## 🔧 Android Obfuscation

### ProGuard/R8 Ayarları

Plugin otomatik olarak şunları yapar:

1. **Gradle Properties:**

   ```properties
   android.enableR8.fullMode=true
   android.enableProguard=true
   ```

2. **Build.gradle:**
   ```groovy
   buildTypes {
       release {
           minifyEnabled true
           shrinkResources true
           proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
       }
   }
   ```

### ProGuard Rules Özelleştirme

`android/app/proguard-rules.pro` dosyasını düzenleyerek:

- Yeni library'ler için keep rules ekleyin
- Reflection kullanan kodları koruyun
- Custom exception'ları koruyun

**Örnek:**

```proguard
# Custom library
-keep class com.example.mylibrary.** { *; }
-dontwarn com.example.mylibrary.**

# Reflection kullanan class
-keep class com.example.MyReflectionClass { *; }
```

## 📱 iOS Obfuscation

### Build Settings

iOS için obfuscation Xcode build settings ile yapılır:

1. **Xcode'da projeyi açın:**

   ```bash
   npx expo prebuild
   open ios/YourApp.xcworkspace
   ```

2. **Build Settings'de:**
   - **Optimization Level**: `-Os` (Size optimization)
   - **Strip Debug Symbols**: `YES`
   - **Deployment Target**: Minimum iOS version

3. **Swift Compiler - Code Generation:**
   - **Optimization Level**: `-O` (Optimize for speed) veya `-Os` (Optimize for size)

### Swift Obfuscation (Opsiyonel)

Swift için üçüncü taraf araçlar:

- **SwiftShield** - Swift code obfuscation
- **iXGuard** - Commercial obfuscation tool

**Not:** Expo managed workflow'da Swift obfuscation için native modül gerekir.

## 🧪 Test Etme

### 1. Development Build

Development build'de obfuscation **devre dışı** olmalı:

```bash
# Development build (obfuscation yok)
npx expo run:android
npx expo run:ios
```

### 2. Production Build

Production build'de obfuscation **aktif**:

```bash
# Android release build
npx expo run:android --variant release

# iOS release build
npx expo run:ios --configuration Release
```

### 3. Obfuscation Kontrolü

Obfuscation'ın çalıştığını kontrol etmek için:

**Android:**

```bash
# APK/AAB dosyasını analiz edin
# Class isimleri obfuscated olmalı (a, b, c gibi)
```

**iOS:**

```bash
# IPA dosyasını analiz edin
# Symbol'ler stripped olmalı
```

## ⚠️ Önemli Notlar

### Debugging

Obfuscation sonrası debugging zorlaşır:

1. **Mapping file'ları saklayın:**
   - Android: `mapping.txt` (ProGuard output)
   - iOS: `dSYM` files

2. **Crash reporting:**
   - Sentry gibi tool'lar mapping file'ları kullanarak stack trace'leri deobfuscate eder

### ProGuard Rules

Yanlış ProGuard rules uygulama çökmesine neden olabilir:

1. **Test edin:** Production build'i mutlaka test edin
2. **Keep rules:** Reflection kullanan kodları koruyun
3. **Library rules:** Kullandığınız library'lerin ProGuard rules'larını ekleyin

### Performance

Obfuscation build süresini artırır:

- **Android:** Build süresi %20-30 artabilir
- **iOS:** Build süresi minimal artar

### Bundle Size

Obfuscation bundle size'ı azaltır:

- **Android:** %10-20 küçülme
- **iOS:** Minimal küçülme

## 🔍 Troubleshooting

### Problem: Uygulama çöküyor

**Çözüm:**

1. ProGuard rules'ları kontrol edin
2. Reflection kullanan class'ları koruyun
3. Library documentation'larına bakın

### Problem: Build başarısız

**Çözüm:**

1. Gradle sync yapın
2. Clean build yapın: `cd android && ./gradlew clean`
3. ProGuard rules syntax'ını kontrol edin

### Problem: Obfuscation çalışmıyor

**Çözüm:**

1. Release build yaptığınızdan emin olun
2. `minifyEnabled true` olduğunu kontrol edin
3. Plugin'in aktif olduğunu kontrol edin

## 📚 Kaynaklar

- [Android ProGuard](https://developer.android.com/studio/build/shrink-code)
- [R8 Full Mode](https://developer.android.com/studio/build/shrink-code#full-mode)
- [Expo Build Properties](https://docs.expo.dev/versions/latest/sdk/build-properties/)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)

## ✅ Checklist

- [ ] Plugin `app.config.js`'de aktif
- [ ] `proguard-rules.pro` dosyası oluşturuldu
- [ ] Native build yapıldı (`npx expo prebuild`)
- [ ] Android release build test edildi
- [ ] iOS release build test edildi (opsiyonel)
- [ ] ProGuard rules özelleştirildi (gerekirse)
- [ ] Mapping file'ları saklanıyor (Sentry için)
- [ ] Production build test edildi

---

**Son Güncelleme:** 2025-02-18
