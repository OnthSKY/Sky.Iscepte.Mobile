# Certificate Pinning - Güvenlik İyileştirmesi

## 🔒 Neden Certificate Pinning?

Certificate pinning, man-in-the-middle (MITM) saldırılarına karşı uygulamanızı korur. HTTPS trafiğini dinlemeye çalışan saldırganlar, sahte sertifikalar kullanarak trafiği yakalayabilir. Certificate pinning ile sadece belirli sertifikaların kabul edilmesini sağlarsınız.

### Güvenlik Faydaları

- ✅ **Man-in-the-middle saldırılarına karşı koruma**
- ✅ **Sahte sertifikalarla trafik dinleme engellenir**
- ✅ **Token'lar ve hassas veriler korunur**
- ✅ **OWASP Mobile Top 10 güvenlik önerisi**
- ✅ **GDPR/KVKK uyumluluğu**

## 📋 Gereksinimler

1. **API domain'iniz** (örn: `api.example.com`)
2. **Certificate SHA-256 hash'leri** (public key hash'leri)
3. **Expo managed workflow** veya **bare workflow**

## 🚀 Kurulum

### 1. Certificate Hash'lerini Alma

API domain'iniz için SHA-256 hash'lerini alın:

#### Linux/macOS:

```bash
DOMAIN="api.example.com"
echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64
```

#### Windows (PowerShell):

```powershell
# OpenSSL kurulu olmalı
$domain = "api.example.com"
$cert = (New-Object System.Net.Security.RemoteCertificateValidationCallback { $true })
# OpenSSL komutunu kullanın veya online tool kullanın
```

#### Online Tool:

1. [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com)
2. Certificate detaylarından public key hash'ini alın

### 2. Configuration Dosyasını Güncelleme

`src/core/config/certificatePinningConfig.ts` dosyasını düzenleyin:

```typescript
export function getPinnedCertificates(): PinnedCertificate[] {
  const apiUrl = new URL(appConfig.apiBaseUrl);
  const apiDomain = apiUrl.hostname;

  return [
    {
      domain: apiDomain, // Örn: 'api.example.com'
      publicKeyHashes: [
        'YOUR_SHA256_HASH_HERE', // Gerçek hash'inizi buraya ekleyin
        'BACKUP_SHA256_HASH', // Certificate rotation için backup hash
      ],
      includeSubdomains: false, // Sadece exact domain
    },
  ];
}
```

### 3. Expo Config Plugin'i Aktifleştirme

`app.config.js` dosyasında plugin'i aktifleştirin:

```javascript
plugins: [
  [
    'expo-notifications',
    {
      icon: './assets/icon.png',
      color: '#ffffff',
      sounds: [],
    },
  ],
  // Certificate Pinning Plugin
  [
    './plugins/withCertificatePinning.js',
    {
      android: {
        domains: ['api.example.com'], // Gerçek API domain'iniz
        publicKeyHashes: [
          'YOUR_SHA256_HASH_HERE', // Gerçek hash'iniz
          'BACKUP_SHA256_HASH', // Backup hash
        ],
      },
      ios: {
        domains: ['api.example.com'], // Gerçek API domain'iniz
        allowArbitraryLoads: false, // Production'da false olmalı
      },
    },
  ],
],
```

### 4. Native Build

Plugin'i aktifleştirdikten sonra native build yapın:

```bash
# Prebuild (native dosyaları oluştur)
npx expo prebuild

# Android build
npx expo run:android

# iOS build
npx expo run:ios
```

## 🔧 Kullanım

Certificate pinning otomatik olarak çalışır. Uygulama başlangıcında `App.tsx` içinde initialize edilir:

```typescript
// App.tsx içinde otomatik initialize edilir
useEffect(() => {
  import('./src/core/services/certificatePinningService')
    .then(({ initializeCertificatePinning }) => {
      return initializeCertificatePinning();
    })
    .catch((error) => {
      console.warn('Failed to initialize certificate pinning:', error);
    });
}, []);
```

### Development Mode

Development/mock mode'da certificate pinning otomatik olarak devre dışıdır:

```typescript
// certificatePinningConfig.ts
if (appConfig.mode === 'mock' || __DEV__) {
  return []; // Certificate pinning devre dışı
}
```

### Production Mode

Production'da (`APP_MODE=api`) certificate pinning aktif olur ve tüm API istekleri kontrol edilir.

## 📱 Platform-Specific Implementation

### Android

Android'de `network_security_config.xml` dosyası otomatik oluşturulur:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="false">
    <trust-anchors>
      <certificates src="system" />
    </trust-anchors>
  </base-config>
  <domain-config cleartextTrafficPermitted="false">
    <domain includeSubdomains="false">api.example.com</domain>
    <pin-set expiration="2025-12-31">
      <pin digest="SHA-256">YOUR_SHA256_HASH</pin>
      <pin digest="SHA-256">BACKUP_SHA256_HASH</pin>
    </pin-set>
  </domain-config>
</network-security-config>
```

Bu dosya `app/src/main/res/xml/network_security_config.xml` konumunda oluşturulur.

### iOS

iOS'da App Transport Security (ATS) yapılandırılır. Certificate pinning için native code gerekir:

1. **Info.plist** otomatik güncellenir (ATS config)
2. **Native certificate pinning** için Swift/Objective-C kodu eklenmeli

#### iOS Native Implementation (Opsiyonel)

iOS için tam certificate pinning için native modül ekleyin:

```swift
// ios/YourApp/NetworkSecurity.swift
import Foundation

class CertificatePinningDelegate: NSObject, URLSessionDelegate {
    func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge, completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        // Certificate pinning logic
        // ...
    }
}
```

## ⚠️ Önemli Notlar

### Certificate Rotation

1. **Backup hash ekleyin**: Certificate rotation için en az 2 hash ekleyin
2. **Expiration date**: Android'de `pin-set expiration` ayarlayın
3. **Monitoring**: Certificate değişikliklerini izleyin

### Development vs Production

- **Development**: Certificate pinning devre dışı (mock mode)
- **Production**: Certificate pinning aktif (api mode)

### Hata Durumları

Certificate validation başarısız olursa:

```typescript
// httpService.ts içinde
if (!isValid) {
  const error = new Error('Certificate validation failed. Possible man-in-the-middle attack.');
  error.name = 'CertificatePinningError';
  throw error;
}
```

Kullanıcıya anlamlı bir hata mesajı gösterilir.

## 🧪 Test Etme

### 1. Certificate Pinning Test

```bash
# Charles Proxy veya benzeri tool ile MITM saldırısı simüle edin
# Uygulama bağlantıyı reddetmeli
```

### 2. Development Mode Test

```bash
# Mock mode'da certificate pinning devre dışı olmalı
APP_MODE=mock npm start
```

### 3. Production Mode Test

```bash
# API mode'da certificate pinning aktif olmalı
APP_MODE=api npm start
```

## 🔍 Troubleshooting

### Problem: Certificate validation başarısız

**Çözüm:**

1. Hash'lerin doğru olduğundan emin olun
2. Certificate rotation olup olmadığını kontrol edin
3. Backup hash ekleyin

### Problem: Development'ta çalışmıyor

**Çözüm:**

- Development mode'da certificate pinning devre dışıdır (normal)
- Production build yapın

### Problem: iOS'ta çalışmıyor

**Çözüm:**

- iOS için native certificate pinning kodu eklenmeli
- Şu an sadece ATS config var, native code gerekli

## 📚 Kaynaklar

- [OWASP Certificate Pinning](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning)
- [Android Network Security Config](https://developer.android.com/training/articles/security-config)
- [iOS App Transport Security](https://developer.apple.com/documentation/security/preventing_insecure_network_connections)
- [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)

## ✅ Checklist

- [ ] Certificate hash'leri alındı
- [ ] `certificatePinningConfig.ts` güncellendi
- [ ] `app.config.js` plugin aktifleştirildi
- [ ] Native build yapıldı (`npx expo prebuild`)
- [ ] Android test edildi
- [ ] iOS test edildi (native code eklendi)
- [ ] Production build test edildi
- [ ] Certificate rotation planlandı

---

**Son Güncelleme:** 2025-02-18
